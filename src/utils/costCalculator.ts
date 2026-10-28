/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 核心計算引擎
 */

import { Quotation, CalculatedCostSummary, TierCostResult } from '../types';

/**
 * 核心成本試算函式
 * 嚴格遵循塑膠射出工程標準公式與規格書三項規定
 */
export function calculateQuotationCost(
  quote: Quotation,
  overrideQuantity?: number
): CalculatedCostSummary {
  const quantity = overrideQuantity && overrideQuantity > 0 ? overrideQuantity : (quote.commercial.orderQuantity || 1000);
  const cavities = Math.max(1, quote.molding.cavities || 1);
  const yieldRate = Math.max(0.01, Math.min(100, quote.molding.yieldRatePct || 98)) / 100; // 0.98

  // 1. 材料單重與耗料計算
  const partWeightG = quote.material.partWeightG || 0;
  const runnerWeightG = quote.material.runnerWeightG || 0;
  // 每件分攤之料頭重 (g)
  const runnerPerPartG = runnerWeightG / cavities;
  // 單件總耗料生重 (成品 + 分攤料頭, g)
  const grossMaterialWeightPerPartG = partWeightG + runnerPerPartG;

  // 原料與回收料混合折算
  const virginRatio = Math.max(0, 1 - (quote.material.regrindRatioPct || 0) / 100);
  const regrindRatio = (quote.material.regrindRatioPct || 0) / 100;
  const regrindDiscount = (quote.material.regrindDiscountPct || 0) / 100;
  
  // 新料單價
  const rawMaterialPrice = quote.material.materialPricePerKg || 0;
  // 次料等效單價 (通常以原價打折計，如打 8 折即折價 20%)
  const effectiveRegrindPrice = rawMaterialPrice * (1 - regrindDiscount);
  // 添加劑/色母分攤
  const additiveRatio = (quote.material.additiveRatioPct || 0) / 100;
  const additivePrice = quote.material.additivePricePerKg || 0;
  
  // 每公斤原料加權成本
  const effectiveMaterialPricePerKg = 
    (virginRatio * rawMaterialPrice) + 
    (regrindRatio * effectiveRegrindPrice) + 
    (additiveRatio * additivePrice);

  // 材料損耗率 (料桶殘留、烘料揮發、飛邊刮除等)
  const lossMultiplier = 1 + ((quote.material.materialLossRatePct || 0) / 100);

  // 單件材料成本: (單件生重g / 1000) * 每kg成本 * 損耗倍數 / 成型良率 (因不良品耗料亦由良品吸收)
  // 如果次料能完全在線粉碎回用，料頭折損已由 regrindDiscount 調整
  const materialCostPerPart = 
    ((grossMaterialWeightPerPartG / 1000) * effectiveMaterialPricePerKg * lossMultiplier) / yieldRate;

  // 2. 成型成本計算 (加工費)
  // 每小時可射出模次
  const cycleTimeSec = Math.max(1, quote.molding.cycleTimeSec || 20);
  const shotsPerHour = 3600 / cycleTimeSec;
  // 每小時預估良品產出數 = shotsPerHour * cavities * yieldRate
  const goodPartsPerHour = shotsPerHour * cavities * yieldRate;
  // 單件成型費 = 機台每小時費率 / 每小時良品產出數
  const machineRatePerHour = quote.molding.machineRatePerHour || 0;
  const moldingCostPerPart = goodPartsPerHour > 0 ? machineRatePerHour / goodPartsPerHour : 0;

  // 3. 換模與調機成本分攤
  // 基本固定費用 (換模工資、吊模具、接水電冷卻管)
  const baseSetupFee = quote.setup.setupFixedFee || 0;
  // 換模工時費 (機台待機或人工)
  const changeoverHours = quote.setup.changeoverHours || 0;
  const changeoverMachineStandbyFee = changeoverHours * machineRatePerHour * 0.5; // 待機以半價時費計
  // 洗管清料耗損 (kg * 原料價)
  const purgeResinCost = (quote.setup.purgeResinKg || 0) * rawMaterialPrice;
  // 試模校車模次耗損 (模數 * 每次射出總重kg * 原料價)
  const shotTotalWeightKg = ((partWeightG * cavities) + runnerWeightG) / 1000;
  const trialShotLossCost = (quote.setup.trialShots || 0) * shotTotalWeightKg * rawMaterialPrice;

  // 整批換模調機總成本
  const totalSetupBatchCost = baseSetupFee + changeoverMachineStandbyFee + purgeResinCost + trialShotLossCost;
  // 單件分攤換模調機費 = 總換模調機成本 / 該批良品數量
  const setupCostPerPart = quantity > 0 ? totalSetupBatchCost / quantity : 0;

  // 4. 後加工成本計算 (單件各項目加總)
  const post = quote.postProcess;
  const postProcessCostPerPart = 
    (post.gateTrimmingUnitCost || 0) +
    (post.ultrasonicUnitCost || 0) +
    (post.printingUnitCost || 0) +
    (post.assemblyUnitCost || 0) +
    (post.packagingUnitCost || 0) +
    (post.inspectionUnitCost || 0) +
    (post.transportationUnitCost || 0);

  // 5. 直接製造成本 (Direct COGS)
  const directManufacturingCost = 
    materialCostPerPart + 
    moldingCostPerPart + 
    setupCostPerPart + 
    postProcessCostPerPart;

  // 6. 廠務管理與管銷費用 (SG&A)
  const managementExpenseRate = (quote.commercial.managementExpenseRatePct || 8) / 100;
  const managementExpensePerPart = directManufacturingCost * managementExpenseRate;

  // 7. 單件總成本
  const totalUnitCost = directManufacturingCost + managementExpensePerPart;

  // 8. 建議售價與目標毛利
  // 售價公式: 總成本 / (1 - 目標毛利率)
  const targetMargin = Math.min(0.95, Math.max(0.01, (quote.commercial.targetGrossMarginPct || 25) / 100));
  const suggestedUnitPrice = totalUnitCost / (1 - targetMargin);
  const grossProfitPerPart = suggestedUnitPrice - totalUnitCost;
  const actualGrossMarginPct = suggestedUnitPrice > 0 ? (grossProfitPerPart / suggestedUnitPrice) * 100 : 0;

  // 9. 整批總額彙總
  const batchTotalManufacturingCost = totalUnitCost * quantity;
  const batchTotalRevenue = suggestedUnitPrice * quantity;
  const batchTotalGrossProfit = grossProfitPerPart * quantity;

  return {
    grossMaterialWeightPerPartG: roundTo(grossMaterialWeightPerPartG, 2),
    effectiveMaterialPricePerKg: roundTo(effectiveMaterialPricePerKg, 2),
    materialCostPerPart: roundTo(materialCostPerPart, 2),

    shotsPerHour: roundTo(shotsPerHour, 1),
    goodPartsPerHour: roundTo(goodPartsPerHour, 1),
    moldingCostPerPart: roundTo(moldingCostPerPart, 2),

    totalSetupBatchCost: roundTo(totalSetupBatchCost, 0),
    setupCostPerPart: roundTo(setupCostPerPart, 2),

    postProcessCostPerPart: roundTo(postProcessCostPerPart, 2),

    directManufacturingCost: roundTo(directManufacturingCost, 2),
    managementExpensePerPart: roundTo(managementExpensePerPart, 2),
    totalUnitCost: roundTo(totalUnitCost, 2),

    suggestedUnitPrice: roundTo(suggestedUnitPrice, 2),
    grossProfitPerPart: roundTo(grossProfitPerPart, 2),
    actualGrossMarginPct: roundTo(actualGrossMarginPct, 1),

    batchTotalManufacturingCost: roundTo(batchTotalManufacturingCost, 0),
    batchTotalRevenue: roundTo(batchTotalRevenue, 0),
    batchTotalGrossProfit: roundTo(batchTotalGrossProfit, 0),
  };
}

/**
 * 試算多批量階梯報價 (Tiered Quantities Pricing Matrix)
 */
export function calculateTieredPricing(
  quote: Quotation,
  quantities?: number[]
): TierCostResult[] {
  const tiers = quantities && quantities.length > 0 
    ? quantities 
    : (quote.commercial.tieredQuantities?.length ? quote.commercial.tieredQuantities : [1000, 3000, 5000, 10000, 20000, 50000]);

  return tiers.map(qty => {
    const summary = calculateQuotationCost(quote, qty);
    return {
      quantity: qty,
      materialCost: summary.materialCostPerPart,
      moldingCost: summary.moldingCostPerPart,
      setupCost: summary.setupCostPerPart,
      postProcessCost: summary.postProcessCostPerPart,
      managementCost: summary.managementExpensePerPart,
      totalCost: summary.totalUnitCost,
      suggestedPrice: summary.suggestedUnitPrice,
      grossMarginPct: summary.actualGrossMarginPct,
      totalRevenue: summary.batchTotalRevenue,
    };
  });
}

/**
 * 快速互動原型試算函式 (用於規格書第三節「互動式報價試算範例」)
 */
export interface SimpleQuoteInput {
  materialPricePerKg: number; // 材料單價（元/kg）
  materialWeightPerPartG: number; // 單模可分攤耗料重（g）
  cycleTimeSec: number; // 成型週期（秒）
  cavities: number; // 每模良品穴數
  machineRatePerHour: number; // 機台費率（元/時）
  orderQuantity: number; // 報價數量（件）
  batchSetupCost: number; // 每批換模調機費（元）
  yieldRatePct: number; // 預估良率（%）
  targetGrossMarginPct: number; // 目標毛利率（%）
}

export interface SimpleQuoteOutput {
  materialCost: number;
  moldingCost: number;
  setupCost: number;
  totalUnitCost: number;
  suggestedPrice: number;
  grossProfit: number;
  actualGrossMargin: number;
}

export function calculateSimpleInteractiveQuote(input: SimpleQuoteInput): SimpleQuoteOutput {
  const yieldRate = Math.max(0.01, input.yieldRatePct) / 100;
  const cavities = Math.max(1, input.cavities);
  const qty = Math.max(1, input.orderQuantity);

  // 材料成本: 材料耗料重g/1000 * 單價 / 良率
  const rawMaterialCost = ((input.materialWeightPerPartG / 1000) * input.materialPricePerKg) / yieldRate;

  // 成型成本: (成型週期 / 3600) * 機台費率 / (穴數 * 良率)
  const moldingCost = (input.cycleTimeSec / 3600) * input.machineRatePerHour / (cavities * yieldRate);

  // 換模調機分攤: 換模費 / 數量
  const setupCost = input.batchSetupCost / qty;

  // 預估單件成本
  const totalUnitCost = rawMaterialCost + moldingCost + setupCost;

  // 建議單件報價 = 總成本 / (1 - 毛利率)
  const marginRatio = Math.max(0.01, Math.min(95, input.targetGrossMarginPct)) / 100;
  const suggestedPrice = totalUnitCost / (1 - marginRatio);

  const grossProfit = suggestedPrice - totalUnitCost;

  return {
    materialCost: roundTo(rawMaterialCost, 2),
    moldingCost: roundTo(moldingCost, 2),
    setupCost: roundTo(setupCost, 2),
    totalUnitCost: roundTo(totalUnitCost, 2),
    suggestedPrice: roundTo(suggestedPrice, 2),
    grossProfit: roundTo(grossProfit, 2),
    actualGrossMargin: roundTo((grossProfit / suggestedPrice) * 100, 1),
  };
}

/**
 * 檢查詢價資料完整度與審核風險 (F02, F08)
 */
export interface CompletenessAndAuditCheck {
  isComplete: boolean;
  missingFields: string[];
  requiresApproval: boolean;
  flagReasons: string[];
}

export function checkQuotationCompletenessAndAudit(quote: Quotation): CompletenessAndAuditCheck {
  const missingFields: string[] = [];
  const flagReasons: string[] = [];

  // 1. 必填檢核 (規格書要求: 缺少重量、材質或數量時提示補件)
  if (!quote.client.name.trim()) missingFields.push('客戶名稱');
  if (!quote.product.partName.trim()) missingFields.push('產品品名');
  if (!quote.product.partNumber.trim()) missingFields.push('客戶料號');
  if (!quote.material.materialName.trim()) missingFields.push('塑膠材質');
  if (!quote.material.partWeightG || quote.material.partWeightG <= 0) missingFields.push('成品單重 (g)');
  if (!quote.commercial.orderQuantity || quote.commercial.orderQuantity <= 0) missingFields.push('報價數量 (件)');
  if (!quote.molding.machineTonnage || quote.molding.machineTonnage <= 0) missingFields.push('射出機台噸數');

  // 2. 審核觸發規則 (F08 規格: 毛利低於門檻、材料價格異常或特殊製程時提醒審核)
  const minThreshold = quote.approval?.minMarginThreshold || 20;
  if (quote.commercial.targetGrossMarginPct < minThreshold) {
    flagReasons.push(`目標毛利率 (${quote.commercial.targetGrossMarginPct}%) 低於安全門檻 (${minThreshold}%)`);
  }
  if (quote.molding.yieldRatePct < 92) {
    flagReasons.push(`預估成型良率過低 (${quote.molding.yieldRatePct}%)，需工程確認成型難度`);
  }
  if (quote.material.materialPricePerKg > 150) {
    flagReasons.push(`高價工程塑料 (NT$ ${quote.material.materialPricePerKg}/kg)，需複核原廠最新期貨牌價`);
  }
  if (quote.commercial.orderQuantity < (quote.commercial.moq || 1000)) {
    flagReasons.push(`訂購量低於建議最低起訂量 (MOQ: ${quote.commercial.moq || 1000} 件)`);
  }
  if (quote.molding.machineTonnage >= 500) {
    flagReasons.push(`使用 500T 以上重型機台，需核准排程產能與廠房電力負荷`);
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    requiresApproval: flagReasons.length > 0,
    flagReasons,
  };
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

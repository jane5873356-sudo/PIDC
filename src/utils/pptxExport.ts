/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - PowerPoint (.pptx) 簡報匯出引擎
 */

import pptxgen from 'pptxgenjs';
import { Quotation } from '../types';
import { calculateQuotationCost, calculateTieredPricing } from './costCalculator';

export async function exportQuotationToPptx(quote: Quotation): Promise<void> {
  const pptx = new pptxgen();
  const cost = calculateQuotationCost(quote);
  const tiers = calculateTieredPricing(quote);

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = '久揚塑膠股份有限公司 JIOU YANG PLASTIC';
  pptx.company = '久揚塑膠股份有限公司';
  pptx.title = `${quote.quoteNumber} - ${quote.product.partName} 成本報價簡報`;

  // 主題配色
  const C_NAVY = '0F172A'; // 深藍灰
  const C_BLUE = '1E40AF'; // 企業藍
  const C_ACCENT = '2563EB'; // 亮藍
  const C_SLATE = '475569'; // 內文灰
  const C_LIGHT = 'F8FAFC'; // 淺底
  const C_WHITE = 'FFFFFF';
  const C_EMERALD = '059669'; // 綠色毛利
  const C_AMBER = 'D97706'; // 警示橘

  // ==========================================
  // SLIDE 1: 封面 (Cover Slide)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { color: C_NAVY };

  // 頂部裝飾色塊
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.25,
    fill: { color: C_ACCENT },
  });

  // 公司名稱
  slide1.addText('久揚塑膠股份有限公司 ｜ JIOU YANG PLASTIC CO., LTD.', {
    x: 1.0,
    y: 1.5,
    w: 11.3,
    h: 0.5,
    fontSize: 16,
    color: '94A3B8',
    bold: true,
  });

  // 簡報大標題
  slide1.addText('塑膠射出零件成本核算與正式報價簡報', {
    x: 1.0,
    y: 2.1,
    w: 11.3,
    h: 1.0,
    fontSize: 34,
    color: C_WHITE,
    bold: true,
  });

  // 零件名稱與料號
  slide1.addText(`專案品名：${quote.product.partName}\n客戶料號：${quote.product.partNumber} ｜ 客戶名稱：${quote.client.name}`, {
    x: 1.0,
    y: 3.2,
    w: 11.3,
    h: 0.9,
    fontSize: 20,
    color: '60A5FA',
    bold: true,
  });

  // 底部資訊卡片
  slide1.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 4.8,
    w: 11.3,
    h: 1.6,
    fill: { color: '1E293B' },
    line: { color: '334155', width: 1 },
    rectRadius: 0.1,
  });

  slide1.addText(
    [
      { text: `報價單號：${quote.quoteNumber} (版本: ${quote.version})\n`, options: { bold: true, color: C_WHITE } },
      { text: `報價日期：${quote.createdAt.slice(0, 10)} ｜ 詢價批量：${quote.commercial.orderQuantity.toLocaleString()} 件\n`, options: { color: 'CBD5E1' } },
      { text: `建議單價：NT$ ${cost.suggestedUnitPrice.toFixed(2)} / 件 ｜ 目標毛利率：${quote.commercial.targetGrossMarginPct}%\n`, options: { color: '34D399', bold: true } },
      { text: `承辦業務：${quote.createdBy} ｜ 審核主管：${quote.approval?.reviewedBy || '林建興 廠長'}`, options: { color: '94A3B8' } },
    ],
    {
      x: 1.3,
      y: 5.0,
      w: 10.7,
      h: 1.2,
      fontSize: 13,
      lineSpacing: 22,
    }
  );

  // ==========================================
  // SLIDE 2: 產品規格與工程圖面 (Specs & Drawings)
  // ==========================================
  const slide2 = pptx.addSlide();
  slide2.background = { color: C_LIGHT };
  addHeaderToSlide(slide2, '01. 產品規格與工程圖面', 'Product Specifications & Engineering Drawings');

  // 左側：基本規格表
  const specRows = [
    [
      { text: '規格項目', options: { bold: true, fill: { color: 'E2E8F0' }, color: C_NAVY } },
      { text: '規格參數說明', options: { bold: true, fill: { color: 'E2E8F0' }, color: C_NAVY } },
    ],
    [{ text: '產品品名', options: { bold: true } }, { text: quote.product.partName }],
    [{ text: '客戶料號', options: { bold: true } }, { text: quote.product.partNumber }],
    [{ text: '外觀尺寸', options: { bold: true } }, { text: quote.product.dimensionsMm || '依 3D 圖面標記' }],
    [{ text: '公差等級', options: { bold: true } }, { text: quote.product.toleranceGrade }],
    [{ text: '外觀處理', options: { bold: true } }, { text: quote.product.surfaceFinish }],
    [{ text: '成品單重', options: { bold: true } }, { text: `${quote.material.partWeightG} g (成品淨重)` }],
    [{ text: '料頭分攤', options: { bold: true } }, { text: `${(quote.material.runnerWeightG / Math.max(1, quote.molding.cavities)).toFixed(2)} g / 件` }],
  ];

  slide2.addTable(specRows, {
    x: 0.8,
    y: 1.6,
    w: 5.6,
    h: 4.8,
    fontSize: 12,
    rowH: 0.55,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // 右側：特殊要求與圖面清單
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.6,
    w: 5.7,
    h: 2.3,
    fill: { color: C_WHITE },
    line: { color: 'E2E8F0', width: 1 },
    rectRadius: 0.1,
  });

  slide2.addText('特殊工程規範與材料認證', {
    x: 7.1,
    y: 1.8,
    w: 5.1,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: C_NAVY,
  });

  const specialReqText = quote.product.specialRequirements?.length
    ? quote.product.specialRequirements.map(r => `• ${r}`).join('\n')
    : '• 依常規射出成型檢驗標準驗收\n• 符合 RoHS / REACH 環保無毒規範';

  slide2.addText(specialReqText, {
    x: 7.1,
    y: 2.3,
    w: 5.1,
    h: 1.4,
    fontSize: 12,
    color: C_SLATE,
    lineSpacing: 20,
  });

  // 右下：圖面紀錄清單
  slide2.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 4.1,
    w: 5.7,
    h: 2.3,
    fill: { color: C_WHITE },
    line: { color: 'E2E8F0', width: 1 },
    rectRadius: 0.1,
  });

  slide2.addText('2D/3D CAD 圖面管制清單', {
    x: 7.1,
    y: 4.3,
    w: 5.1,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: C_NAVY,
  });

  const dwgText = quote.product.drawings?.length
    ? quote.product.drawings.map(d => `• [${d.fileType}] ${d.fileName} (${d.fileSize})`).join('\n')
    : '• 3D STEP 檔案已完成充填模流分析\n• 2D PDF 關鍵尺寸與幾何公差管制表已歸檔';

  slide2.addText(dwgText, {
    x: 7.1,
    y: 4.8,
    w: 5.1,
    h: 1.4,
    fontSize: 11,
    color: C_SLATE,
    lineSpacing: 18,
  });

  // ==========================================
  // SLIDE 3: 材料成本分析 (Material Cost Analysis)
  // ==========================================
  const slide3 = pptx.addSlide();
  slide3.background = { color: C_LIGHT };
  addHeaderToSlide(slide3, '02. 材料成本精確核算', 'Material Cost Engineering & Compounding Analysis');

  // 四大關鍵指標方塊
  const matBlocks = [
    { label: '塑膠原料型號', value: quote.material.materialName, sub: quote.material.materialGrade, color: C_BLUE },
    { label: '新料採購單價', value: `NT$ ${quote.material.materialPricePerKg}`, sub: '元 / kg', color: C_NAVY },
    { label: '單件總分攤料重', value: `${cost.grossMaterialWeightPerPartG} g`, sub: `成品${quote.material.partWeightG}g + 料頭`, color: C_AMBER },
    { label: '單件材料總成本', value: `NT$ ${cost.materialCostPerPart.toFixed(2)}`, sub: '含損耗與次料折讓', color: C_EMERALD },
  ];

  matBlocks.forEach((b, idx) => {
    const xPos = 0.8 + idx * 2.95;
    slide3.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 2.75,
      h: 1.5,
      fill: { color: C_WHITE },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.08,
    });
    slide3.addText(b.label, { x: xPos + 0.15, y: 1.75, w: 2.45, h: 0.3, fontSize: 11, color: C_SLATE, bold: true });
    slide3.addText(b.value, { x: xPos + 0.15, y: 2.05, w: 2.45, h: 0.5, fontSize: 16, color: b.color, bold: true });
    slide3.addText(b.sub, { x: xPos + 0.15, y: 2.55, w: 2.45, h: 0.3, fontSize: 10, color: '94A3B8' });
  });

  // 材料公式與演算表格
  const matFormulaRows = [
    [
      { text: '工程參數項目', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '數值設定', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '工程說明與計算邏輯', options: { bold: true, fill: { color: 'E2E8F0' } } },
    ],
    [{ text: '回收次料混用比' }, { text: `${quote.material.regrindRatioPct}%` }, { text: `次料折價損失比率 ${quote.material.regrindDiscountPct}%，線上粉碎回用` }],
    [{ text: '色母/添加劑比率' }, { text: `${quote.material.additiveRatioPct}%` }, { text: `單價 NT$ ${quote.material.additivePricePerKg}/kg，均勻混料分攤` }],
    [{ text: '加權有效料價' }, { text: `NT$ ${cost.effectiveMaterialPricePerKg}/kg` }, { text: '新料 + 次料加權 + 添加劑綜合單價' }],
    [{ text: '材料損耗率 (Loss)' }, { text: `${quote.material.materialLossRatePct}%` }, { text: '烘料揮發、料筒清洗與脫模飛邊清理損耗' }],
    [{ text: '良率分攤耗損' }, { text: `${quote.molding.yieldRatePct}%` }, { text: '不良品無法回用部分由良品均攤' }],
  ];

  slide3.addTable(matFormulaRows, {
    x: 0.8,
    y: 3.4,
    w: 11.7,
    h: 3.1,
    fontSize: 12,
    rowH: 0.5,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 4: 成型成本與機台加工 (Molding Cost)
  // ==========================================
  const slide4 = pptx.addSlide();
  slide4.background = { color: C_LIGHT };
  addHeaderToSlide(slide4, '03. 成型製程與機台費率', 'Injection Molding Process & Machine Capacity');

  const moldBlocks = [
    { label: '射出機台規格', value: `${quote.molding.machineTonnage} T 噸`, sub: '全電 / 伺服精密機', color: C_NAVY },
    { label: '機台每小時費率', value: `NT$ ${quote.molding.machineRatePerHour}`, sub: '元 / 小時', color: C_BLUE },
    { label: '成型週期 (Cycle Time)', value: `${quote.molding.cycleTimeSec} 秒`, sub: `模穴數: ${quote.molding.cavities} 穴`, color: C_AMBER },
    { label: '單件成型加工費', value: `NT$ ${cost.moldingCostPerPart.toFixed(2)}`, sub: '元 / 件', color: C_EMERALD },
  ];

  moldBlocks.forEach((b, idx) => {
    const xPos = 0.8 + idx * 2.95;
    slide4.addShape(pptx.ShapeType.roundRect, {
      x: xPos,
      y: 1.6,
      w: 2.75,
      h: 1.5,
      fill: { color: C_WHITE },
      line: { color: 'CBD5E1', width: 1 },
      rectRadius: 0.08,
    });
    slide4.addText(b.label, { x: xPos + 0.15, y: 1.75, w: 2.45, h: 0.3, fontSize: 11, color: C_SLATE, bold: true });
    slide4.addText(b.value, { x: xPos + 0.15, y: 2.05, w: 2.45, h: 0.5, fontSize: 16, color: b.color, bold: true });
    slide4.addText(b.sub, { x: xPos + 0.15, y: 2.55, w: 2.45, h: 0.3, fontSize: 10, color: '94A3B8' });
  });

  // 產能與公式詳細表格
  const moldRows = [
    [
      { text: '產能分析指標', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '計算數值', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '標準工程計算公式', options: { bold: true, fill: { color: 'E2E8F0' } } },
    ],
    [{ text: '每小時射出模次' }, { text: `${cost.shotsPerHour} 模/hr` }, { text: '3,600 秒 ÷ 成型週期 (秒)' }],
    [{ text: '每小時良品產能' }, { text: `${cost.goodPartsPerHour} 件/hr` }, { text: '每小時模次 × 模穴數 × 成型良率 (98%)' }],
    [{ text: '成型單件加工費' }, { text: `NT$ ${cost.moldingCostPerPart.toFixed(2)}` }, { text: '機台每小時費率 ÷ 每小時良品產出數' }],
    [{ text: '本次訂單總成型工時' }, { text: `${(quote.commercial.orderQuantity / Math.max(1, cost.goodPartsPerHour)).toFixed(1)} 小時` }, { text: '報價批量 ÷ 每小時良品產能' }],
  ];

  slide4.addTable(moldRows, {
    x: 0.8,
    y: 3.4,
    w: 11.7,
    h: 2.8,
    fontSize: 12,
    rowH: 0.55,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 5: 換模分攤與後加工 (Setup & Secondary)
  // ==========================================
  const slide5 = pptx.addSlide();
  slide5.background = { color: C_LIGHT };
  addHeaderToSlide(slide5, '04. 換模調機分攤與後加工', 'Setup Amortization & Secondary Operations');

  // 左側：換模分攤明細
  const setupRows = [
    [
      { text: '換模調機項目', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '數值 / 費用', options: { bold: true, fill: { color: 'E2E8F0' } } },
    ],
    [{ text: '基本換模調機工費' }, { text: `NT$ ${quote.setup.setupFixedFee.toLocaleString()}` }],
    [{ text: '清料洗管料耗 (kg)' }, { text: `${quote.setup.purgeResinKg} kg` }],
    [{ text: '試模校車模數' }, { text: `${quote.setup.trialShots} 模` }],
    [{ text: '換模調機工時' }, { text: `${quote.setup.changeoverHours} 小時` }],
    [{ text: '每批換模總成本' }, { text: `NT$ ${cost.totalSetupBatchCost.toLocaleString()}`, options: { bold: true, color: C_NAVY } }],
    [{ text: '單件換模分攤費' }, { text: `NT$ ${cost.setupCostPerPart.toFixed(2)} / 件`, options: { bold: true, color: C_AMBER } }],
  ];

  slide5.addTable(setupRows, {
    x: 0.8,
    y: 1.6,
    w: 5.6,
    h: 4.8,
    fontSize: 12,
    rowH: 0.65,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // 右側：後加工項目加總表
  const postRows = [
    [
      { text: '後加工與二次製程項目', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '單件費用 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' } } },
    ],
    [{ text: '剪料頭 / 修毛邊' }, { text: `NT$ ${quote.postProcess.gateTrimmingUnitCost.toFixed(2)}` }],
    [{ text: '超音波熔接 / 埋螺母' }, { text: `NT$ ${quote.postProcess.ultrasonicUnitCost.toFixed(2)}` }],
    [{ text: '網印 / 移印 / 雷雕打標' }, { text: `NT$ ${quote.postProcess.printingUnitCost.toFixed(2)}` }],
    [{ text: '零件組裝人工費' }, { text: `NT$ ${quote.postProcess.assemblyUnitCost.toFixed(2)}` }],
    [{ text: '專用吸塑與裝箱包材' }, { text: `NT$ ${quote.postProcess.packagingUnitCost.toFixed(2)}` }],
    [{ text: '品質檢驗費 (三次元/全檢)' }, { text: `NT$ ${quote.postProcess.inspectionUnitCost.toFixed(2)}` }],
    [{ text: '國內外運費分攤' }, { text: `NT$ ${quote.postProcess.transportationUnitCost.toFixed(2)}` }],
    [{ text: '單件後加工小計', options: { bold: true } }, { text: `NT$ ${cost.postProcessCostPerPart.toFixed(2)}`, options: { bold: true, color: C_EMERALD } }],
  ];

  slide5.addTable(postRows, {
    x: 6.8,
    y: 1.6,
    w: 5.7,
    h: 4.8,
    fontSize: 12,
    rowH: 0.5,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 6: 成本彙總與建議售價 (Cost & Price Summary)
  // ==========================================
  const slide6 = pptx.addSlide();
  slide6.background = { color: C_LIGHT };
  addHeaderToSlide(slide6, '05. 成本結構與建議報價', 'Cost Structure & Final Quotation Summary');

  // 兩大核心看板卡
  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.6,
    h: 2.0,
    fill: { color: '1E293B' },
    rectRadius: 0.1,
  });

  slide6.addText('單件總製造成本 (Unit Total Cost)', { x: 1.1, y: 1.8, w: 5.0, h: 0.3, fontSize: 13, color: '94A3B8', bold: true });
  slide6.addText(`NT$ ${cost.totalUnitCost.toFixed(2)}`, { x: 1.1, y: 2.1, w: 5.0, h: 0.7, fontSize: 32, color: C_WHITE, bold: true });
  slide6.addText(`直接製造成本 NT$ ${cost.directManufacturingCost.toFixed(2)} + 管銷 (${quote.commercial.managementExpenseRatePct}%)`, { x: 1.1, y: 2.9, w: 5.0, h: 0.3, fontSize: 11, color: 'CBD5E1' });

  slide6.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.6,
    w: 5.7,
    h: 2.0,
    fill: { color: C_BLUE },
    rectRadius: 0.1,
  });

  slide6.addText('建議單件正式報價 (Suggested Price)', { x: 7.1, y: 1.8, w: 5.0, h: 0.3, fontSize: 13, color: '93C5FD', bold: true });
  slide6.addText(`NT$ ${cost.suggestedUnitPrice.toFixed(2)}`, { x: 7.1, y: 2.1, w: 5.0, h: 0.7, fontSize: 32, color: C_WHITE, bold: true });
  slide6.addText(`單件毛利 NT$ ${cost.grossProfitPerPart.toFixed(2)} (目標毛利率 ${quote.commercial.targetGrossMarginPct}%)`, { x: 7.1, y: 2.9, w: 5.0, h: 0.3, fontSize: 12, color: 'A7F3D0', bold: true });

  // 成本彙總對照清單表格
  const summaryTableRows = [
    [
      { text: '成本項目分類', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '單件金額 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
      { text: '成本占比 (%)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
      { text: '整批總支出 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
    ],
    [
      { text: '1. 材料成本 (塑膠原料 + 次料 + 色母)' },
      { text: `NT$ ${cost.materialCostPerPart.toFixed(2)}`, options: { align: 'right' as const } },
      { text: `${Math.round((cost.materialCostPerPart / Math.max(0.01, cost.totalUnitCost)) * 100)}%`, options: { align: 'right' as const } },
      { text: `NT$ ${(cost.materialCostPerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, options: { align: 'right' as const } },
    ],
    [
      { text: '2. 成型加工費 (機台時費 ÷ 產能)' },
      { text: `NT$ ${cost.moldingCostPerPart.toFixed(2)}`, options: { align: 'right' as const } },
      { text: `${Math.round((cost.moldingCostPerPart / Math.max(0.01, cost.totalUnitCost)) * 100)}%`, options: { align: 'right' as const } },
      { text: `NT$ ${(cost.moldingCostPerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, options: { align: 'right' as const } },
    ],
    [
      { text: '3. 換模調機分攤 (每批固定工費分攤)' },
      { text: `NT$ ${cost.setupCostPerPart.toFixed(2)}`, options: { align: 'right' as const } },
      { text: `${Math.round((cost.setupCostPerPart / Math.max(0.01, cost.totalUnitCost)) * 100)}%`, options: { align: 'right' as const } },
      { text: `NT$ ${cost.totalSetupBatchCost.toLocaleString()}`, options: { align: 'right' as const } },
    ],
    [
      { text: '4. 後加工、品檢與包材運費' },
      { text: `NT$ ${cost.postProcessCostPerPart.toFixed(2)}`, options: { align: 'right' as const } },
      { text: `${Math.round((cost.postProcessCostPerPart / Math.max(0.01, cost.totalUnitCost)) * 100)}%`, options: { align: 'right' as const } },
      { text: `NT$ ${(cost.postProcessCostPerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, options: { align: 'right' as const } },
    ],
    [
      { text: '5. 廠務管理費 (SG&A Overhead)' },
      { text: `NT$ ${cost.managementExpensePerPart.toFixed(2)}`, options: { align: 'right' as const } },
      { text: `${Math.round((cost.managementExpensePerPart / Math.max(0.01, cost.totalUnitCost)) * 100)}%`, options: { align: 'right' as const } },
      { text: `NT$ ${(cost.managementExpensePerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, options: { align: 'right' as const } },
    ],
  ];

  slide6.addTable(summaryTableRows, {
    x: 0.8,
    y: 3.9,
    w: 11.7,
    h: 2.6,
    fontSize: 11,
    rowH: 0.42,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 7: 階梯報價矩陣 (Tiered Volume Matrix)
  // ==========================================
  const slide7 = pptx.addSlide();
  slide7.background = { color: C_LIGHT };
  addHeaderToSlide(slide7, '06. 多批量階梯報價方案', 'Tiered Volume Pricing & Scale Economies');

  const tierRows = [
    [
      { text: '訂購批量 (件)', options: { bold: true, fill: { color: 'E2E8F0' } } },
      { text: '換模分攤 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
      { text: '單件總成本 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
      { text: '建議單件報價 (NT$)', options: { bold: true, fill: { color: C_BLUE }, color: C_WHITE, align: 'right' as const } },
      { text: '毛利率 (%)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
      { text: '整批訂單總額 (NT$)', options: { bold: true, fill: { color: 'E2E8F0' }, align: 'right' as const } },
    ],
    ...tiers.map(t => {
      const isCur = t.quantity === quote.commercial.orderQuantity;
      return [
        { text: `${t.quantity.toLocaleString()} 件${isCur ? ' (本次詢價)' : ''}`, options: { bold: isCur } },
        { text: `NT$ ${t.setupCost.toFixed(2)}`, options: { align: 'right' as const } },
        { text: `NT$ ${t.totalCost.toFixed(2)}`, options: { align: 'right' as const } },
        { text: `NT$ ${t.suggestedPrice.toFixed(2)}`, options: { bold: true, color: C_BLUE, align: 'right' as const } },
        { text: `${t.grossMarginPct}%`, options: { color: C_EMERALD, align: 'right' as const } },
        { text: `NT$ ${t.totalRevenue.toLocaleString()}`, options: { bold: isCur, align: 'right' as const } },
      ];
    }),
  ];

  slide7.addTable(tierRows, {
    x: 0.8,
    y: 1.6,
    w: 11.7,
    h: 4.8,
    fontSize: 12,
    rowH: 0.6,
    border: { pt: 0.5, color: 'CBD5E1' },
    align: 'left',
    valign: 'middle',
  });

  // ==========================================
  // SLIDE 8: 商業條款與模具 (Commercial Terms)
  // ==========================================
  const slide8 = pptx.addSlide();
  slide8.background = { color: C_LIGHT };
  addHeaderToSlide(slide8, '07. 模具開發與商業合作條款', 'Tooling Investment & Commercial Terms');

  // 左側：模具方案卡
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.6,
    w: 5.6,
    h: 4.8,
    fill: { color: C_WHITE },
    line: { color: 'CBD5E1', width: 1 },
    rectRadius: 0.1,
  });

  slide8.addText('專案射出模具開發方案', { x: 1.1, y: 1.9, w: 5.0, h: 0.4, fontSize: 16, bold: true, color: C_NAVY });

  const toolingText = [
    { text: `• 模穴數：${quote.molding.cavities} 穴精密射出鋼模\n\n`, options: { bold: true } },
    { text: `• 模具預估總價：NT$ ${quote.molding.moldEstimatedCost.toLocaleString()} (未稅)\n\n` },
    { text: `• 保證開模壽命：${quote.molding.moldLifeShots.toLocaleString()} 模次\n\n` },
    { text: `• 模具產權：${quote.molding.moldOwnership === 'customer' ? '買方客戶所有 (由久揚代管維護保養)' : '久揚塑膠自備'}\n\n` },
    { text: `• 開模開發週期：約 30 ~ 35 工作天 (含第一次試模 T1 樣品交付)` },
  ];

  slide8.addText(toolingText, {
    x: 1.1,
    y: 2.4,
    w: 5.0,
    h: 3.6,
    fontSize: 13,
    color: C_SLATE,
    lineSpacing: 22,
  });

  // 右側：交易條款
  slide8.addShape(pptx.ShapeType.roundRect, {
    x: 6.8,
    y: 1.6,
    w: 5.7,
    h: 4.8,
    fill: { color: C_WHITE },
    line: { color: 'CBD5E1', width: 1 },
    rectRadius: 0.1,
  });

  slide8.addText('正式交易商業條款', { x: 7.1, y: 1.9, w: 5.1, h: 0.4, fontSize: 16, bold: true, color: C_NAVY });

  const commercialText = [
    { text: `• 付款條件：${quote.commercial.paymentTerms || '月結 30 天'}\n\n`, options: { bold: true } },
    { text: `• 貿易交貨條件：${quote.commercial.tradeTerms || '送貨到廠 (DDP)'}\n\n` },
    { text: `• 最低起訂量 (MOQ)：${quote.commercial.moq || 1000} 件 / 批\n\n` },
    { text: `• 量產交期：訂單確認後 ${quote.commercial.leadTimeDays || 14} 工作天出貨\n\n` },
    { text: `• 報價有效期限：報價日起 ${quote.commercial.validityDays || 30} 天內有效` },
  ];

  slide8.addText(commercialText, {
    x: 7.1,
    y: 2.4,
    w: 5.1,
    h: 3.6,
    fontSize: 13,
    color: C_SLATE,
    lineSpacing: 22,
  });

  // ==========================================
  // SLIDE 9: 封底感謝頁 (Closing Slide)
  // ==========================================
  const slide9 = pptx.addSlide();
  slide9.background = { color: C_NAVY };

  slide9.addText('久揚塑膠股份有限公司', {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 0.6,
    fontSize: 22,
    color: '94A3B8',
    bold: true,
  });

  slide9.addText('感謝您的信任與合作 期待攜手量產', {
    x: 1.0,
    y: 2.8,
    w: 11.3,
    h: 1.0,
    fontSize: 36,
    color: C_WHITE,
    bold: true,
  });

  slide9.addText('高品質射出成型 ｜ 模具精密開發 ｜ 數據化透明報價', {
    x: 1.0,
    y: 3.9,
    w: 11.3,
    h: 0.5,
    fontSize: 16,
    color: '60A5FA',
    bold: true,
  });

  slide9.addText(
    `地址：桃園市龜山區工四路 28 號\n電話：(03) 328-8899 ｜ 傳真：(03) 328-8880\n信箱：sales@jiouyang-plastic.com.tw ｜ 官網：www.jiouyang-plastic.com.tw`,
    {
      x: 1.0,
      y: 4.8,
      w: 11.3,
      h: 1.2,
      fontSize: 13,
      color: '94A3B8',
      lineSpacing: 22,
    }
  );

  // 下載檔案
  const filename = `${quote.quoteNumber}_${quote.product.partName}_成本報價簡報.pptx`.replace(/[\/\\?%*:|"<>]/g, '_');
  await pptx.writeFile({ fileName: filename });
}

function addHeaderToSlide(slide: any, title: string, subtitle: string) {
  slide.addShape('rect', {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: '2563EB' },
  });

  slide.addText(title, {
    x: 0.8,
    y: 0.45,
    w: 10.0,
    h: 0.45,
    fontSize: 20,
    bold: true,
    color: '0F172A',
  });

  slide.addText(subtitle, {
    x: 0.8,
    y: 0.9,
    w: 10.0,
    h: 0.3,
    fontSize: 11,
    color: '64748B',
  });

  // 右上角久揚標籤
  slide.addText('久揚塑膠 JIOU YANG', {
    x: 9.5,
    y: 0.55,
    w: 3.0,
    h: 0.3,
    fontSize: 11,
    color: '94A3B8',
    bold: true,
    align: 'right',
  });
}

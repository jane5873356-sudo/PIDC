/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 核心型別定義
 */

export type QuotationStatus = 
  | 'draft'             // 草稿建檔中
  | 'pending_approval'  // 待主管核價
  | 'approved'          // 主管已核准
  | 'sent'              // 已發送正式報價單
  | 'won'               // 客戶已下單 (成交)
  | 'lost';             // 未成交 / 放棄

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: 'ABS' | 'PC' | 'PC/ABS' | 'PP' | 'POM' | 'PA66' | 'PBT' | 'PMMA' | 'TPU' | 'OTHER';
  grade: string;
  supplier: string;
  pricePerKg: number; // NT$/kg
  density: number; // g/cm³
  shrinkagePct: number; // 收縮率 %
  flameRetardant?: string; // e.g. UL94-V0, HB
  lastUpdated: string;
  description: string;
}

export interface MachineItem {
  id: string;
  model: string;
  brand: string;
  clampingForceTons: number; // 鎖模力 (噸)
  hourlyRate: number; // 機台每小時費率 NT$/hr
  screwDiameterMm: number; // 螺桿直徑
  maxShotWeightG: number; // 最大射出重 (PS)
  tieBarDistanceMm: string; // 大柱內距
  isAvailable: boolean;
  notes: string;
}

export interface DrawingAttachment {
  id: string;
  fileName: string;
  fileType: '2D-PDF' | '2D-DWG' | '3D-STEP' | '3D-IGS' | 'IMAGE';
  fileSize: string;
  uploadDate: string;
  previewUrl?: string;
  note?: string;
}

export interface VersionRecord {
  version: string;
  timestamp: string;
  author: string;
  reason: string;
  totalCost: number;
  suggestedPrice: number;
  orderQuantity: number;
  grossMarginPct: number;
}

export interface ActualProductionRecord {
  batchId: string;
  productionDate: string;
  operator: string;
  actualQuantity: number;
  actualCycleTimeSec: number;
  actualYieldPct: number;
  actualMaterialPricePerKg: number;
  actualScrapKg: number;
  actualSetupTimeHours: number;
  actualSetupCost: number;
  actualUnitCost: number;
  notes: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string; // e.g. JY-2026-Q084
  version: string; // e.g. V1.0
  versionHistory: VersionRecord[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: QuotationStatus;

  // 客戶與詢價資料 (F01)
  client: {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    industry: string;
    taxId?: string; // 統一編號
  };

  // 產品基本資料與圖面 (F01, F02)
  product: {
    partName: string; // 品名
    partNumber: string; // 客戶料號
    internalPartNumber: string; // 久揚內部編號
    color: string; // 產品顏色
    toleranceGrade: string; // 公差等級 e.g. 精密級 ±0.05mm
    surfaceFinish: string; // 外觀處理 e.g. 咬花 MT-11010 / 鏡面 SPI-A2
    specialRequirements: string[]; // 特殊要求
    dimensionsMm: string; // 外觀尺寸 (長x寬x高)
    drawings: DrawingAttachment[];
  };

  // 材料與重量規格 (F03)
  material: {
    materialId: string;
    materialName: string;
    materialGrade: string;
    materialPricePerKg: number; // 材料單價 NT$/kg
    partWeightG: number; // 成品單重 (g)
    runnerWeightG: number; // 料頭總重 (g)
    regrindRatioPct: number; // 回收次料添加比例 (0-30%)
    regrindDiscountPct: number; // 次料折價率 % (通常 15~25%)
    additiveRatioPct: number; // 色母/添加劑比率 %
    additivePricePerKg: number; // 色母/添加劑單價 NT$/kg
    materialLossRatePct: number; // 材料耗損率 % (通常 2~5%)
  };

  // 模具與成型加工 (F04)
  molding: {
    cavities: number; // 模穴數
    machineId: string;
    machineTonnage: number; // 機台噸數
    machineRatePerHour: number; // 機台時費 NT$/hr
    cycleTimeSec: number; // 成型週期 (秒)
    yieldRatePct: number; // 預估成型良率 %
    moldEstimatedCost: number; // 模具估價 (若由久揚開模，NT$)
    moldLifeShots: number; // 模具保證壽命 (模次)
    moldOwnership: 'customer' | 'jiouyang'; // 模具所有權
  };

  // 換模調機成本分攤 (F05)
  setup: {
    setupFixedFee: number; // 每批基本換模與調機工費 NT$
    purgeResinKg: number; // 清料洗管耗料 (kg)
    trialShots: number; // 試模校車不良模次 (shots)
    changeoverHours: number; // 換模調機工時 (小時)
  };

  // 後加工與二次製程 (F06)
  postProcess: {
    gateTrimmingUnitCost: number; // 剪料頭/修毛邊 (NT$/件)
    ultrasonicUnitCost: number; // 超音波熔接 (NT$/件)
    printingUnitCost: number; // 印刷/燙金/移印 (NT$/件)
    assemblyUnitCost: number; // 組裝作業 (NT$/件)
    packagingUnitCost: number; // 包裝材料與工費 (NT$/件)
    inspectionUnitCost: number; // 品檢費用 (NT$/件)
    transportationUnitCost: number; // 運費分攤 (NT$/件)
  };

  // 商業條款與毛利設定 (F07)
  commercial: {
    orderQuantity: number; // 本次詢價批量 (件)
    moq: number; // 最低訂購量 MOQ (件)
    leadTimeDays: number; // 交期 (天)
    validityDays: number; // 報價單有效天數 (預設 30 天)
    paymentTerms: string; // 付款條件 e.g. 月結30天 / 訂金30% 出貨70%
    tradeTerms: string; // 貿易條件 e.g. 送貨到廠 / Ex-Work / FOB
    managementExpenseRatePct: number; // 廠務管銷費率 % (通常 8~12%)
    targetGrossMarginPct: number; // 目標毛利率 % (通常 20~35%)
    currency: 'NTD' | 'USD';
    exchangeRate: number; // 匯率 (預設 32.0)
    tieredQuantities: number[]; // 階梯報價批量清單
  };

  // 審核機制與狀態紀錄 (F08)
  approval: {
    requiresApproval: boolean;
    flagReasons: string[];
    minMarginThreshold: number; // 最低門檻毛利率 % (例如 < 20% 強制審核)
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
  };

  // 實際生產回饋資料 (F11)
  actualProduction?: ActualProductionRecord;
}

export interface CalculatedCostSummary {
  // 單件材料費
  grossMaterialWeightPerPartG: number; // 每件分攤總料重 (成品 + 料頭/穴數)
  effectiveMaterialPricePerKg: number; // 考慮色母與次料折價後的有效料價
  materialCostPerPart: number; // 單件材料費 (含耗損與良率分攤)

  // 單件成型費
  shotsPerHour: number; // 每小時模次
  goodPartsPerHour: number; // 每小時良品產出數
  moldingCostPerPart: number; // 單件成型加工費

  // 單件換模調機分攤
  totalSetupBatchCost: number; // 整批換模調機總支出
  setupCostPerPart: number; // 單件分攤換模費

  // 單件後加工費
  postProcessCostPerPart: number; // 單件後加工加總

  // 直接成本與管銷
  directManufacturingCost: number; // 直接製造成本 (COGS)
  managementExpensePerPart: number; // 管銷管理費
  totalUnitCost: number; // 單件總成本

  // 建議售價與毛利
  suggestedUnitPrice: number; // 建議單件報價
  grossProfitPerPart: number; // 預估單件毛利
  actualGrossMarginPct: number; // 試算達成毛利率 %

  // 整批總額
  batchTotalManufacturingCost: number; // 整批製造成本
  batchTotalRevenue: number; // 整批預估營業額
  batchTotalGrossProfit: number; // 整批預估毛利額
}

export interface TierCostResult {
  quantity: number;
  materialCost: number;
  moldingCost: number;
  setupCost: number;
  postProcessCost: number;
  managementCost: number;
  totalCost: number;
  suggestedPrice: number;
  grossMarginPct: number;
  totalRevenue: number;
}

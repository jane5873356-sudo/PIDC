/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 核心應用程式入口
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { QuotationList } from './components/QuotationList';
import { InteractiveSimulator } from './components/InteractiveSimulator';
import { QuotationEditor } from './components/QuotationEditor';
import { OfficialQuotationSheet } from './components/OfficialQuotationSheet';
import { PresentationViewer } from './components/PresentationViewer';
import { HistoricalSearch } from './components/HistoricalSearch';
import { ActualCostAnalysis } from './components/ActualCostAnalysis';
import { MasterDataSettings } from './components/MasterDataSettings';
import { VersionHistoryModal } from './components/VersionHistoryModal';

import { Quotation, MaterialItem, MachineItem, ActualProductionRecord } from './types';
import { INITIAL_QUOTATIONS, STANDARD_MATERIALS, STANDARD_MACHINES } from './data/standardData';
import { SimpleQuoteInput, calculateQuotationCost } from './utils/costCalculator';

const STORAGE_KEYS = {
  QUOTATIONS: 'jiouyang_quotations_v1',
  MATERIALS: 'jiouyang_materials_v1',
  MACHINES: 'jiouyang_machines_v1',
};

export default function App() {
  // 資料庫狀態 (優先從 localStorage 讀取，預設為完整工業範例資料)
  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading quotations from storage', e);
    }
    return INITIAL_QUOTATIONS;
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading materials from storage', e);
    }
    return STANDARD_MATERIALS;
  });

  const [machines, setMachines] = useState<MachineItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MACHINES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading machines from storage', e);
    }
    return STANDARD_MACHINES;
  });

  // UI 導航與作用中案件狀態
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [currentQuoteId, setCurrentQuoteId] = useState<string>(quotations[0]?.id || '');
  const [viewingVersionQuote, setViewingVersionQuote] = useState<Quotation | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 持久化儲存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
    } catch (e) {
      console.error('Failed to save quotations to storage', e);
    }
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('Failed to save materials to storage', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MACHINES, JSON.stringify(machines));
    } catch (e) {
      console.error('Failed to save machines to storage', e);
    }
  }, [machines]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 當前選取的報價專案
  const currentQuote = quotations.find(q => q.id === currentQuoteId) || quotations[0];

  // 1. 建立全新空白詢價案件 (F01)
  const handleNewQuotation = () => {
    const nextSeq = quotations.length + 101;
    const newQuote: Quotation = {
      id: `q-${Date.now()}`,
      quoteNumber: `JY-2026-Q${nextSeq}`,
      version: 'V1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '王建宏 (資深業務經理)',
      status: 'draft',
      versionHistory: [
        {
          version: 'V1.0',
          timestamp: new Date().toISOString(),
          author: '王建宏',
          reason: '初始詢價建檔',
          totalCost: 0,
          suggestedPrice: 0,
          orderQuantity: 5000,
          grossMarginPct: 25.0,
        },
      ],
      client: {
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        industry: '',
      },
      product: {
        partName: '',
        partNumber: '',
        internalPartNumber: `JY-M-${nextSeq}`,
        color: '黑色 / 原色',
        toleranceGrade: '一般級 (±0.08mm)',
        surfaceFinish: '細咬花 MT-11010',
        specialRequirements: ['RoHS 合格'],
        dimensionsMm: '',
        drawings: [],
      },
      material: {
        materialId: materials[0]?.id || 'mat-abs-757',
        materialName: materials[0]?.name || 'ABS 通用級樹脂',
        materialGrade: materials[0]?.grade || 'POLYLAC® PA-757',
        materialPricePerKg: materials[0]?.pricePerKg || 68.0,
        partWeightG: 45.0,
        runnerWeightG: 16.0,
        regrindRatioPct: 15.0,
        regrindDiscountPct: 20.0,
        additiveRatioPct: 2.0,
        additivePricePerKg: 200.0,
        materialLossRatePct: 3.0,
      },
      molding: {
        cavities: 4,
        machineId: machines[2]?.id || 'mac-180t',
        machineTonnage: machines[2]?.clampingForceTons || 180,
        machineRatePerHour: machines[2]?.hourlyRate || 480,
        cycleTimeSec: 25,
        yieldRatePct: 98.0,
        moldEstimatedCost: 350000,
        moldLifeShots: 300000,
        moldOwnership: 'customer',
      },
      setup: {
        setupFixedFee: 4000,
        purgeResinKg: 4.0,
        trialShots: 30,
        changeoverHours: 1.5,
      },
      postProcess: {
        gateTrimmingUnitCost: 0.4,
        ultrasonicUnitCost: 0.0,
        printingUnitCost: 0.0,
        assemblyUnitCost: 0.0,
        packagingUnitCost: 0.5,
        inspectionUnitCost: 0.3,
        transportationUnitCost: 0.2,
      },
      commercial: {
        orderQuantity: 5000,
        moq: 2000,
        leadTimeDays: 14,
        validityDays: 30,
        paymentTerms: '月結 30 天',
        tradeTerms: '送貨到廠 (DDP)',
        managementExpenseRatePct: 8.0,
        targetGrossMarginPct: 25.0,
        currency: 'NTD',
        exchangeRate: 32.0,
        tieredQuantities: [1000, 3000, 5000, 10000, 20000],
      },
      approval: {
        requiresApproval: false,
        flagReasons: [],
        minMarginThreshold: 20.0,
      },
    };

    setQuotations(prev => [newQuote, ...prev]);
    setCurrentQuoteId(newQuote.id);
    setActiveTab('editor');
    showToast(`已建立新詢價案件 ${newQuote.quoteNumber}，請補齊客戶與產品規格。`);
  };

  // 2. 從互動沙盒模擬器轉入全新正式專案
  const handleCreateFromSimulator = (params: SimpleQuoteInput) => {
    const nextSeq = quotations.length + 101;
    const newQuote: Quotation = {
      id: `q-sim-${Date.now()}`,
      quoteNumber: `JY-2026-Q${nextSeq}`,
      version: 'V1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '王建宏 (資深業務經理)',
      status: 'draft',
      versionHistory: [
        {
          version: 'V1.0',
          timestamp: new Date().toISOString(),
          author: '王建宏',
          reason: '由互動式沙盒試算器轉入建檔',
          totalCost: 0,
          suggestedPrice: 0,
          orderQuantity: params.orderQuantity,
          grossMarginPct: params.targetGrossMarginPct,
        },
      ],
      client: {
        name: '新詢價客戶 (洽談中)',
        contactPerson: '採購窗口',
        phone: '',
        email: '',
        industry: '客製機構零件',
      },
      product: {
        partName: '射出成型機構外殼件',
        partNumber: `PART-SIM-${nextSeq}`,
        internalPartNumber: `JY-M-${nextSeq}`,
        color: '黑色',
        toleranceGrade: '一般級 (±0.08mm)',
        surfaceFinish: '細咬花 MT-11010',
        specialRequirements: [],
        dimensionsMm: '待補圖面確認',
        drawings: [],
      },
      material: {
        materialId: 'mat-custom',
        materialName: '自選塑料 (沙盒參數)',
        materialGrade: 'Standard Grade',
        materialPricePerKg: params.materialPricePerKg,
        partWeightG: params.materialWeightPerPartG,
        runnerWeightG: params.materialWeightPerPartG * 0.25,
        regrindRatioPct: 10.0,
        regrindDiscountPct: 20.0,
        additiveRatioPct: 0.0,
        additivePricePerKg: 0.0,
        materialLossRatePct: 3.0,
      },
      molding: {
        cavities: params.cavities,
        machineId: 'mac-auto',
        machineTonnage: 180,
        machineRatePerHour: params.machineRatePerHour,
        cycleTimeSec: params.cycleTimeSec,
        yieldRatePct: params.yieldRatePct,
        moldEstimatedCost: 320000,
        moldLifeShots: 300000,
        moldOwnership: 'customer',
      },
      setup: {
        setupFixedFee: params.batchSetupCost,
        purgeResinKg: 4.0,
        trialShots: 30,
        changeoverHours: 1.5,
      },
      postProcess: {
        gateTrimmingUnitCost: 0.3,
        ultrasonicUnitCost: 0.0,
        printingUnitCost: 0.0,
        assemblyUnitCost: 0.0,
        packagingUnitCost: 0.4,
        inspectionUnitCost: 0.3,
        transportationUnitCost: 0.2,
      },
      commercial: {
        orderQuantity: params.orderQuantity,
        moq: Math.min(2000, params.orderQuantity),
        leadTimeDays: 14,
        validityDays: 30,
        paymentTerms: '月結 30 天',
        tradeTerms: '送貨到廠',
        managementExpenseRatePct: 8.0,
        targetGrossMarginPct: params.targetGrossMarginPct,
        currency: 'NTD',
        exchangeRate: 32.0,
        tieredQuantities: [
          Math.round(params.orderQuantity * 0.5),
          params.orderQuantity,
          params.orderQuantity * 2,
          params.orderQuantity * 5,
        ],
      },
      approval: {
        requiresApproval: false,
        flagReasons: [],
        minMarginThreshold: 20.0,
      },
    };

    setQuotations(prev => [newQuote, ...prev]);
    setCurrentQuoteId(newQuote.id);
    setActiveTab('editor');
    showToast(`已成功將沙盒參數轉入新案件 ${newQuote.quoteNumber}`);
  };

  // 3. 儲存案件 (支援直接覆寫 或 升版保留歷史 V1.0 -> V1.1)
  const handleSaveQuotation = (
    updatedQuote: Quotation,
    isNewVersion = false,
    versionReason?: string
  ) => {
    let finalQuote = { ...updatedQuote };
    const costSummary = calculateQuotationCost(finalQuote);

    if (isNewVersion) {
      // 升版版號邏輯: V1.0 -> V1.1
      const currentVer = finalQuote.version;
      const match = currentVer.match(/V(\d+)\.(\d+)/);
      let newVer = 'V1.1';
      if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]) + 1;
        newVer = `V${major}.${minor}`;
      }
      finalQuote.version = newVer;

      const newRecord = {
        version: newVer,
        timestamp: new Date().toISOString(),
        author: '王建宏 (業務經理)',
        reason: versionReason || '更新報價參數',
        totalCost: costSummary.totalUnitCost,
        suggestedPrice: costSummary.suggestedUnitPrice,
        orderQuantity: finalQuote.commercial.orderQuantity,
        grossMarginPct: finalQuote.commercial.targetGrossMarginPct,
      };

      finalQuote.versionHistory = [...(finalQuote.versionHistory || []), newRecord];
    } else {
      // 更新當前版紀錄的最新成本
      if (finalQuote.versionHistory && finalQuote.versionHistory.length > 0) {
        const lastIdx = finalQuote.versionHistory.length - 1;
        finalQuote.versionHistory[lastIdx] = {
          ...finalQuote.versionHistory[lastIdx],
          totalCost: costSummary.totalUnitCost,
          suggestedPrice: costSummary.suggestedUnitPrice,
          orderQuantity: finalQuote.commercial.orderQuantity,
          grossMarginPct: finalQuote.commercial.targetGrossMarginPct,
        };
      }
    }

    finalQuote.updatedAt = new Date().toISOString();

    setQuotations(prev => prev.map(q => (q.id === finalQuote.id ? finalQuote : q)));
    showToast(isNewVersion ? `案件已升版為 ${finalQuote.version} 並保留變更歷程！` : '報價核算結果已成功儲存！');
  };

  // 4. 複製既有案件開新專案
  const handleCloneQuotation = (quoteId: string) => {
    const source = quotations.find(q => q.id === quoteId);
    if (!source) return;
    const nextSeq = quotations.length + 101;
    const cloned: Quotation = {
      ...JSON.parse(JSON.stringify(source)),
      id: `q-clone-${Date.now()}`,
      quoteNumber: `JY-2026-Q${nextSeq}`,
      version: 'V1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      versionHistory: [
        {
          version: 'V1.0',
          timestamp: new Date().toISOString(),
          author: '王建宏',
          reason: `自既有案件 ${source.quoteNumber} (${source.product.partName}) 複製開新案`,
          totalCost: 0,
          suggestedPrice: 0,
          orderQuantity: source.commercial.orderQuantity,
          grossMarginPct: source.commercial.targetGrossMarginPct,
        },
      ],
      approval: {
        requiresApproval: false,
        flagReasons: [],
        minMarginThreshold: 20.0,
      },
      actualProduction: undefined,
    };

    setQuotations(prev => [cloned, ...prev]);
    setCurrentQuoteId(cloned.id);
    setActiveTab('editor');
    showToast(`已複製建立新專案 ${cloned.quoteNumber}`);
  };

  // 5. 刪除案件
  const handleDeleteQuotation = (quoteId: string) => {
    const target = quotations.find(q => q.id === quoteId);
    if (!target) return;
    if (window.confirm(`確定要刪除報價案件「${target.quoteNumber} - ${target.product.partName}」嗎？此動作無法復原。`)) {
      setQuotations(prev => prev.filter(q => q.id !== quoteId));
      showToast(`已刪除案件 ${target.quoteNumber}`);
    }
  };

  // 6. 檢視正式報價單 PDF
  const handleViewOfficialPdf = (quoteId: string) => {
    setCurrentQuoteId(quoteId);
    setActiveTab('official-pdf');
  };

  // 6.1 檢視/匯出 PPT 簡報投影片與 PTT BBS 格式
  const handleViewPresentation = (quoteId: string) => {
    setCurrentQuoteId(quoteId);
    setActiveTab('presentation');
  };

  // 7. 編輯案件
  const handleEditQuotation = (quoteId: string) => {
    setCurrentQuoteId(quoteId);
    setActiveTab('editor');
  };

  // 8. 儲存實際生產回饋紀錄 (F11)
  const handleSaveActualRecord = (quoteId: string, record: ActualProductionRecord) => {
    setQuotations(prev =>
      prev.map(q => {
        if (q.id === quoteId) {
          return {
            ...q,
            actualProduction: record,
            updatedAt: new Date().toISOString(),
          };
        }
        return q;
      })
    );
    showToast('實際生產回饋數據已成功寫入資料庫！');
  };

  // 9. 匯出備份 JSON
  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company: '久揚塑膠股份有限公司',
      quotations,
      materials,
      machines,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `久揚塑膠_報價資料庫備份_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已匯出完整資料庫備份 JSON 檔案');
  };

  // 10. 匯入備份 JSON
  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.quotations && Array.isArray(parsed.quotations)) {
          setQuotations(parsed.quotations);
          if (parsed.materials) setMaterials(parsed.materials);
          if (parsed.machines) setMachines(parsed.machines);
          showToast(`成功匯入 ${parsed.quotations.length} 筆案件與標準資料庫！`);
        } else {
          alert('匯入格式不正確，找不到 quotations 陣列。');
        }
      } catch (err) {
        alert('解析 JSON 檔案失敗，請確認檔案格式正確。');
      }
    };
    reader.readAsText(file);
  };

  // 11. 重設預設標準庫
  const handleResetToDefaults = () => {
    if (window.confirm('確定要將材料庫、機台時費恢復為久揚塑膠原廠標準預設值嗎？')) {
      setMaterials(STANDARD_MATERIALS);
      setMachines(STANDARD_MACHINES);
      showToast('已恢復原廠標準材料與機台參數庫！');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans antialiased flex flex-col">
      {/* 頂部全域導航 */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        quotations={quotations}
        onNewQuotation={handleNewQuotation}
      />

      {/* 提示訊息 Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          {toastMessage}
        </div>
      )}

      {/* 主體工作區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: 案件清單管理 (F01) */}
        {activeTab === 'list' && (
          <QuotationList
            quotations={quotations}
            onSelectQuotation={setCurrentQuoteId}
            onEditQuotation={handleEditQuotation}
            onViewOfficialPdf={handleViewOfficialPdf}
            onViewPresentation={handleViewPresentation}
            onCloneQuotation={handleCloneQuotation}
            onDeleteQuotation={handleDeleteQuotation}
            onNewQuotation={handleNewQuotation}
            onViewVersionHistory={quote => setViewingVersionQuote(quote)}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
          />
        )}

        {/* VIEW 2: 互動式沙盒模擬器 (規格書第三節標準實作) */}
        {activeTab === 'simulator' && (
          <InteractiveSimulator onCreateQuoteFromSimulator={handleCreateFromSimulator} />
        )}

        {/* VIEW 3: 專案成本核算工作台 (F02~F08) */}
        {activeTab === 'editor' && currentQuote && (
          <QuotationEditor
            quote={currentQuote}
            onSave={handleSaveQuotation}
            onCancel={() => setActiveTab('list')}
            onViewOfficialPdf={handleViewOfficialPdf}
            onViewPresentation={handleViewPresentation}
          />
        )}

        {/* VIEW 4: 正式報價單輸出與列印 (F09) */}
        {activeTab === 'official-pdf' && currentQuote && (
          <OfficialQuotationSheet
            quote={currentQuote}
            onBack={() => setActiveTab('list')}
            onEdit={handleEditQuotation}
            onViewPresentation={handleViewPresentation}
          />
        )}

        {/* VIEW 4.1: 簡報展示與 PPT / PTT 檔案匯出 */}
        {activeTab === 'presentation' && currentQuote && (
          <PresentationViewer
            quote={currentQuote}
            onBack={() => setActiveTab('list')}
            onEdit={handleEditQuotation}
          />
        )}

        {/* VIEW 5: 歷史報價與相似產品檢索 (F10) */}
        {activeTab === 'history' && (
          <HistoricalSearch
            quotations={quotations}
            onCloneQuotation={handleCloneQuotation}
            onEditQuotation={handleEditQuotation}
          />
        )}

        {/* VIEW 6: 預估 vs 實際成本差異分析 (F11) */}
        {activeTab === 'variance' && (
          <ActualCostAnalysis
            quotations={quotations}
            onSaveActualRecord={handleSaveActualRecord}
          />
        )}

        {/* VIEW 7: 標準參數資料庫維護 (材料 & 機台) */}
        {activeTab === 'master-data' && (
          <MasterDataSettings
            materials={materials}
            machines={machines}
            onUpdateMaterials={setMaterials}
            onUpdateMachines={setMachines}
            onResetToDefaults={handleResetToDefaults}
          />
        )}
      </main>

      {/* 版本歷程對話框 Modal (F12) */}
      {viewingVersionQuote && (
        <VersionHistoryModal
          quote={viewingVersionQuote}
          onClose={() => setViewingVersionQuote(null)}
        />
      )}

      {/* 底部 Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            久揚塑膠股份有限公司 JIOU YANG PLASTIC CO., LTD. ｜ 塑膠射出零件智慧成本報價系統
          </p>
          <p className="text-[11px] text-slate-400">
            遵循規格書核心原則：標準化材料・精確週期・責任歸屬・持續數據回饋
          </p>
        </div>
      </footer>
    </div>
  );
}

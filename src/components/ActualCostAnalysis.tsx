/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 預估報價 vs 實際生產成本差異分析 (F11)
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Clock, 
  Layers, 
  RotateCcw, 
  ArrowRight,
  Database,
  Info,
  Calendar,
  UserCheck
} from 'lucide-react';
import { Quotation, ActualProductionRecord } from '../types';
import { calculateQuotationCost } from '../utils/costCalculator';

interface ActualCostAnalysisProps {
  quotations: Quotation[];
  onSaveActualRecord: (quoteId: string, record: ActualProductionRecord) => void;
}

export const ActualCostAnalysis: React.FC<ActualCostAnalysisProps> = ({
  quotations,
  onSaveActualRecord,
}) => {
  // 篩選已有實際生產資料或已成交案件
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotations[0]?.id || '');
  
  const selectedQuote = quotations.find(q => q.id === selectedQuoteId) || quotations[0];
  const costSummary = selectedQuote ? calculateQuotationCost(selectedQuote) : null;

  // 實際生產數據表單狀態
  const [form, setForm] = useState<ActualProductionRecord>(() => {
    return (
      selectedQuote?.actualProduction || {
        batchId: `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
        productionDate: new Date().toISOString().slice(0, 10),
        operator: '張領班 (成型二課)',
        actualQuantity: selectedQuote?.commercial.orderQuantity || 10000,
        actualCycleTimeSec: selectedQuote?.molding.cycleTimeSec || 28,
        actualYieldPct: selectedQuote?.molding.yieldRatePct || 98,
        actualMaterialPricePerKg: selectedQuote?.material.materialPricePerKg || 68,
        actualScrapKg: 15.0,
        actualSetupTimeHours: selectedQuote?.setup.changeoverHours || 1.5,
        actualSetupCost: selectedQuote?.setup.setupFixedFee || 4500,
        actualUnitCost: costSummary ? costSummary.totalUnitCost : 8.8,
        notes: '首批試產順利，模溫機穩定控制於 65°C。',
      }
    );
  });

  // 當選擇其他案件時同步
  const handleSelectQuote = (id: string) => {
    setSelectedQuoteId(id);
    const q = quotations.find(item => item.id === id);
    if (q) {
      const qSummary = calculateQuotationCost(q);
      setForm(
        q.actualProduction || {
          batchId: `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
          productionDate: new Date().toISOString().slice(0, 10),
          operator: '張領班 (成型二課)',
          actualQuantity: q.commercial.orderQuantity || 10000,
          actualCycleTimeSec: q.molding.cycleTimeSec || 25,
          actualYieldPct: q.molding.yieldRatePct || 98,
          actualMaterialPricePerKg: q.material.materialPricePerKg || 68,
          actualScrapKg: 12.0,
          actualSetupTimeHours: q.setup.changeoverHours || 1.5,
          actualSetupCost: q.setup.setupFixedFee || 4500,
          actualUnitCost: qSummary.totalUnitCost,
          notes: '實際生產良率良好，水路散熱均勻。',
        }
      );
    }
  };

  if (!selectedQuote || !costSummary) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        暫無可分析之報價案件
      </div>
    );
  }

  // 差異運算
  const cycleTimeDiff = form.actualCycleTimeSec - selectedQuote.molding.cycleTimeSec;
  const yieldDiff = form.actualYieldPct - selectedQuote.molding.yieldRatePct;
  const matPriceDiff = form.actualMaterialPricePerKg - selectedQuote.material.materialPricePerKg;
  const unitCostDiff = form.actualUnitCost - costSummary.totalUnitCost;

  // 實際毛利率試算
  const actualSellingPrice = costSummary.suggestedUnitPrice;
  const actualProfitPerPart = actualSellingPrice - form.actualUnitCost;
  const actualMarginPct = actualSellingPrice > 0 ? (actualProfitPerPart / actualSellingPrice) * 100 : 0;
  const marginDiff = actualMarginPct - selectedQuote.commercial.targetGrossMarginPct;

  const handleSave = () => {
    onSaveActualRecord(selectedQuote.id, form);
  };

  return (
    <div className="space-y-6">
      {/* 標題與說明 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-600" />
            預估報價 vs. 實際生產成本差異分析 (F11)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            將工廠現場實際成型週期、良率、材料耗用與換模工時回饋系統，持續校正成本參數庫與毛利準確度。
          </p>
        </div>

        {/* 案件切換下拉選單 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">選擇分析案件:</span>
          <select
            value={selectedQuote.id}
            onChange={e => handleSelectQuote(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-semibold"
          >
            {quotations.map(q => (
              <option key={q.id} value={q.id}>
                {q.quoteNumber} - {q.product.partName} ({q.client.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 核心差異看板 (4大對比維度卡片) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 成型週期對比 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">成型週期 (Cycle Time)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-mono font-black text-slate-900">
              {form.actualCycleTimeSec}s
            </span>
            <span className="text-xs text-slate-400">預估: {selectedQuote.molding.cycleTimeSec}s</span>
          </div>
          <div className={`text-xs font-bold flex items-center gap-1 ${
            cycleTimeDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {cycleTimeDiff <= 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                快了 {Math.abs(cycleTimeDiff).toFixed(1)} 秒 (成本更省)
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                慢了 {cycleTimeDiff.toFixed(1)} 秒 (產能侵蝕)
              </>
            )}
          </div>
        </div>

        {/* 2. 成型良率對比 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">實際成型良率 (Yield Rate)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-mono font-black text-slate-900">
              {form.actualYieldPct}%
            </span>
            <span className="text-xs text-slate-400">預估: {selectedQuote.molding.yieldRatePct}%</span>
          </div>
          <div className={`text-xs font-bold flex items-center gap-1 ${
            yieldDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {yieldDiff >= 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                良率提升 +{yieldDiff.toFixed(1)}%
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                良率落後 {yieldDiff.toFixed(1)}%
              </>
            )}
          </div>
        </div>

        {/* 3. 單件總成本差異 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">實際單件成本 (Actual Unit Cost)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-mono font-black text-slate-900">
              NT$ {form.actualUnitCost.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">預估: ${costSummary.totalUnitCost.toFixed(2)}</span>
          </div>
          <div className={`text-xs font-bold flex items-center gap-1 ${
            unitCostDiff <= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {unitCostDiff <= 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                單件節省 NT$ {Math.abs(unitCostDiff).toFixed(2)}
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                超支成本 NT$ +{unitCostDiff.toFixed(2)}
              </>
            )}
          </div>
        </div>

        {/* 4. 實際毛利率偏差 */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xs space-y-1">
          <span className="text-xs text-slate-300 font-medium">實際達成毛利率 (Margin Gap)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-mono font-black text-emerald-400">
              {actualMarginPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">目標: {selectedQuote.commercial.targetGrossMarginPct}%</span>
          </div>
          <div className={`text-xs font-bold flex items-center gap-1 ${
            marginDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {marginDiff >= 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5" />
                毛利優於預期 +{marginDiff.toFixed(1)}%
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5" />
                毛利縮減 {marginDiff.toFixed(1)}%
              </>
            )}
          </div>
        </div>
      </div>

      {/* 工廠實際生產回饋表單與經驗筆記 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            現場實際生產批次資料回饋 (Production Feedback Data)
          </h3>
          <span className="text-xs text-slate-500">
            案件編號: <strong className="font-mono text-slate-800">{selectedQuote.quoteNumber}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">生產批號 (Batch / Lot No.)</label>
            <input
              type="text"
              value={form.batchId}
              onChange={e => setForm(prev => ({ ...prev, batchId: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">生產紀錄日期</label>
            <input
              type="date"
              value={form.productionDate}
              onChange={e => setForm(prev => ({ ...prev, productionDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">成型調機工程師 / 班長</label>
            <input
              type="text"
              value={form.operator}
              onChange={e => setForm(prev => ({ ...prev, operator: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">實際良品產出數量 (件)</label>
            <input
              type="number"
              value={form.actualQuantity}
              onChange={e => setForm(prev => ({ ...prev, actualQuantity: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono font-bold text-blue-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">現場實際成型週期 (秒)</label>
            <input
              type="number"
              step="0.1"
              value={form.actualCycleTimeSec}
              onChange={e => setForm(prev => ({ ...prev, actualCycleTimeSec: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">現場實際成型良率 (%)</label>
            <input
              type="number"
              step="0.1"
              value={form.actualYieldPct}
              onChange={e => setForm(prev => ({ ...prev, actualYieldPct: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">實際原料採購價 (NT$/kg)</label>
            <input
              type="number"
              step="0.5"
              value={form.actualMaterialPricePerKg}
              onChange={e => setForm(prev => ({ ...prev, actualMaterialPricePerKg: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">實際報廢與損耗原料重 (kg)</label>
            <input
              type="number"
              step="0.5"
              value={form.actualScrapKg}
              onChange={e => setForm(prev => ({ ...prev, actualScrapKg: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">實際換模調機工時 (小時)</label>
            <input
              type="number"
              step="0.1"
              value={form.actualSetupTimeHours}
              onChange={e => setForm(prev => ({ ...prev, actualSetupTimeHours: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">現場核算實際單件成本 (NT$)</label>
            <input
              type="number"
              step="0.05"
              value={form.actualUnitCost}
              onChange={e => setForm(prev => ({ ...prev, actualUnitCost: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 text-xs font-mono font-bold text-rose-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">生產現場回饋意見 / 模具工程優化建議</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="例如: 增加冷卻水路後可縮短週期至 25 秒，下次換模建議優先安排..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            儲存實際生產回饋數據 (更新至資料庫)
          </button>
        </div>
      </div>
    </div>
  );
};

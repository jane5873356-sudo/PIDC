/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 歷史報價與相似產品比對搜尋 (F10)
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Scale, 
  Cpu, 
  Copy, 
  TrendingUp, 
  ArrowRight, 
  Sparkles,
  Building,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationCost } from '../utils/costCalculator';

interface HistoricalSearchProps {
  quotations: Quotation[];
  onCloneQuotation: (id: string) => void;
  onEditQuotation: (id: string) => void;
}

export const HistoricalSearch: React.FC<HistoricalSearchProps> = ({
  quotations,
  onCloneQuotation,
  onEditQuotation,
}) => {
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<string>('all');
  const [weightTargetG, setWeightTargetG] = useState<number>(50);
  const [weightTolerancePct, setWeightTolerancePct] = useState<number>(30); // ±30%
  const [selectedTonnage, setSelectedTonnage] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');

  // 相似產品智慧比對與相似度打分算法
  const matchedQuotes = useMemo(() => {
    return quotations.map(quote => {
      let score = 0;
      const reasons: string[] = [];

      // 1. 材質相符度
      if (selectedMaterialCategory !== 'all') {
        if (quote.material.materialName.toUpperCase().includes(selectedMaterialCategory.toUpperCase()) ||
            quote.material.materialGrade.toUpperCase().includes(selectedMaterialCategory.toUpperCase())) {
          score += 40;
          reasons.push(`材質類別完全吻合 (${selectedMaterialCategory})`);
        }
      } else {
        score += 20;
      }

      // 2. 重量相近度
      const minWeight = weightTargetG * (1 - weightTolerancePct / 100);
      const maxWeight = weightTargetG * (1 + weightTolerancePct / 100);
      const weightDiff = Math.abs(quote.material.partWeightG - weightTargetG);
      if (quote.material.partWeightG >= minWeight && quote.material.partWeightG <= maxWeight) {
        const weightScore = Math.max(0, 30 - (weightDiff / (weightTargetG || 1)) * 30);
        score += weightScore;
        reasons.push(`重量落於 ±${weightTolerancePct}% 區間 (${quote.material.partWeightG}g vs 目標 ${weightTargetG}g)`);
      }

      // 3. 機台噸數匹配
      if (selectedTonnage !== 'all') {
        const targetTon = parseInt(selectedTonnage);
        if (Math.abs(quote.molding.machineTonnage - targetTon) <= 50) {
          score += 20;
          reasons.push(`機台噸數相近 (${quote.molding.machineTonnage}T)`);
        }
      } else {
        score += 10;
      }

      // 4. 關鍵字加分
      if (keyword.trim()) {
        const k = keyword.toLowerCase();
        if (quote.product.partName.toLowerCase().includes(k) ||
            quote.product.partNumber.toLowerCase().includes(k) ||
            quote.client.name.toLowerCase().includes(k)) {
          score += 20;
          reasons.push(`品名或客戶匹配關鍵字 "${keyword}"`);
        }
      }

      const matchPct = Math.min(100, Math.round(score));
      const costSummary = calculateQuotationCost(quote);

      return {
        quote,
        matchPct,
        reasons,
        costSummary,
      };
    }).sort((a, b) => b.matchPct - a.matchPct);
  }, [quotations, selectedMaterialCategory, weightTargetG, weightTolerancePct, selectedTonnage, keyword]);

  return (
    <div className="space-y-6">
      {/* 標題與說明 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          歷史報價查詢與相似零件匹配 (F10)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          新零件詢價時，透過產品重量區間、材質分類與機台規格，秒速檢索過往成交或報價案例，作為本次估價成型週期與成本基準。
        </p>
      </div>

      {/* 相似特徵比對篩選器 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          設定欲比對的工程特徵條件 (Similarity Criteria)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 材質類別 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">塑膠原料分類</label>
            <select
              value={selectedMaterialCategory}
              onChange={e => setSelectedMaterialCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
            >
              <option value="all">不限材質 (All Materials)</option>
              <option value="ABS">ABS 系列</option>
              <option value="PC">PC 系列</option>
              <option value="PC/ABS">PC/ABS 複合料</option>
              <option value="PP">PP 聚丙烯</option>
              <option value="POM">POM 聚甲醛塑鋼</option>
              <option value="PA66">PA66 尼龍加纖</option>
              <option value="PMMA">PMMA 光學壓克力</option>
              <option value="TPU">TPU 彈性體</option>
            </select>
          </div>

          {/* 預估重量 (g) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-700">目標產品單重 (g)</label>
              <span className="font-mono font-bold text-indigo-600">{weightTargetG} g</span>
            </div>
            <input
              type="range"
              min="2"
              max="200"
              value={weightTargetG}
              onChange={e => setWeightTargetG(parseInt(e.target.value) || 1)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5g</span>
              <span>50g</span>
              <span>100g</span>
              <span>200g</span>
            </div>
          </div>

          {/* 機台噸數 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">目標機台噸數 (T)</label>
            <select
              value={selectedTonnage}
              onChange={e => setSelectedTonnage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
            >
              <option value="all">不限機台 (All Tonnage)</option>
              <option value="50">50T 小型精密</option>
              <option value="100">100T 精密電動</option>
              <option value="180">180T 中型伺服</option>
              <option value="250">250T 泛用機</option>
              <option value="350">350T 大型機</option>
              <option value="500">500T 重型機</option>
            </select>
          </div>

          {/* 關鍵字補充 */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">品名 / 客戶關鍵字</label>
            <input
              type="text"
              placeholder="外殼、齒輪、車用..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* 匹配結果列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>共檢索出 {matchedQuotes.length} 筆相似零件報價案例</span>
          <span>依工程特徵相似度 (Match %) 由高至低排序</span>
        </div>

        {matchedQuotes.map(({ quote, matchPct, reasons, costSummary }) => (
          <div
            key={quote.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all space-y-3"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {quote.quoteNumber}
                  </span>
                  <span className="text-xs text-slate-500">{quote.client.name}</span>

                  {/* 相似度標籤 */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    matchPct >= 70
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : matchPct >= 50
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    相似度 {matchPct}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {quote.product.partName}
                  <span className="text-xs font-mono font-normal text-slate-400 ml-2">
                    (料號: {quote.product.partNumber})
                  </span>
                </h3>

                {/* 匹配原因說明 */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {reasons.map((r, i) => (
                    <span key={i} className="text-[11px] text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* 歷史核心數據與快捷引用按鈕 */}
              <div className="flex items-center gap-5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-right text-xs space-y-0.5 font-mono">
                  <div className="text-slate-500 text-[11px]">材質 / 單重</div>
                  <div className="font-bold text-slate-800">{quote.material.materialName} ({quote.material.partWeightG}g)</div>
                </div>

                <div className="text-right text-xs space-y-0.5 font-mono">
                  <div className="text-slate-500 text-[11px]">成型週期 / 穴數</div>
                  <div className="font-bold text-slate-800">{quote.molding.cycleTimeSec}s / {quote.molding.cavities}穴 ({quote.molding.machineTonnage}T)</div>
                </div>

                <div className="text-right text-xs space-y-0.5 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 min-w-[110px]">
                  <div className="text-indigo-600 font-semibold text-[11px]">歷史單件報價</div>
                  <div className="text-base font-black font-mono text-indigo-900">
                    NT$ {costSummary.suggestedUnitPrice.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onCloneQuotation(quote.id)}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm cursor-pointer"
                    title="以此相似案件複製參數，建立全新詢價案"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    複製建新案
                  </button>

                  <button
                    onClick={() => onEditQuotation(quote.id)}
                    type="button"
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-300"
                  >
                    檢視明細
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

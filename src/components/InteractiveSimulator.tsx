/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 互動式報價試算範例 (規格書第三節標準實作)
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Copy, 
  Check, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  Percent, 
  DollarSign, 
  Sliders, 
  FilePlus,
  TrendingUp,
  Layers,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { calculateSimpleInteractiveQuote, SimpleQuoteInput } from '../utils/costCalculator';

interface InteractiveSimulatorProps {
  onCreateQuoteFromSimulator?: (params: SimpleQuoteInput) => void;
}

// 規格書第三節示範標準預設數值
// 材料單價 68元/kg, 耗料重 60g, 週期 25s, 穴數 1, 機台費率 418元/時, 報價3000件, 換模費4500元, 良率94%, 毛利率25%
const DEFAULT_SPEC_VALUES: SimpleQuoteInput = {
  materialPricePerKg: 68,
  materialWeightPerPartG: 60,
  cycleTimeSec: 25,
  cavities: 1,
  machineRatePerHour: 418,
  orderQuantity: 3000,
  batchSetupCost: 4500,
  yieldRatePct: 94,
  targetGrossMarginPct: 25,
};

export const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({
  onCreateQuoteFromSimulator,
}) => {
  const [params, setParams] = useState<SimpleQuoteInput>(DEFAULT_SPEC_VALUES);
  const [copied, setCopied] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  const result = useMemo(() => {
    return calculateSimpleInteractiveQuote(params);
  }, [params]);

  const handleChange = (key: keyof SimpleQuoteInput, value: number) => {
    setParams(prev => ({
      ...prev,
      [key]: isNaN(value) ? 0 : value,
    }));
  };

  const handleResetToSpec = () => {
    setParams(DEFAULT_SPEC_VALUES);
  };

  const handleCopyResult = async () => {
    const text = `【久揚塑膠｜射出零件成本試算結果】
-------------------------------------
● 材料單價：${params.materialPricePerKg} 元/kg
● 單模耗料重：${params.materialWeightPerPartG} g
● 成型週期：${params.cycleTimeSec} 秒
● 每模良品穴數：${params.cavities} 穴
● 機台費率：${params.machineRatePerHour} 元/時
● 報價批量：${params.orderQuantity.toLocaleString()} 件
● 每批換模調機費：${params.batchSetupCost.toLocaleString()} 元
● 預估良率：${params.yieldRatePct}%
● 目標毛利率：${params.targetGrossMarginPct}%
-------------------------------------
【試算成本結構】
1. 材料成本：NT$ ${result.materialCost.toFixed(2)}
2. 成型成本：NT$ ${result.moldingCost.toFixed(2)}
3. 換模調機分攤：NT$ ${result.setupCost.toFixed(2)}
-------------------------------------
★ 預估單件成本：NT$ ${result.totalUnitCost.toFixed(2)}
★ 建議單件報價：NT$ ${result.suggestedPrice.toFixed(2)}
★ 預估單件毛利：NT$ ${result.grossProfit.toFixed(2)} (毛利率 ${result.actualGrossMargin}%)
-------------------------------------
(此為標準工程試算模型，由久揚塑膠射出成本系統產出)`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 比例計算 (供視覺化長條圖)
  const total = Math.max(0.01, result.totalUnitCost);
  const matPct = Math.round((result.materialCost / total) * 100);
  const moldPct = Math.round((result.moldingCost / total) * 100);
  const setupPct = Math.max(0, 100 - matPct - moldPct);

  return (
    <div className="space-y-6">
      {/* 標題與引言區 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              規格書標準範例・即時參數沙盒
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-blue-400" />
              互動式報價試算範例 (What-If 模擬器)
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              修改材料單價、週期、穴數及訂購批量，系統將即時重新運算材料、成型與換模成本分攤，驗證最佳生產邊界條件。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetToSpec}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              title="重設為規格書規範之示範數值"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              規格書示範值
            </button>
            <button
              onClick={() => setShowFormulaModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-300 bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/50 rounded-lg transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              公式透明檢視
            </button>
            {onCreateQuoteFromSimulator && (
              <button
                onClick={() => onCreateQuoteFromSimulator(params)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
                轉為正式詢價案件
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主體網格：左側參數控制器，右側結果與毛利看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側：9 大工程參數控制器 */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <Sliders className="w-4 h-4 text-blue-600" />
              製程與商業變數設定 (9項核心參數)
            </h3>
            <span className="text-xs text-slate-500">可拖動滑桿或直接鍵入數值</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {/* 1. 材料單價 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  材料單價
                  <span className="text-slate-400 font-normal">(元/kg)</span>
                </label>
                <span className="font-mono font-bold text-blue-600">NT$ {params.materialPricePerKg}</span>
              </div>
              <input
                type="range"
                min={30}
                max={250}
                step={1}
                value={params.materialPricePerKg}
                onChange={e => handleChange('materialPricePerKg', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>PP ($48)</span>
                <span>ABS ($68)</span>
                <span>PC ($115)</span>
                <span>PA66 ($165)</span>
              </div>
            </div>

            {/* 2. 單模可分攤耗料重 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  單模可分攤耗料重
                  <span className="text-slate-400 font-normal">(g)</span>
                </label>
                <span className="font-mono font-bold text-blue-600">{params.materialWeightPerPartG} g</span>
              </div>
              <input
                type="range"
                min={2}
                max={300}
                step={1}
                value={params.materialWeightPerPartG}
                onChange={e => handleChange('materialWeightPerPartG', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>微小件 (5g)</span>
                <span>標準件 (50g)</span>
                <span>大件 (200g+)</span>
              </div>
            </div>

            {/* 3. 成型週期 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  成型週期
                  <span className="text-slate-400 font-normal">(秒)</span>
                </label>
                <span className="font-mono font-bold text-amber-600">{params.cycleTimeSec} 秒</span>
              </div>
              <input
                type="range"
                min={8}
                max={90}
                step={1}
                value={params.cycleTimeSec}
                onChange={e => handleChange('cycleTimeSec', parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>極速 (12s)</span>
                <span>標準 (25s)</span>
                <span>厚件 (50s+)</span>
              </div>
            </div>

            {/* 4. 每模良品穴數 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  每模良品穴數
                  <span className="text-slate-400 font-normal">(Cavities)</span>
                </label>
                <span className="font-mono font-bold text-amber-600">{params.cavities} 穴</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 4, 8, 16].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleChange('cavities', c)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      params.cavities === c
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {c} 穴
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 機台費率 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  機台費率
                  <span className="text-slate-400 font-normal">(元/時)</span>
                </label>
                <span className="font-mono font-bold text-indigo-600">NT$ {params.machineRatePerHour}</span>
              </div>
              <input
                type="range"
                min={200}
                max={1200}
                step={10}
                value={params.machineRatePerHour}
                onChange={e => handleChange('machineRatePerHour', parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>50T ($280)</span>
                <span>180T ($480)</span>
                <span>350T ($780)</span>
              </div>
            </div>

            {/* 6. 報價數量 (批量) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  報價數量
                  <span className="text-slate-400 font-normal">(件)</span>
                </label>
                <span className="font-mono font-bold text-emerald-600">{params.orderQuantity.toLocaleString()} 件</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1000, 3000, 5000, 10000, 20000].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleChange('orderQuantity', q)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      params.orderQuantity === q
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {q >= 10000 ? `${q / 10000}萬` : `${q / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. 每批換模調機費 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  每批換模調機費
                  <span className="text-slate-400 font-normal">(元)</span>
                </label>
                <span className="font-mono font-bold text-rose-600">NT$ {params.batchSetupCost.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={15000}
                step={500}
                value={params.batchSetupCost}
                onChange={e => handleChange('batchSetupCost', parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>簡易模 ($2k)</span>
                <span>標準模 ($4.5k)</span>
                <span>雙色/熱流道 ($8k+)</span>
              </div>
            </div>

            {/* 8. 預估良率 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  預估良率
                  <span className="text-slate-400 font-normal">(%)</span>
                </label>
                <span className="font-mono font-bold text-blue-600">{params.yieldRatePct}%</span>
              </div>
              <input
                type="range"
                min={85}
                max={99.5}
                step={0.5}
                value={params.yieldRatePct}
                onChange={e => handleChange('yieldRatePct', parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>一般 (92%)</span>
                <span>標準 (96%)</span>
                <span>高精穩定 (99%)</span>
              </div>
            </div>

            {/* 9. 目標毛利率 (跨雙欄) */}
            <div className="sm:col-span-2 space-y-1.5 p-3 rounded-xl bg-blue-50/60 border border-blue-200">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-600" />
                  目標毛利率 (Target Margin %)
                </label>
                <span className="font-mono font-black text-lg text-blue-700">{params.targetGrossMarginPct}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={1}
                value={params.targetGrossMarginPct}
                onChange={e => handleChange('targetGrossMarginPct', parseFloat(e.target.value))}
                className="w-full accent-blue-700 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-blue-600/80 font-medium">
                <span>衝量促銷 (15%)</span>
                <span>標準報價 (25%)</span>
                <span>精密特殊件 (35%)</span>
                <span>客製打樣 (45%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：計算結果面板 (嚴格對應規格書格式與展示卡) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h4 className="font-bold text-white tracking-wide text-base">即時成本與建議售價</h4>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                毛利 {params.targetGrossMarginPct}%
              </span>
            </div>

            {/* 兩大主角大字卡：預估單件成本 vs 建議單件報價 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1">
                <span className="text-xs text-slate-400 block font-medium">預估單件成本</span>
                <div className="text-2xl font-black font-mono text-slate-100 flex items-baseline gap-1">
                  <span className="text-xs font-normal text-slate-400">NT$</span>
                  {result.totalUnitCost.toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-500 block">三項核心成本加總</span>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/60 to-indigo-900/40 border border-blue-500/40 space-y-1 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-xl" />
                <span className="text-xs text-blue-300 block font-semibold">建議單件報價</span>
                <div className="text-2xl font-black font-mono text-blue-200 flex items-baseline gap-1">
                  <span className="text-xs font-normal text-blue-300">NT$</span>
                  {result.suggestedPrice.toFixed(2)}
                </div>
                <span className="text-[11px] text-blue-400 block font-medium">
                  單件毛利 NT$ {result.grossProfit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 成本明細項目表 (規格書標準格式) */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-slate-300">材料成本</span>
                  <span className="text-xs text-slate-500">({matPct}%)</span>
                </div>
                <span className="font-mono font-bold text-slate-100">NT$ {result.materialCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300">成型成本</span>
                  <span className="text-xs text-slate-500">({moldPct}%)</span>
                </div>
                <span className="font-mono font-bold text-slate-100">NT$ {result.moldingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-300">換模調機分攤</span>
                  <span className="text-xs text-slate-500">({setupPct}%)</span>
                </div>
                <span className="font-mono font-bold text-slate-100">NT$ {result.setupCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">預估單件毛利</span>
                </div>
                <span className="font-mono font-bold text-emerald-300">NT$ {result.grossProfit.toFixed(2)}</span>
              </div>
            </div>

            {/* 視覺化結構長條圖 */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>單件成本分佈比例</span>
                <span>總成本 100%</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${matPct}%` }} 
                  className="bg-blue-500 transition-all duration-300" 
                  title={`材料 ${matPct}%`} 
                />
                <div 
                  style={{ width: `${moldPct}%` }} 
                  className="bg-amber-500 transition-all duration-300" 
                  title={`成型 ${moldPct}%`} 
                />
                <div 
                  style={{ width: `${setupPct}%` }} 
                  className="bg-rose-500 transition-all duration-300" 
                  title={`換模 ${setupPct}%`} 
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 材料
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 成型
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> 換模
                </span>
              </div>
            </div>

            {/* 一鍵複製試算結果按鈕 (規格書明確要求) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyResult}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    已複製試算結果至剪貼簿！
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    複製試算結果
                  </>
                )}
              </button>
            </div>

            {/* 規格書附註說明文字 */}
            <div className="bg-slate-800/60 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed border border-slate-700/60">
              <p className="font-semibold text-slate-300 mb-0.5">📌 試算規格備註：</p>
              此為簡化試算原型。材料重量假設為每件應分攤的原料耗用量，良率統一分攤材料與成型費；尚未計入料頭回收、添加劑、後加工、包裝、運費及管理費，正式量產報價請使用「專案核算」完整模組。
            </div>
          </div>
        </div>
      </div>

      {/* 公式透通對話框 Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                射出成本計算邏輯與公式透明檢視
              </h3>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200/80">
                <h4 className="font-bold text-blue-900 mb-1">1. 材料成本 (Material Cost)</h4>
                <code className="text-xs bg-white px-2 py-1 rounded text-blue-800 font-mono block mb-1">
                  材料成本 = (耗料重 g ÷ 1000) × 材料單價 (元/kg) ÷ (預估良率 %)
                </code>
                <p className="text-xs text-blue-950">
                  當前帶入：({params.materialWeightPerPartG} ÷ 1000) × {params.materialPricePerKg} ÷ {(params.yieldRatePct / 100).toFixed(2)} = 
                  <strong className="font-mono text-blue-700 ml-1">NT$ {result.materialCost.toFixed(2)}</strong>
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80">
                <h4 className="font-bold text-amber-900 mb-1">2. 成型加工成本 (Molding Cost)</h4>
                <code className="text-xs bg-white px-2 py-1 rounded text-amber-800 font-mono block mb-1">
                  成型成本 = (成型週期 秒 ÷ 3600) × 機台每小時費率 ÷ (穴數 × 預估良率 %)
                </code>
                <p className="text-xs text-amber-950">
                  當前帶入：({params.cycleTimeSec} ÷ 3600) × {params.machineRatePerHour} ÷ ({params.cavities} × {(params.yieldRatePct / 100).toFixed(2)}) = 
                  <strong className="font-mono text-amber-700 ml-1">NT$ {result.moldingCost.toFixed(2)}</strong>
                </p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/80">
                <h4 className="font-bold text-rose-900 mb-1">3. 換模調機成本分攤 (Setup Cost Amortization)</h4>
                <code className="text-xs bg-white px-2 py-1 rounded text-rose-800 font-mono block mb-1">
                  換模分攤 = 每批換模調機固定總費 ÷ 該批報價良品數量
                </code>
                <p className="text-xs text-rose-950">
                  當前帶入：{params.batchSetupCost.toLocaleString()} ÷ {params.orderQuantity.toLocaleString()} = 
                  <strong className="font-mono text-rose-700 ml-1">NT$ {result.setupCost.toFixed(2)}</strong>
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <h4 className="font-bold text-emerald-900 mb-1">4. 建議單件報價 (Suggested Price)</h4>
                <code className="text-xs bg-white px-2 py-1 rounded text-emerald-800 font-mono block mb-1">
                  建議報價 = 單件總成本 ÷ (1 － 目標毛利率)
                </code>
                <p className="text-xs text-emerald-950">
                  當前帶入：{result.totalUnitCost.toFixed(2)} ÷ (1 － {params.targetGrossMarginPct}%) = 
                  <strong className="font-mono text-emerald-700 ml-1">NT$ {result.suggestedPrice.toFixed(2)}</strong>
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 cursor-pointer"
              >
                了解並關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

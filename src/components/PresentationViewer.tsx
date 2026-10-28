/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 簡報展示與 PPT / PTT 檔案匯出中心
 */

import React, { useState } from 'react';
import { 
  Presentation, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  FileText, 
  Copy, 
  Check, 
  Sparkles, 
  Maximize2, 
  Layers, 
  Cpu, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Calendar,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationCost, calculateTieredPricing } from '../utils/costCalculator';
import { exportQuotationToPptx } from '../utils/pptxExport';

interface PresentationViewerProps {
  quote: Quotation;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  quote,
  onBack,
  onEdit,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedPtt, setCopiedPtt] = useState(false);
  const [activeFormat, setActiveFormat] = useState<'ppt-slides' | 'ptt-bbs'>('ppt-slides');

  const cost = calculateQuotationCost(quote);
  const tiers = calculateTieredPricing(quote);

  // 匯出 PPTX 檔案
  const handleDownloadPptx = async () => {
    try {
      setIsExporting(true);
      await exportQuotationToPptx(quote);
    } catch (err) {
      console.error('PPTX export error:', err);
      alert('產生 PowerPoint 簡報檔案時發生問題，請稍候重試。');
    } finally {
      setIsExporting(false);
    }
  };

  // PTT BBS 格式純文字
  const generatePttBbsText = () => {
    return `作者: JiouYang (久揚塑膠工程部) 看板: Mechanical
標題: [報價] 塑膠射出零件成本核算報價單 - ${quote.product.partName}
時間: ${new Date().toLocaleString('zh-TW')}

┌─────────────────────────────────────────────────────────────┐
│ ★ 久揚塑膠股份有限公司 JIOU YANG PLASTIC CO., LTD.          │
│ 塑膠射出零件專案成本報價與規格提報單                       │
└─────────────────────────────────────────────────────────────┘

【一、案件基本資訊】
● 報價單號: ${quote.quoteNumber} (版本: ${quote.version})
● 客戶名稱: ${quote.client.name} (${quote.client.contactPerson || '採購代表'})
● 產品品名: ${quote.product.partName}
● 客戶料號: ${quote.product.partNumber}
● 詢價批量: ${quote.commercial.orderQuantity.toLocaleString()} 件 (MOQ: ${quote.commercial.moq || 1000} 件)
● 標準交期: ${quote.commercial.leadTimeDays || 14} 工作天 ｜ 有效期: 30天

【二、工程材料與模具規格】
● 塑膠原料: ${quote.material.materialName} (${quote.material.materialGrade})
● 原料單價: NT$ ${quote.material.materialPricePerKg} / kg
● 成品單重: ${quote.material.partWeightG} g (料頭分攤 ${(quote.material.runnerWeightG / Math.max(1, quote.molding.cavities)).toFixed(2)} g)
● 模穴穴數: ${quote.molding.cavities} 穴 ｜ 射出機台: ${quote.molding.machineTonnage} 噸 (時費 NT$ ${quote.molding.machineRatePerHour}/hr)
● 成型週期: ${quote.molding.cycleTimeSec} 秒 ｜ 預估良率: ${quote.molding.yieldRatePct}%
● 模具估價: NT$ ${quote.molding.moldEstimatedCost.toLocaleString()} (${quote.molding.moldLifeShots.toLocaleString()} 模次壽命)

【三、成本結構詳細拆解 (單件)】
1. 材料成本: NT$ ${cost.materialCostPerPart.toFixed(2)}
2. 成型加工: NT$ ${cost.moldingCostPerPart.toFixed(2)}
3. 換模分攤: NT$ ${cost.setupCostPerPart.toFixed(2)} (整批固定換模費 NT$ ${cost.totalSetupBatchCost.toLocaleString()})
4. 後加工包運: NT$ ${cost.postProcessCostPerPart.toFixed(2)}
5. 廠務管銷: NT$ ${cost.managementExpensePerPart.toFixed(2)} (${quote.commercial.managementExpenseRatePct}%)
─────────────────────────────────────────────
★ 單件總製造成本: NT$ ${cost.totalUnitCost.toFixed(2)}
★ 目標毛利率: ${quote.commercial.targetGrossMarginPct}% (單件毛利 NT$ ${cost.grossProfitPerPart.toFixed(2)})
★ 建議單件正式報價: NT$ ${cost.suggestedUnitPrice.toFixed(2)} (未稅)
★ 整批預估總營業額: NT$ ${cost.batchTotalRevenue.toLocaleString()}

【四、多批量階梯報價矩陣 (量大折讓方案)】
${tiers
  .map(
    t =>
      `  • ${t.quantity.toLocaleString().padStart(6)} 件 ── 單價 NT$ ${t.suggestedPrice.toFixed(2)} ── 總額 NT$ ${t.totalRevenue.toLocaleString()}`
  )
  .join('\n')}

【五、備註與條款】
1. 報價均為未稅價格，營業稅 5% 外加。
2. 付款條件: ${quote.commercial.paymentTerms || '月結 30 天'} ｜ 交易交貨: ${quote.commercial.tradeTerms || '送貨到廠 (DDP)'}
3. 承辦業務: ${quote.createdBy} ｜ 核准主管: ${quote.approval?.reviewedBy || '林建興 廠長'}
--
※ 發信站: 批踢踢實業坊(ptt.cc) ◆ 來自: 久揚塑膠企業雲端專網`;
  };

  const handleCopyPtt = async () => {
    try {
      await navigator.clipboard.writeText(generatePttBbsText());
      setCopiedPtt(true);
      setTimeout(() => setCopiedPtt(false), 2500);
    } catch {
      setCopiedPtt(true);
      setTimeout(() => setCopiedPtt(false), 2500);
    }
  };

  // 簡報投影片清單 (Slides)
  const slides = [
    // Slide 0: 封面
    {
      title: '專案封面',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              久揚塑膠股份有限公司 ｜ JIOU YANG PLASTIC CO., LTD.
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
              塑膠射出零件成本核算與正式報價簡報
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-blue-300">
              {quote.product.partName}
            </p>
            <p className="text-sm text-slate-400">
              客戶料號: <span className="font-mono text-slate-200">{quote.product.partNumber}</span> ｜ 買方客戶: <span className="text-slate-200 font-semibold">{quote.client.name}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[11px] text-slate-400 block">報價單號 / 版本</span>
              <span className="font-mono font-bold text-white text-sm">{quote.quoteNumber} ({quote.version})</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">詢價批量</span>
              <span className="font-mono font-bold text-blue-300 text-sm">{quote.commercial.orderQuantity.toLocaleString()} 件</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">建議單件報價</span>
              <span className="font-mono font-black text-emerald-400 text-lg">NT$ {cost.suggestedUnitPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">目標毛利率</span>
              <span className="font-mono font-bold text-emerald-300 text-sm">{quote.commercial.targetGrossMarginPct}%</span>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 1: 產品規格與工程圖面
    {
      title: '產品規格與圖面',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 01</span>
            <h2 className="text-2xl font-black text-slate-900">產品規格與 2D/3D CAD 圖面管理</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* 左側：規格清單 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">規格項目</th>
                    <th className="py-2.5 px-3">技術參數說明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">產品品名</td><td className="py-2 px-3 font-bold text-slate-900">{quote.product.partName}</td></tr>
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">客戶料號</td><td className="py-2 px-3 font-mono">{quote.product.partNumber}</td></tr>
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">外觀尺寸</td><td className="py-2 px-3">{quote.product.dimensionsMm || '依圖面標示'}</td></tr>
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">公差等級</td><td className="py-2 px-3">{quote.product.toleranceGrade}</td></tr>
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">外觀咬花</td><td className="py-2 px-3">{quote.product.surfaceFinish}</td></tr>
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">成品單重</td><td className="py-2 px-3 font-bold text-blue-700">{quote.material.partWeightG} g</td></tr>
                  <tr><td className="py-2 px-3 font-semibold text-slate-600">分攤料頭重</td><td className="py-2 px-3">{(quote.material.runnerWeightG / Math.max(1, quote.molding.cavities)).toFixed(2)} g / 件</td></tr>
                </tbody>
              </table>
            </div>

            {/* 右側：特殊要求與圖面 */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-2">
                <h4 className="font-bold text-blue-900">特殊工程規範與材料認證</h4>
                <ul className="space-y-1 text-slate-700 list-disc list-inside">
                  {quote.product.specialRequirements?.length ? (
                    quote.product.specialRequirements.map((r, i) => <li key={i}>{r}</li>)
                  ) : (
                    <>
                      <li>符合 RoHS / REACH 環保無鹵規範</li>
                      <li>依精密射出成型常規公差檢驗標準驗收</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-900">2D/3D CAD 圖面管制紀錄</h4>
                <div className="space-y-1 text-slate-600">
                  {quote.product.drawings?.length ? (
                    quote.product.drawings.map(d => (
                      <div key={d.id} className="flex justify-between py-1 border-b border-slate-200/60">
                        <span className="font-semibold text-slate-800">[{d.fileType}] {d.fileName}</span>
                        <span className="text-slate-400">{d.fileSize}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400">3D CAD 模型已完成模流分析（Moldflow）充填檢討</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 2: 原料成本核算
    {
      title: '材料成本分析',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 02</span>
            <h2 className="text-2xl font-black text-slate-900">材料成本精確工程核算 (Material Cost)</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">塑膠原料規格</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{quote.material.materialName}</p>
              <p className="text-[11px] font-mono text-slate-500">{quote.material.materialGrade}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">新料基準單價</span>
              <p className="text-xl font-bold font-mono text-blue-700 mt-1">NT$ {quote.material.materialPricePerKg}</p>
              <p className="text-[11px] text-slate-400">元 / kg</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">單件總生耗料重</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">{cost.grossMaterialWeightPerPartG} g</p>
              <p className="text-[11px] text-slate-400">含模穴料頭均攤</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">單件材料總成本</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-1">NT$ {cost.materialCostPerPart.toFixed(2)}</p>
              <p className="text-[11px] text-emerald-600 font-medium">含損耗與次料調整</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">材料計算變數</th>
                  <th className="py-2.5 px-3">參數值</th>
                  <th className="py-2.5 px-3">工程計算與配方說明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 font-semibold">回收次料混用比例</td>
                  <td className="py-2 px-3 font-mono">{quote.material.regrindRatioPct}%</td>
                  <td className="py-2 px-3 text-slate-600">次料折價損失 {quote.material.regrindDiscountPct}%，線上粉碎回用降低成本</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">色母 / 特殊添加劑</td>
                  <td className="py-2 px-3 font-mono">{quote.material.additiveRatioPct}%</td>
                  <td className="py-2 px-3 text-slate-600">單價 NT$ {quote.material.additivePricePerKg}/kg，均勻著色添加</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">加權有效原料價</td>
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">NT$ {cost.effectiveMaterialPricePerKg}/kg</td>
                  <td className="py-2 px-3 text-slate-600">新料 + 次料折價 + 色母添加劑加權計算</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold">材料耗損與成型良率</td>
                  <td className="py-2 px-3 font-mono">損耗 {quote.material.materialLossRatePct}% / 良率 {quote.molding.yieldRatePct}%</td>
                  <td className="py-2 px-3 text-slate-600">烘料水分揮發、殘料及不良品耗料由良品分攤</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // Slide 3: 成型製程與機台費率
    {
      title: '成型加工成本',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 03</span>
            <h2 className="text-2xl font-black text-slate-900">成型加工成本與機台產能規劃 (Molding Process)</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">機台鎖模力</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">{quote.molding.machineTonnage} T 噸</p>
              <p className="text-[11px] text-slate-400">伺服/全電動精密機</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">機台每小時時費</span>
              <p className="text-xl font-bold font-mono text-indigo-700 mt-1">NT$ {quote.molding.machineRatePerHour}</p>
              <p className="text-[11px] text-slate-400">元 / 小時</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">成型週期 / 模穴</span>
              <p className="text-xl font-bold font-mono text-amber-600 mt-1">{quote.molding.cycleTimeSec}s / {quote.molding.cavities}穴</p>
              <p className="text-[11px] text-slate-400">預估良率 {quote.molding.yieldRatePct}%</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">單件成型加工費</span>
              <p className="text-2xl font-black font-mono text-emerald-700 mt-1">NT$ {cost.moldingCostPerPart.toFixed(2)}</p>
              <p className="text-[11px] text-emerald-600 font-medium">時費 ÷ 每小時良品產能</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900">工程產能分析指標：</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">每小時射出模次</span>
                <span className="text-base font-bold font-mono text-slate-800">{cost.shotsPerHour} 模/hr</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">每小時良品產能</span>
                <span className="text-base font-bold font-mono text-blue-700">{cost.goodPartsPerHour} 件/hr</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">本次訂單總射出工時</span>
                <span className="text-base font-bold font-mono text-indigo-700">
                  {(quote.commercial.orderQuantity / Math.max(1, cost.goodPartsPerHour)).toFixed(1)} 小時
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: 換模分攤與後加工
    {
      title: '換模與後加工',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 04</span>
            <h2 className="text-2xl font-black text-slate-900">換模調機分攤與後加工二次製程</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 text-xs">
            {/* 換模調機 */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">換模調機固定費攤提 (Setup)</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">基本換模調機工費</span>
                  <span className="font-mono font-semibold">NT$ {quote.setup.setupFixedFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">清料洗管料耗 ({quote.setup.purgeResinKg} kg)</span>
                  <span className="font-mono font-semibold">NT$ {(quote.setup.purgeResinKg * quote.material.materialPricePerKg).toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">試模校車模次 ({quote.setup.trialShots} 模)</span>
                  <span className="font-mono font-semibold">模具開機調整耗損</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200 text-slate-900 font-bold">
                  <span>整批換模總支出</span>
                  <span className="font-mono">NT$ {cost.totalSetupBatchCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-rose-800">單件分攤換模調機費：</span>
                <span className="font-mono font-bold text-rose-700 text-sm">NT$ {cost.setupCostPerPart.toFixed(2)}</span>
              </div>
            </div>

            {/* 後加工 */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">後加工與二次製程小計 (Secondary Ops)</h3>
              <div className="space-y-1.5">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">剪料頭 / 修毛邊</span>
                  <span className="font-mono">NT$ {quote.postProcess.gateTrimmingUnitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">超音波熔接 / 埋螺母</span>
                  <span className="font-mono">NT$ {quote.postProcess.ultrasonicUnitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">網印 / 移印 / 雷雕打標</span>
                  <span className="font-mono">NT$ {quote.postProcess.printingUnitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">專用吸塑包材 / 外箱</span>
                  <span className="font-mono">NT$ {quote.postProcess.packagingUnitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">品檢三次元 / 氣密檢測</span>
                  <span className="font-mono">NT$ {quote.postProcess.inspectionUnitCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-emerald-800">單件後加工與運費總計：</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">NT$ {cost.postProcessCostPerPart.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: 成本彙總與建議售價
    {
      title: '成本結構與報價',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 05</span>
            <h2 className="text-2xl font-black text-slate-900">成本結構彙總與建議正式報價 (Summary)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-1">
              <span className="text-xs text-slate-400 block font-medium">單件總製造成本 (Unit Total Cost)</span>
              <p className="text-3xl font-black font-mono text-white">NT$ {cost.totalUnitCost.toFixed(2)}</p>
              <p className="text-xs text-slate-400 pt-1">
                直接製造成本 NT$ {cost.directManufacturingCost.toFixed(2)} ＋ 廠務管銷 ({quote.commercial.managementExpenseRatePct}%)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white space-y-1">
              <span className="text-xs text-blue-200 block font-semibold">建議單件正式報價 (Suggested Price)</span>
              <p className="text-3xl font-black font-mono text-white">NT$ {cost.suggestedUnitPrice.toFixed(2)}</p>
              <p className="text-xs text-emerald-300 font-bold pt-1">
                預估單件毛利 NT$ {cost.grossProfitPerPart.toFixed(2)} ｜ 目標毛利率 {quote.commercial.targetGrossMarginPct}%
              </p>
            </div>
          </div>

          {/* 成本項目清單 */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2 px-3">成本結構項目</th>
                  <th className="py-2 px-3 text-right">單件金額</th>
                  <th className="py-2 px-3 text-right">占比</th>
                  <th className="py-2 px-3 text-right">整批總額 ({quote.commercial.orderQuantity.toLocaleString()}件)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="py-1.5 px-3 font-sans font-semibold text-slate-800">1. 原料成本</td>
                  <td className="py-1.5 px-3 text-right">NT$ {cost.materialCostPerPart.toFixed(2)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-500">{Math.round((cost.materialCostPerPart / cost.totalUnitCost) * 100)}%</td>
                  <td className="py-1.5 px-3 text-right">NT$ {(cost.materialCostPerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-sans font-semibold text-slate-800">2. 成型加工費</td>
                  <td className="py-1.5 px-3 text-right">NT$ {cost.moldingCostPerPart.toFixed(2)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-500">{Math.round((cost.moldingCostPerPart / cost.totalUnitCost) * 100)}%</td>
                  <td className="py-1.5 px-3 text-right">NT$ {(cost.moldingCostPerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-sans font-semibold text-slate-800">3. 換模調機分攤</td>
                  <td className="py-1.5 px-3 text-right">NT$ {cost.setupCostPerPart.toFixed(2)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-500">{Math.round((cost.setupCostPerPart / cost.totalUnitCost) * 100)}%</td>
                  <td className="py-1.5 px-3 text-right">NT$ {cost.totalSetupBatchCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-sans font-semibold text-slate-800">4. 後加工包運費</td>
                  <td className="py-1.5 px-3 text-right">NT$ {cost.postProcessCostPerPart.toFixed(2)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-500">{Math.round((cost.postProcessCostPerPart / cost.totalUnitCost) * 100)}%</td>
                  <td className="py-1.5 px-3 text-right">NT$ {(cost.postProcessCostPerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-sans font-semibold text-slate-800">5. 廠務管銷管理</td>
                  <td className="py-1.5 px-3 text-right">NT$ {cost.managementExpensePerPart.toFixed(2)}</td>
                  <td className="py-1.5 px-3 text-right text-slate-500">{Math.round((cost.managementExpensePerPart / cost.totalUnitCost) * 100)}%</td>
                  <td className="py-1.5 px-3 text-right">NT$ {(cost.managementExpensePerPart * quote.commercial.orderQuantity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // Slide 6: 階梯大量報價矩陣
    {
      title: '多批量階梯方案',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 06</span>
            <h2 className="text-2xl font-black text-slate-900">多批量階梯報價方案 (Tiered Volume Matrix)</h2>
          </div>

          <p className="text-xs text-slate-500">
            批量擴大時，固定換模調機成本大幅分攤稀釋，帶來顯著的規模經濟折讓空間：
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs flex-1">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">訂購批量 (件)</th>
                  <th className="py-2.5 px-3 text-right">換模分攤</th>
                  <th className="py-2.5 px-3 text-right">單件成本</th>
                  <th className="py-2.5 px-3 text-right text-blue-700">建議單價 (NT$)</th>
                  <th className="py-2.5 px-3 text-right">毛利率</th>
                  <th className="py-2.5 px-3 text-right">整批總額 (NT$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {tiers.map(t => {
                  const isCur = t.quantity === quote.commercial.orderQuantity;
                  return (
                    <tr key={t.quantity} className={isCur ? 'bg-blue-50 font-bold' : ''}>
                      <td className="py-2.5 px-3 font-sans">
                        {t.quantity.toLocaleString()} 件
                        {isCur && <span className="ml-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">本次</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">NT$ {t.setupCost.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">NT$ {t.totalCost.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-700 text-sm">NT$ {t.suggestedPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600">{t.grossMarginPct}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">NT$ {t.totalRevenue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },

    // Slide 7: 模具與商業條款
    {
      title: '模具與條款',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 bg-white text-slate-900 rounded-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">SLIDE 07</span>
            <h2 className="text-2xl font-black text-slate-900">專案模具開發與商業條款 (Terms)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 text-xs">
            <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">射出模具開發方案</h3>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li>• <strong>模具穴數：</strong>{quote.molding.cavities} 穴精密射出鋼模</li>
                <li>• <strong>預估模具總價：</strong>NT$ {quote.molding.moldEstimatedCost.toLocaleString()} (未稅)</li>
                <li>• <strong>保證開模壽命：</strong>{quote.molding.moldLifeShots.toLocaleString()} 模次</li>
                <li>• <strong>產權歸屬：</strong>{quote.molding.moldOwnership === 'customer' ? '買方客戶所有 (由久揚代管維護保養)' : '久揚塑膠自備'}</li>
                <li>• <strong>開模開發週期：</strong>約 30 ~ 35 工作天 (含第一次試模 T1 樣品交付)</li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm">正式商業交易條款</h3>
              <ul className="space-y-2 text-slate-700 leading-relaxed">
                <li>• <strong>付款條件：</strong>{quote.commercial.paymentTerms || '月結 30 天'}</li>
                <li>• <strong>貿易交貨：</strong>{quote.commercial.tradeTerms || '送貨到廠 (DDP)'}</li>
                <li>• <strong>最低起訂量：</strong>{(quote.commercial.moq || 1000).toLocaleString()} 件 / 批</li>
                <li>• <strong>量產交期：</strong>訂單簽認後 {quote.commercial.leadTimeDays || 14} 工作天出貨</li>
                <li>• <strong>報價有效期限：</strong>報價日起 {quote.commercial.validityDays || 30} 天內有效</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 8: 封底致謝
    {
      title: '封底結語',
      render: () => (
        <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-slate-950 text-white rounded-2xl relative overflow-hidden">
          <div className="space-y-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
              JIOU YANG PLASTIC CO., LTD.
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              感謝您的信任與合作 期待攜手量產
            </h2>
            <p className="text-slate-400 text-base">
              久揚塑膠以嚴謹工程計算與穩定成型品質，為您提供最具競爭力的產品成本結構。
            </p>
          </div>

          <div className="border-t border-slate-800 pt-6 text-xs text-slate-400 space-y-1">
            <p className="font-bold text-slate-200 text-sm">久揚塑膠股份有限公司</p>
            <p>地址：桃園市龜山區工四路 28 號 ｜ 電話：(03) 328-8899 ｜ 傳真：(03) 328-8880</p>
            <p>承辦專案經理：{quote.createdBy} ｜ 審核簽章：{quote.approval?.reviewedBy || '林建興 廠長'}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 頂部導航與操作列 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            type="button"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="返回清單"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Presentation className="w-5 h-5 text-indigo-600" />
              專案簡報與 PPT / PTT 檔案匯出中心
            </h2>
            <p className="text-xs text-slate-500">
              案件: <strong className="font-mono text-slate-800">{quote.quoteNumber}</strong> ({quote.product.partName})
            </p>
          </div>
        </div>

        {/* 格式切換與匯出動作按鈕 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 格式分頁切換 */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveFormat('ppt-slides')}
              type="button"
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFormat === 'ppt-slides'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              PowerPoint 簡報 (.pptx)
            </button>
            <button
              onClick={() => setActiveFormat('ptt-bbs')}
              type="button"
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeFormat === 'ptt-bbs'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              PTT BBS 純文字格式
            </button>
          </div>

          {activeFormat === 'ppt-slides' ? (
            <button
              onClick={handleDownloadPptx}
              disabled={isExporting}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md hover:shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '正在生成 PPT 檔案...' : '下載 PowerPoint (.pptx) 檔案'}
            </button>
          ) : (
            <button
              onClick={handleCopyPtt}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {copiedPtt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedPtt ? '已複製 PTT 格式！' : '複製 PTT BBS 格式全文'}
            </button>
          )}
        </div>
      </div>

      {/* 檔案位置說明與直接下載 Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-indigo-700/50 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              ✓ 檔案已就緒
            </span>
            <span className="text-xs text-indigo-200">
              檔案格式：Microsoft PowerPoint Presentation (.pptx)
            </span>
          </div>
          <p className="text-sm font-bold text-white">
            點擊右側按鈕，瀏覽器將立即將 <span className="text-amber-300 font-mono">「{quote.quoteNumber}_{quote.product.partName}_成本報價簡報.pptx」</span> 下載至您電腦的「下載項目 (Downloads)」資料夾。
          </p>
          <p className="text-xs text-slate-300">
            包含 9 頁高解析 16:9 投影片：封面、產品與 CAD 圖面規格、原料成本配方、成型機台產能、換模調機攤提、單件報價與多批量階梯矩陣。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadPptx}
            disabled={isExporting}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/40 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '正在打包 PPTX 檔案...' : '立即下載此案件 PPT 檔案'}
          </button>

          <a
            href="./久揚塑膠_射出零件成本報價簡報_JY-2026-Q084.pptx"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="下載標準預產範例 PPT 檔案"
          >
            下載示範 PPTX
          </a>
        </div>
      </div>

      {/* 模式 1: 互動式 16:9 PowerPoint 簡報投影片預覽 */}
      {activeFormat === 'ppt-slides' && (
        <div className="space-y-4">
          {/* 主展示畫布 (16:9 Aspect Ratio) */}
          <div className="bg-slate-900/10 p-2 sm:p-4 rounded-3xl border border-slate-300 shadow-inner">
            <div className="aspect-[16/9] w-full max-w-5xl mx-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-300">
              {slides[currentSlide].render()}
            </div>
          </div>

          {/* 投影片導航控制器 */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                type="button"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer text-slate-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700">
                投影片 {currentSlide + 1} / {slides.length}
              </span>
              <button
                disabled={currentSlide === slides.length - 1}
                onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
                type="button"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer text-slate-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 投影片縮圖快捷條 */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                    currentSlide === idx
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}. {s.title}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownloadPptx}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              匯出 .pptx 簡報
            </button>
          </div>
        </div>
      )}

      {/* 模式 2: PTT BBS 純文字 / ANSI 格式展示 */}
      {activeFormat === 'ptt-bbs' && (
        <div className="space-y-4">
          <div className="bg-black text-emerald-400 font-mono text-xs sm:text-sm p-6 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-x-auto whitespace-pre leading-relaxed">
            {generatePttBbsText()}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCopyPtt}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {copiedPtt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedPtt ? '已複製 PTT 格式至剪貼簿！' : '一鍵複製 PTT BBS 格式'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

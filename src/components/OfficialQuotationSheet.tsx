/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 正式報價單輸出與列印 (F09)
 */

import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Download, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Presentation
} from 'lucide-react';
import { Quotation } from '../types';
import { calculateQuotationCost, calculateTieredPricing } from '../utils/costCalculator';

interface OfficialQuotationSheetProps {
  quote: Quotation;
  onBack: () => void;
  onEdit: (id: string) => void;
  onViewPresentation?: (id: string) => void;
}

export const OfficialQuotationSheet: React.FC<OfficialQuotationSheetProps> = ({
  quote,
  onBack,
  onEdit,
  onViewPresentation,
}) => {
  const costSummary = calculateQuotationCost(quote);
  const tieredResults = calculateTieredPricing(quote);

  const handlePrint = () => {
    window.print();
  };

  // 報價截止日 (createdAt + validityDays)
  const createDate = new Date(quote.createdAt || new Date());
  const validUntilDate = new Date(createDate.getTime() + (quote.commercial.validityDays || 30) * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* 頂部工具列 (列印時隱藏) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
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
              <FileText className="w-5 h-5 text-emerald-600" />
              正式商業報價單預覽 (F09)
            </h2>
            <p className="text-xs text-slate-500">
              文件編號: <strong className="font-mono text-slate-700">{quote.quoteNumber}</strong> ({quote.version})・可直接列印或另存為 PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(quote.id)}
            type="button"
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-300"
          >
            返回核算編輯
          </button>

          {onViewPresentation && (
            <button
              onClick={() => onViewPresentation(quote.id)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-300 transition-colors cursor-pointer"
              title="轉為 PowerPoint 簡報與下載 .pptx"
            >
              <Presentation className="w-4 h-4 text-indigo-600" />
              轉 PPT 簡報
            </button>
          )}

          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            列印 / 輸出 PDF 報價單
          </button>
        </div>
      </div>

      {/* 正式報價單主體 (A4標準排版，支援精確列印) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-8 sm:p-12 shadow-md max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none print:max-w-none text-slate-900">
        {/* 公司信頭 (Corporate Header) */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-2xl tracking-tighter shrink-0">
                久揚
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider text-slate-900">
                  久揚塑膠股份有限公司
                </h1>
                <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                  JIOU YANG PLASTIC CO., LTD.
                </p>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <p>地址: 桃園市龜山區工四路 28 號 (華亞科技園區近鄰)</p>
                  <p>TEL: (03) 328-8899 ｜ FAX: (03) 328-8880 ｜ 統編: 12345678</p>
                  <p>ISO 9001:2015 / IATF 16949 國際品質管理認證合格廠</p>
                </div>
              </div>
            </div>

            {/* 報價單專用章與編號 */}
            <div className="text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm tracking-widest rounded">
                正式工程報價單
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 pt-1">
                NO: {quote.quoteNumber} ({quote.version})
              </p>
              <p className="text-[11px] text-slate-600">
                報價日期: {createDate.toISOString().slice(0, 10)}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold">
                有效期限: {validUntilDate.toISOString().slice(0, 10)} (30天)
              </p>
            </div>
          </div>
        </div>

        {/* 客戶買方與聯絡資訊 */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-xs">
          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              買方客戶資料 (BUYER)
            </span>
            <p className="text-sm font-bold text-slate-900">{quote.client.name}</p>
            <p className="text-slate-600">
              聯絡人: <strong className="text-slate-800">{quote.client.contactPerson || '採購代表'}</strong>
            </p>
            <p className="text-slate-600">電話: {quote.client.phone || '-'}</p>
            <p className="text-slate-600">信箱: {quote.client.email || '-'}</p>
            {quote.client.taxId && <p className="text-slate-600">統一編號: {quote.client.taxId}</p>}
          </div>

          <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              承辦業務代表 (ISSUED BY)
            </span>
            <p className="text-sm font-bold text-slate-900">久揚塑膠 業務專案部</p>
            <p className="text-slate-600">
              專案負責人: <strong className="text-slate-800">{quote.createdBy}</strong>
            </p>
            <p className="text-slate-600">
              貿易交貨條件: <strong className="text-slate-800">{quote.commercial.tradeTerms || '送貨到廠 (DDP)'}</strong>
            </p>
            <p className="text-slate-600">
              付款條件: <strong className="text-slate-800">{quote.commercial.paymentTerms || '月結 30 天'}</strong>
            </p>
            <p className="text-slate-600">
              量產標準交期: 訂單確認後 <strong className="text-slate-800">{quote.commercial.leadTimeDays || 14} 工作天</strong>
            </p>
          </div>
        </div>

        {/* 產品射出成型零件報價明細表 */}
        <div className="py-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-3.5 bg-blue-700 inline-block rounded-xs" />
            一、 塑膠射出成型零件報價明細
          </h3>

          <div className="overflow-x-auto border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">項次</th>
                  <th className="py-2.5 px-3">品名與規格規格說明</th>
                  <th className="py-2.5 px-3">客戶料號</th>
                  <th className="py-2.5 px-3">塑膠原料 / 模穴</th>
                  <th className="py-2.5 px-3 text-right">訂購批量</th>
                  <th className="py-2.5 px-3 text-right text-blue-900 font-bold">單件報價 (未稅)</th>
                  <th className="py-2.5 px-3 text-right">整批總價 (NT$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3 font-mono font-bold">01</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 text-sm">{quote.product.partName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      外觀尺寸: {quote.product.dimensionsMm} ｜ 公差: {quote.product.toleranceGrade}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      表面處理: {quote.product.surfaceFinish}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">{quote.product.partNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold block">{quote.material.materialName}</span>
                    <span className="text-[11px] text-slate-500">{quote.material.materialGrade} / {quote.molding.cavities}穴</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-blue-700">
                    {quote.commercial.orderQuantity.toLocaleString()} 件
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-blue-900 text-sm">
                    NT$ {costSummary.suggestedUnitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    NT$ {costSummary.batchTotalRevenue.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 階梯報價對照表 (量大折讓方案) */}
        <div className="py-3 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>階梯大量訂購折讓價格表 (Tiered Pricing Matrix)</span>
            <span className="text-[11px] text-slate-500 font-normal">單位: 新台幣 (NTD / 件・未稅)</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            {tieredResults.slice(0, 5).map(t => (
              <div 
                key={t.quantity} 
                className={`p-2.5 rounded-xl border ${
                  t.quantity === quote.commercial.orderQuantity 
                    ? 'bg-blue-50 border-blue-400 font-bold ring-1 ring-blue-300' 
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[11px] text-slate-500">{t.quantity.toLocaleString()} 件</div>
                <div className="text-sm font-mono font-black text-blue-800 mt-0.5">
                  NT$ {t.suggestedPrice.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  總額 NT$ {(t.totalRevenue / 1000).toFixed(0)}k
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 模具開發費用 (若有) */}
        {quote.molding.moldEstimatedCost > 0 && (
          <div className="py-3 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-3.5 bg-blue-700 inline-block rounded-xs" />
              二、 專案射出模具開發費用 (Tooling Cost)
            </h3>
            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50/50 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-800">
                  {quote.molding.cavities} 穴精密射出鋼模 (保證壽命 {quote.molding.moldLifeShots.toLocaleString()} 模次)
                </p>
                <p className="text-slate-500 text-[11px]">
                  產權歸屬: {quote.molding.moldOwnership === 'customer' ? '客戶所有 (由久揚代管維護保養)' : '久揚塑膠資產'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">模具報價總計</span>
                <p className="text-base font-mono font-black text-slate-900">
                  NT$ {quote.molding.moldEstimatedCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 商業條款與交易備註 */}
        <div className="py-4 border-t border-slate-200 text-xs space-y-1.5 text-slate-600">
          <h4 className="font-bold text-slate-900">三、 報價備註條款 (Terms & Conditions)</h4>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px] leading-relaxed">
            <li>以上報價均為<strong>未稅價格</strong>，國內交易營業稅 5% 外加。</li>
            <li>最低起訂量 (MOQ) 為 <strong>{(quote.commercial.moq || 1000).toLocaleString()} 件</strong>，若單次下單低於 MOQ，需另計換模調機固定費。</li>
            <li>報價依目前原物料牌價計算，若主要工程塑料價格市場波動超過 ±8%，雙方同意依比例協商調整。</li>
            <li>零件生產依客戶確認之 3D CAD 模型及簽可之 2D 關鍵圖面為驗收標準。</li>
            <li>本報價單有效期限至 <strong>{validUntilDate.toISOString().slice(0, 10)}</strong> 止，逾期請重新核價。</li>
          </ol>
        </div>

        {/* 雙方授權簽章與印鑑欄 */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
          {/* 久揚方 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">報價核准單位：久揚塑膠股份有限公司</span>
              <span className="text-slate-400 text-[10px]">公司統一發票專用章 / 簽核</span>
            </div>
            <div className="h-16 border-b border-dashed border-slate-400 flex items-end justify-between px-2 pb-1">
              <div>
                <span className="text-[10px] text-slate-400 block">承辦業務：</span>
                <span className="font-semibold text-slate-800">{quote.createdBy}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">廠長/技術主管核准：</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {quote.approval?.reviewedBy || '林建興 廠長'}
                </span>
              </div>
            </div>
          </div>

          {/* 客戶方 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">客戶回簽確認 (簽章後生效傳真或回傳)：</span>
              <span className="text-slate-400 text-[10px]">客戶公司大小章 / 採購主管簽章</span>
            </div>
            <div className="h-16 border-b border-dashed border-slate-400 flex items-end justify-between px-2 pb-1 text-slate-400 text-[11px]">
              <span>簽署人：_________________</span>
              <span>日期：____ 年 ___ 月 ___ 日</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

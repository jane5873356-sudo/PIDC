/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 詢價案件管理清單 (F01 & F12)
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Edit3, 
  Copy, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Send, 
  Award, 
  XCircle, 
  Download, 
  Upload, 
  Eye, 
  History,
  Layers,
  ArrowUpDown,
  Building,
  Package,
  Presentation,
  FileDown
} from 'lucide-react';
import { Quotation, QuotationStatus } from '../types';
import { calculateQuotationCost, checkQuotationCompletenessAndAudit } from '../utils/costCalculator';
import { exportQuotationToPptx } from '../utils/pptxExport';

interface QuotationListProps {
  quotations: Quotation[];
  onSelectQuotation: (id: string) => void;
  onEditQuotation: (id: string) => void;
  onViewOfficialPdf: (id: string) => void;
  onViewPresentation: (id: string) => void;
  onCloneQuotation: (id: string) => void;
  onDeleteQuotation: (id: string) => void;
  onNewQuotation: () => void;
  onViewVersionHistory: (quote: Quotation) => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export const QuotationList: React.FC<QuotationListProps> = ({
  quotations,
  onSelectQuotation,
  onEditQuotation,
  onViewOfficialPdf,
  onViewPresentation,
  onCloneQuotation,
  onDeleteQuotation,
  onNewQuotation,
  onViewVersionHistory,
  onExportJson,
  onImportJson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [downloadingPptId, setDownloadingPptId] = useState<string | null>(null);

  const handleDirectDownloadPptx = async (e: React.MouseEvent, quote: Quotation) => {
    e.stopPropagation();
    try {
      setDownloadingPptId(quote.id);
      await exportQuotationToPptx(quote);
    } catch (err) {
      console.error(err);
      alert('產生 PowerPoint 簡報檔案失敗，請稍候重試');
    } finally {
      setDownloadingPptId(null);
    }
  };

  // 篩選與排序
  const filteredQuotations = useMemo(() => {
    return quotations
      .filter(q => {
        // 狀態篩選
        if (statusFilter !== 'all' && q.status !== statusFilter) {
          return false;
        }
        // 關鍵字搜尋
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          q.quoteNumber.toLowerCase().includes(term) ||
          q.client.name.toLowerCase().includes(term) ||
          q.product.partName.toLowerCase().includes(term) ||
          q.product.partNumber.toLowerCase().includes(term) ||
          q.material.materialName.toLowerCase().includes(term) ||
          (q.product.internalPartNumber && q.product.internalPartNumber.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'date') {
          diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } else if (sortBy === 'price') {
          const priceA = calculateQuotationCost(a).suggestedUnitPrice;
          const priceB = calculateQuotationCost(b).suggestedUnitPrice;
          diff = priceB - priceA;
        } else if (sortBy === 'quantity') {
          diff = (b.commercial.orderQuantity || 0) - (a.commercial.orderQuantity || 0);
        }
        return sortOrder === 'desc' ? diff : -diff;
      });
  }, [quotations, searchTerm, statusFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            草稿建檔
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            待主管核價
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            主管已核准
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-300">
            <Send className="w-3 h-3 text-blue-600" />
            已發送客戶
          </span>
        );
      case 'won':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-300">
            <Award className="w-3 h-3 text-purple-600" />
            已下單成交
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-500" />
            未成交/結案
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 頂部操作與統計 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            客戶詢價與報價案件庫 (RFQ Management)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            共有 <strong className="text-blue-600">{quotations.length}</strong> 筆報價案件，包含圖面、成型參數、換模分攤與正式核准紀錄
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-300">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            匯入備份
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onImportJson(file);
              }}
            />
          </label>
          <button
            onClick={onExportJson}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors border border-slate-300"
            title="將所有案件資料匯出為 JSON 備份檔"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            匯出備份
          </button>
          <button
            onClick={onNewQuotation}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-all shadow-sm"
          >
            + 建立新詢價案件
          </button>
        </div>
      </div>

      {/* 搜尋、篩選與排序工具列 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* 搜尋欄 */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜尋客戶名稱、品名、料號 (HT-RAD...) 或材質..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* 狀態標籤快捷切換 */}
          <div className="md:col-span-5 flex items-center gap-1 overflow-x-auto text-xs">
            {[
              { id: 'all', label: '全部' },
              { id: 'draft', label: '草稿' },
              { id: 'pending_approval', label: '待核價' },
              { id: 'approved', label: '已核准' },
              { id: 'sent', label: '已發送' },
              { id: 'won', label: '已成交' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                type="button"
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 排序方式 */}
          <div className="md:col-span-2 flex items-center justify-end gap-1.5 text-xs text-slate-500">
            <span>排序:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium"
            >
              <option value="date">更新日期</option>
              <option value="price">建議售價</option>
              <option value="quantity">報價批量</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer"
              title="切換遞增/遞減"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 案件卡片列表 */}
      {filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">查無符合條件的詢價案件</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            您可以嘗試變更搜尋關鍵字、切換狀態分頁，或是建立一筆新的塑膠射出零件詢價單。
          </p>
          <button
            onClick={onNewQuotation}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
          >
            + 立即建立詢價案件
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotations.map(quote => {
            const costSummary = calculateQuotationCost(quote);
            const auditCheck = checkQuotationCompletenessAndAudit(quote);
            const hasDrawings = quote.product.drawings && quote.product.drawings.length > 0;

            return (
              <div
                key={quote.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* 左側：案件號、客戶、品名料號規格 */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {quote.quoteNumber}
                      </span>
                      <button
                        onClick={() => onViewVersionHistory(quote)}
                        className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                        title="查看版本歷程與變更原因 (F12)"
                      >
                        <History className="w-3 h-3" />
                        {quote.version}
                        {quote.versionHistory && quote.versionHistory.length > 1 && (
                          <span className="text-[10px] text-blue-500">
                            ({quote.versionHistory.length}版)
                          </span>
                        )}
                      </button>

                      {getStatusBadge(quote.status)}

                      {/* 資料完整性提示 (規格書 F02 要求) */}
                      {!auditCheck.isComplete && (
                        <span 
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300"
                          title={`缺少欄位: ${auditCheck.missingFields.join('、')}`}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          待補件 ({auditCheck.missingFields.length})
                        </span>
                      )}

                      {/* 審核警示標籤 (F08 要求) */}
                      {auditCheck.requiresApproval && quote.status === 'pending_approval' && (
                        <span 
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300"
                          title={auditCheck.flagReasons.join('\n')}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          主管警示
                        </span>
                      )}

                      <span className="text-xs text-slate-400 ml-auto lg:ml-0">
                        更新於 {quote.updatedAt.slice(0, 10)}
                      </span>
                    </div>

                    {/* 品名與料號 */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {quote.product.partName}
                      </h3>
                      <span className="text-xs font-mono font-medium text-slate-500">
                        料號: {quote.product.partNumber}
                      </span>
                    </div>

                    {/* 屬性標籤列 */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{quote.client.name}</span>
                        {quote.client.contactPerson && (
                          <span className="text-slate-400">({quote.client.contactPerson})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                          {quote.material.materialName} ({quote.material.materialGrade})
                        </span>
                      </div>

                      <div>
                        單重: <strong className="font-mono text-slate-800">{quote.material.partWeightG}g</strong>
                        <span className="text-slate-400 ml-1">(料頭 {quote.material.runnerWeightG}g)</span>
                      </div>

                      <div>
                        模穴: <strong className="font-mono text-slate-800">{quote.molding.cavities}穴</strong>
                        <span className="text-slate-400 ml-1">({quote.molding.machineTonnage}T 機台)</span>
                      </div>

                      <div>
                        批量: <strong className="font-mono text-blue-700">{(quote.commercial.orderQuantity || 0).toLocaleString()} 件</strong>
                      </div>

                      {hasDrawings && (
                        <div className="inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          圖面已備 ({quote.product.drawings.length}份)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 中間/右側：成本與報價核心財務指標 */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right space-y-0.5">
                      <span className="text-[11px] text-slate-400 block font-medium">單件成本</span>
                      <div className="text-sm font-bold font-mono text-slate-700">
                        NT$ {costSummary.totalUnitCost.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        材料 ${costSummary.materialCostPerPart} / 成型 ${costSummary.moldingCostPerPart}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5 bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 min-w-[120px]">
                      <span className="text-[11px] text-blue-600 block font-semibold">建議單件售價</span>
                      <div className="text-lg font-black font-mono text-blue-700">
                        NT$ {costSummary.suggestedUnitPrice.toFixed(2)}
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px]">
                        <span className="text-slate-500">毛利</span>
                        <span className="font-bold font-mono text-emerald-600">
                          {quote.commercial.targetGrossMarginPct}%
                        </span>
                      </div>
                    </div>

                    {/* 操作按鈕群 */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditQuotation(quote.id)}
                        type="button"
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-200/60"
                        title="進入成本核算與參數編輯 (F02~F08)"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onViewOfficialPdf(quote.id)}
                        type="button"
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer border border-emerald-200/60"
                        title="檢視正式報價單並輸出 PDF (F09)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onViewPresentation(quote.id)}
                        type="button"
                        className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-indigo-200/60"
                        title="線上預覽 PPT 簡報投影片 (16:9)"
                      >
                        <Presentation className="w-4 h-4" />
                      </button>

                      <button
                        onClick={e => handleDirectDownloadPptx(e, quote)}
                        disabled={downloadingPptId === quote.id}
                        type="button"
                        className="p-2 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer border border-amber-300 disabled:opacity-50"
                        title="一鍵直接下載 PowerPoint (.pptx) 簡報檔案"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onCloneQuotation(quote.id)}
                        type="button"
                        className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                        title="複製此案件開新版本或新報價"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteQuotation(quote.id)}
                        type="button"
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
                        title="刪除此詢價案件"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

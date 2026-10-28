/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 頂部導航與狀態儀表列
 */

import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  Calculator, 
  FileText, 
  Search, 
  TrendingUp, 
  Database, 
  Sliders, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Presentation
} from 'lucide-react';
import { Quotation } from '../types';

export type ActiveTab = 
  | 'list'          // 詢價案件列表
  | 'simulator'     // 互動試算模擬器
  | 'editor'        // 專案核算編輯器
  | 'official-pdf'  // 正式報價單輸出
  | 'presentation'  // 簡報展示與 PPT/PTT 匯出
  | 'history'       // 歷史報價與相似件
  | 'variance'      // 實際成本差異分析
  | 'master-data';  // 標準基礎資料庫

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  quotations: Quotation[];
  onNewQuotation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  quotations,
  onNewQuotation,
}) => {
  // 統計案件數字
  const pendingCount = quotations.filter(q => q.status === 'pending_approval').length;
  const approvedCount = quotations.filter(q => q.status === 'approved' || q.status === 'won').length;
  const draftCount = quotations.filter(q => q.status === 'draft').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* 頂層品牌與全局動作 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 品牌標識 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                  久揚塑膠
                  <span className="text-xs font-normal text-slate-400 border-l border-slate-700 pl-2 hidden sm:inline">
                    JIOU YANG PLASTICS
                  </span>
                </h1>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                  射出零件智慧報價系統
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                標準化材料・成型週期・機台時費・換模分攤・毛利審核全流程
              </p>
            </div>
          </div>

          {/* 狀態快捷指標 & 主按鈕 */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-1 text-amber-400" title="待主管核價案件">
                <Clock className="w-3.5 h-3.5" />
                <span>待審核: <strong>{pendingCount}</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-emerald-400" title="已核准/成交案件">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>已核准: <strong>{approvedCount}</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-slate-400" title="建檔草稿">
                <span>草稿: <strong>{draftCount}</strong></span>
              </div>
            </div>

            <button
              onClick={onNewQuotation}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md hover:shadow-blue-600/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>新建詢價專案</span>
            </button>
          </div>
        </div>

        {/* 下層功能模組分頁選單 */}
        <div className="flex overflow-x-auto space-x-1 py-1.5 scrollbar-none border-t border-slate-800/80 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onTabChange('list')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            詢價案件管理 (F01)
            {quotations.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white text-[10px] rounded-full">
                {quotations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('simulator')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            互動試算範例 (What-If)
          </button>

          <button
            onClick={() => onTabChange('editor')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            專案成本核算 (F02~F08)
          </button>

          <button
            onClick={() => onTabChange('official-pdf')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'official-pdf'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            正式報價單 (F09)
          </button>

          <button
            onClick={() => onTabChange('presentation')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'presentation'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Presentation className="w-4 h-4 text-cyan-400" />
            轉 PPT / 簡報投影片
          </button>

          <button
            onClick={() => onTabChange('history')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-400" />
            歷史與相似件 (F10)
          </button>

          <button
            onClick={() => onTabChange('variance')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'variance'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-rose-400" />
            實際成本差異分析 (F11)
          </button>

          <button
            onClick={() => onTabChange('master-data')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'master-data'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            材料機台標準庫 (F03/F04)
          </button>
        </div>
      </div>
    </header>
  );
};

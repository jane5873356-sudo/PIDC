/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 報價版本歷史與稽核軌跡 (F12)
 */

import React from 'react';
import { 
  History, 
  X, 
  Clock, 
  User, 
  ArrowRight, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Quotation } from '../types';

interface VersionHistoryModalProps {
  quote: Quotation;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  quote,
  onClose,
}) => {
  const history = quote.versionHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                報價版本歷程與稽核軌跡 (F12)
              </h3>
              <p className="text-xs text-slate-500">
                案件: <strong className="font-mono text-slate-700">{quote.quoteNumber}</strong> ｜ 目前版本: <span className="font-mono text-blue-600 font-bold">{quote.version}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 版本時間軸 Timeline */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              尚無前序版本紀錄，目前為初版 ({quote.version})
            </div>
          ) : (
            history.map((record, index) => {
              const isCurrent = record.version === quote.version;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm bg-white px-2.5 py-0.5 rounded border border-slate-300 text-slate-800">
                        {record.version}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
                          當前生效版
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {record.timestamp.replace('T', ' ').slice(0, 16)}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      {record.author}
                    </div>
                  </div>

                  {/* 變更原因 */}
                  <div className="mt-2.5 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-0.5">變更修訂原因：</span>
                    {record.reason}
                  </div>

                  {/* 當時財務核算指標 */}
                  <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
                    <div className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">批量 (件)</span>
                      <span className="font-mono font-bold text-slate-800">
                        {record.orderQuantity.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">單件成本</span>
                      <span className="font-mono font-bold text-slate-800">
                        NT$ {record.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-blue-500 block">建議報價</span>
                      <span className="font-mono font-bold text-blue-700">
                        NT$ {record.suggestedPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-slate-200">
                      <span className="text-[10px] text-emerald-500 block">毛利率</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {record.grossMarginPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部關閉按鈕 */}
        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
          >
            關閉歷史面板
          </button>
        </div>
      </div>
    </div>
  );
};

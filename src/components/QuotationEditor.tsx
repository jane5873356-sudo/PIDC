/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 專案成本核算工作台 (F01~F08)
 */

import React, { useState } from 'react';
import { 
  Save, 
  ArrowLeft, 
  FileText, 
  Layers, 
  Cpu, 
  Wrench, 
  CheckSquare, 
  Percent, 
  ShieldAlert, 
  Upload, 
  Trash2, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  History,
  FileCheck,
  Building,
  Info,
  Calendar,
  Sparkles,
  Presentation
} from 'lucide-react';
import { Quotation, MaterialItem, MachineItem, DrawingAttachment } from '../types';
import { STANDARD_MATERIALS, STANDARD_MACHINES } from '../data/standardData';
import { calculateQuotationCost, calculateTieredPricing, checkQuotationCompletenessAndAudit } from '../utils/costCalculator';

interface QuotationEditorProps {
  quote: Quotation;
  onSave: (updatedQuote: Quotation, isNewVersion?: boolean, versionReason?: string) => void;
  onCancel: () => void;
  onViewOfficialPdf: (id: string) => void;
  onViewPresentation?: (id: string) => void;
}

export const QuotationEditor: React.FC<QuotationEditorProps> = ({
  quote,
  onSave,
  onCancel,
  onViewOfficialPdf,
  onViewPresentation,
}) => {
  const [formData, setFormData] = useState<Quotation>(JSON.parse(JSON.stringify(quote)));
  const [activeSubTab, setActiveSubTab] = useState<'basics' | 'drawings' | 'material' | 'molding' | 'setup' | 'postprocess' | 'pricing' | 'approval'>('basics');
  const [saveAsNewVersionModal, setSaveAsNewVersionModal] = useState(false);
  const [versionReason, setVersionReason] = useState('');
  const [drawingInputName, setDrawingInputName] = useState('');

  // 即時計算
  const costSummary = calculateQuotationCost(formData);
  const tieredResults = calculateTieredPricing(formData);
  const auditCheck = checkQuotationCompletenessAndAudit(formData);

  // 通用更新器
  const updateNestedField = (path: string[], value: any) => {
    setFormData(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      copy.updatedAt = new Date().toISOString();
      return copy;
    });
  };

  // 快捷套用標準材料庫
  const handleSelectStandardMaterial = (matId: string) => {
    const found = STANDARD_MATERIALS.find(m => m.id === matId);
    if (!found) return;
    setFormData(prev => ({
      ...prev,
      material: {
        ...prev.material,
        materialId: found.id,
        materialName: found.name,
        materialGrade: found.grade,
        materialPricePerKg: found.pricePerKg,
      },
    }));
  };

  // 快捷套用標準機台庫
  const handleSelectStandardMachine = (macId: string) => {
    const found = STANDARD_MACHINES.find(m => m.id === macId);
    if (!found) return;
    setFormData(prev => ({
      ...prev,
      molding: {
        ...prev.molding,
        machineId: found.id,
        machineTonnage: found.clampingForceTons,
        machineRatePerHour: found.hourlyRate,
      },
    }));
  };

  // 上傳模擬圖面
  const handleAddDrawing = () => {
    if (!drawingInputName.trim()) return;
    const newDrawing: DrawingAttachment = {
      id: `dwg-${Date.now()}`,
      fileName: drawingInputName.trim(),
      fileType: drawingInputName.toLowerCase().endsWith('.step') || drawingInputName.toLowerCase().endsWith('.igs') ? '3D-STEP' : '2D-PDF',
      fileSize: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().slice(0, 10),
      note: '工程部已建檔歸檔',
    };
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        drawings: [...(prev.product.drawings || []), newDrawing],
      },
    }));
    setDrawingInputName('');
  };

  const handleRemoveDrawing = (id: string) => {
    setFormData(prev => ({
      ...prev,
      product: {
        ...prev.product,
        drawings: prev.product.drawings.filter(d => d.id !== id),
      },
    }));
  };

  // 儲存邏輯
  const handleDirectSave = () => {
    onSave(formData, false);
  };

  const handleConfirmNewVersion = () => {
    if (!versionReason.trim()) return;
    onSave(formData, true, versionReason);
    setSaveAsNewVersionModal(false);
    setVersionReason('');
  };

  return (
    <div className="space-y-6">
      {/* 頂部操作與案件概況 Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="返回案件清單"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {formData.quoteNumber}
                </span>
                <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {formData.version}
                </span>
                <span className="text-xs text-slate-400">
                  客戶: <strong className="text-slate-700">{formData.client.name || '未填寫'}</strong>
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {formData.product.partName || '新塑膠射出零件案件'}
                <span className="text-xs font-mono font-normal text-slate-400 ml-2">
                  (料號: {formData.product.partNumber || '未設定'})
                </span>
              </h2>
            </div>
          </div>

          {/* 右上角動作按鈕 */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onViewOfficialPdf(formData.id)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition-colors cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              正式報價單預覽 (F09)
            </button>

            {onViewPresentation && (
              <button
                onClick={() => onViewPresentation(formData.id)}
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-300 transition-colors cursor-pointer"
                title="轉為 PowerPoint (.pptx) 投影片簡報"
              >
                <Presentation className="w-4 h-4 text-indigo-600" />
                轉 PPT 簡報
              </button>
            )}

            <button
              onClick={() => setSaveAsNewVersionModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="保留原版，另存為新版號 (V1.1, V2.0)"
            >
              <History className="w-4 h-4 text-slate-600" />
              升版儲存 (F12)
            </button>

            <button
              onClick={handleDirectSave}
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md hover:shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              直接儲存變更
            </button>
          </div>
        </div>

        {/* 必填補件與審核提示 Banner (規格書 F02 & F08 要求) */}
        {(!auditCheck.isComplete || auditCheck.requiresApproval) && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            {!auditCheck.isComplete && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>系統提示補件 (F02)：</strong> 尚缺
                    <span className="font-semibold underline ml-1">{auditCheck.missingFields.join('、')}</span>
                    ，完整填寫後方能確保成本計算無虞。
                  </span>
                </div>
              </div>
            )}
            {auditCheck.requiresApproval && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>核價審核機制觸發 (F08)：</strong> {auditCheck.flagReasons.join('；')}
                  </span>
                </div>
                <span className="font-semibold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                  需主管核准
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 核心子分頁切換導航 */}
      <div className="flex overflow-x-auto gap-1 p-1.5 bg-slate-200/70 rounded-2xl text-xs sm:text-sm font-semibold">
        {[
          { id: 'basics', label: '1. 客戶詢價建檔 (F01)', icon: Building },
          { id: 'drawings', label: '2. 圖面與規格 (F02)', icon: FileText },
          { id: 'material', label: '3. 材料成本 (F03)', icon: Layers },
          { id: 'molding', label: '4. 成型機台加工 (F04)', icon: Cpu },
          { id: 'setup', label: '5. 換模調機分攤 (F05)', icon: Wrench },
          { id: 'postprocess', label: '6. 後加工與運費 (F06)', icon: CheckSquare },
          { id: 'pricing', label: '7. 毛利與階梯報價 (F07)', icon: Percent },
          { id: 'approval', label: '8. 主管核價與審核 (F08)', icon: ShieldAlert },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              type="button"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 分頁內容與右側即時成本看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側表單主體 (8欄) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* TAB 1: 客戶與詢價建檔 (F01) */}
          {activeSubTab === 'basics' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  客戶詢價基本資料建檔 (F01)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  輸入客戶公司、窗口聯絡資訊、本次預估採購數量與預計交期。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">客戶公司名稱 *</label>
                  <input
                    type="text"
                    value={formData.client.name}
                    onChange={e => updateNestedField(['client', 'name'], e.target.value)}
                    placeholder="例如: 宏達車載科技股份有限公司"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">統一編號 (Tax ID)</label>
                  <input
                    type="text"
                    value={formData.client.taxId || ''}
                    onChange={e => updateNestedField(['client', 'taxId'], e.target.value)}
                    placeholder="8碼統編，例如: 54882190"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">聯絡窗口 / 職稱</label>
                  <input
                    type="text"
                    value={formData.client.contactPerson}
                    onChange={e => updateNestedField(['client', 'contactPerson'], e.target.value)}
                    placeholder="例如: 陳俊銘 課長"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">聯絡電話 / 分機</label>
                  <input
                    type="text"
                    value={formData.client.phone}
                    onChange={e => updateNestedField(['client', 'phone'], e.target.value)}
                    placeholder="例如: 03-381-9988 分機 321"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">電子信箱 Email</label>
                  <input
                    type="email"
                    value={formData.client.email}
                    onChange={e => updateNestedField(['client', 'email'], e.target.value)}
                    placeholder="例如: jm.chen@htc-auto.com.tw"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">所屬產業別</label>
                  <input
                    type="text"
                    value={formData.client.industry}
                    onChange={e => updateNestedField(['client', 'industry'], e.target.value)}
                    placeholder="例如: 汽車電子、醫療儀器、工業機電、消費3C"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">本次詢價批量 (件) *</label>
                  <input
                    type="number"
                    value={formData.commercial.orderQuantity}
                    onChange={e => updateNestedField(['commercial', 'orderQuantity'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-blue-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">建議最低起訂量 MOQ (件)</label>
                  <input
                    type="number"
                    value={formData.commercial.moq}
                    onChange={e => updateNestedField(['commercial', 'moq'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">量產交期 (工作天)</label>
                  <input
                    type="number"
                    value={formData.commercial.leadTimeDays}
                    onChange={e => updateNestedField(['commercial', 'leadTimeDays'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 圖面與產品資料 (F02) */}
          {activeSubTab === 'drawings' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  產品規格與 2D/3D 圖面管理 (F02)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  記錄品名、客戶料號、外觀尺寸、公差等級與附掛圖面檔案。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">產品品名 *</label>
                  <input
                    type="text"
                    value={formData.product.partName}
                    onChange={e => updateNestedField(['product', 'partName'], e.target.value)}
                    placeholder="例如: 車用雷達防水感測器外蓋"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">客戶零件料號 *</label>
                  <input
                    type="text"
                    value={formData.product.partNumber}
                    onChange={e => updateNestedField(['product', 'partNumber'], e.target.value)}
                    placeholder="例如: HT-RAD-8821"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">久揚內部生產代號</label>
                  <input
                    type="text"
                    value={formData.product.internalPartNumber}
                    onChange={e => updateNestedField(['product', 'internalPartNumber'], e.target.value)}
                    placeholder="例如: JY-M-084-A"
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">產品外觀尺寸 (長x寬x高)</label>
                  <input
                    type="text"
                    value={formData.product.dimensionsMm}
                    onChange={e => updateNestedField(['product', 'dimensionsMm'], e.target.value)}
                    placeholder="例如: 115 x 72 x 34 mm"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">公差等級 (Tolerance)</label>
                  <input
                    type="text"
                    value={formData.product.toleranceGrade}
                    onChange={e => updateNestedField(['product', 'toleranceGrade'], e.target.value)}
                    placeholder="例如: DIN 16901-130 精密級 (±0.04mm)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">外觀咬花/表面處理</label>
                  <input
                    type="text"
                    value={formData.product.surfaceFinish}
                    onChange={e => updateNestedField(['product', 'surfaceFinish'], e.target.value)}
                    placeholder="例如: 細咬花 MT-11010 / 鏡面 SPI-A2"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* 圖面附檔區塊 */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-600" />
                    2D 工程圖與 3D CAD 模型清單
                  </h4>
                  <span className="text-[11px] text-slate-400">支援 STEP, IGS, DWG, PDF, 圖片格式</span>
                </div>

                {/* 新增圖面列 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={drawingInputName}
                    onChange={e => setDrawingInputName(e.target.value)}
                    placeholder="輸入或貼上圖檔名 (例如: HT-RAD-8821_RevC.step)"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddDrawing}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + 加入圖面紀錄
                  </button>
                </div>

                {/* 已附圖面列表 */}
                <div className="space-y-2">
                  {formData.product.drawings && formData.product.drawings.length > 0 ? (
                    formData.product.drawings.map(d => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                            d.fileType === '3D-STEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {d.fileType}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800">{d.fileName}</span>
                            <span className="text-slate-400 ml-2">({d.fileSize}・{d.uploadDate})</span>
                            {d.note && <p className="text-[11px] text-slate-500 mt-0.5">{d.note}</p>}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDrawing(d.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="移除圖檔"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                      尚未附掛任何 2D 或 3D 圖檔，可於上方輸入檔名新增建檔。
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 材料成本計算 (F03) */}
          {activeSubTab === 'material' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    材料成本自動計算 (F03)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    依新料單價、成品重、料頭重、次料回收比率、添加劑及耗損率計算單件淨材料費。
                  </p>
                </div>
              </div>

              {/* 常用材料快捷選擇器 */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  快速套用久揚標準材料資料庫 (Taiwan Market Resin Grades)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STANDARD_MATERIALS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectStandardMaterial(m.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                        formData.material.materialId === m.id
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-white border border-blue-200 text-blue-800 hover:bg-blue-100'
                      }`}
                    >
                      {m.category} - {m.grade} (${m.pricePerKg}/kg)
                    </button>
                  ))}
                </div>
              </div>

              {/* 材料欄位輸入 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">塑膠材料名稱 *</label>
                  <input
                    type="text"
                    value={formData.material.materialName}
                    onChange={e => updateNestedField(['material', 'materialName'], e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">材料規格廠牌型號 (Grade)</label>
                  <input
                    type="text"
                    value={formData.material.materialGrade}
                    onChange={e => updateNestedField(['material', 'materialGrade'], e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">新料採購單價 (NT$/kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.material.materialPricePerKg}
                    onChange={e => updateNestedField(['material', 'materialPricePerKg'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-blue-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">成品單件淨重 (g) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.material.partWeightG}
                    onChange={e => updateNestedField(['material', 'partWeightG'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">每模料頭總重 (g)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.material.runnerWeightG}
                    onChange={e => updateNestedField(['material', 'runnerWeightG'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">
                    由 {formData.molding.cavities} 穴分攤，每件分攤 {(formData.material.runnerWeightG / Math.max(1, formData.molding.cavities)).toFixed(1)}g
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">回收次料混用比例 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.material.regrindRatioPct}
                    onChange={e => updateNestedField(['material', 'regrindRatioPct'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">例如 15% 次料回用 (醫療或高精件通常設為 0%)</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">色母/添加劑比例 (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.material.additiveRatioPct}
                    onChange={e => updateNestedField(['material', 'additiveRatioPct'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">添加劑/色母單價 (NT$/kg)</label>
                  <input
                    type="number"
                    value={formData.material.additivePricePerKg}
                    onChange={e => updateNestedField(['material', 'additivePricePerKg'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">材料烘料與製程耗損率 (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.material.materialLossRatePct}
                    onChange={e => updateNestedField(['material', 'materialLossRatePct'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">通常設為 2.0% ~ 4.5%</span>
                </div>
              </div>

              {/* 公式透通試算盒 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">材料成本公式演算結果：</span>
                <p className="text-slate-600">
                  每件分攤總料重: <strong className="font-mono text-slate-900">{costSummary.grossMaterialWeightPerPartG}g</strong>
                  （含料頭 {(formData.material.runnerWeightG / Math.max(1, formData.molding.cavities)).toFixed(2)}g）
                </p>
                <p className="text-slate-600">
                  有效原料單價: <strong className="font-mono text-slate-900">NT$ {costSummary.effectiveMaterialPricePerKg}/kg</strong>
                </p>
                <div className="pt-1 text-sm font-bold text-blue-700 flex items-center gap-1">
                  <span>單件材料成本：</span>
                  <span className="font-mono text-lg">NT$ {costSummary.materialCostPerPart.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 模具與成型加工 (F04) */}
          {activeSubTab === 'molding' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  成型加工費與機台費率計算 (F04)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  公式: 成型週期 ÷ 3600 × 機台每小時費率 ÷ 每模預估良品數。
                </p>
              </div>

              {/* 常用射出機台快捷選擇 */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  選擇久揚廠內射出機台車隊 (Machine Fleet)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STANDARD_MACHINES.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectStandardMachine(m.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                        formData.molding.machineId === m.id
                          ? 'bg-amber-600 text-white font-semibold shadow-xs'
                          : 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {m.clampingForceTons}T ({m.brand}) - NT$ {m.hourlyRate}/hr
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">模穴數 (Cavities) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.molding.cavities}
                    onChange={e => updateNestedField(['molding', 'cavities'], parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-amber-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">例如 1穴、2穴、4穴、8穴</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">機台鎖模噸數 (Tons) *</label>
                  <input
                    type="number"
                    value={formData.molding.machineTonnage}
                    onChange={e => updateNestedField(['molding', 'machineTonnage'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">機台每小時加工費率 (NT$/hr) *</label>
                  <input
                    type="number"
                    value={formData.molding.machineRatePerHour}
                    onChange={e => updateNestedField(['molding', 'machineRatePerHour'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-indigo-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">成型週期 Cycle Time (秒) *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.molding.cycleTimeSec}
                    onChange={e => updateNestedField(['molding', 'cycleTimeSec'], parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm font-mono font-bold text-amber-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">預估成型良率 (%) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="50"
                    max="100"
                    value={formData.molding.yieldRatePct}
                    onChange={e => updateNestedField(['molding', 'yieldRatePct'], parseFloat(e.target.value) || 98)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">模具估價 (若由久揚開模, NT$)</label>
                  <input
                    type="number"
                    value={formData.molding.moldEstimatedCost}
                    onChange={e => updateNestedField(['molding', 'moldEstimatedCost'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* 成型產能與加工費展示 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">成型產能計算指標：</span>
                <p className="text-slate-600">
                  每小時模次: <strong className="font-mono text-slate-900">{costSummary.shotsPerHour} 模/hr</strong>
                  ｜ 每小時良品產能: <strong className="font-mono text-slate-900">{costSummary.goodPartsPerHour} 件/hr</strong>
                </p>
                <div className="pt-1 text-sm font-bold text-amber-700 flex items-center gap-1">
                  <span>單件成型加工費：</span>
                  <span className="font-mono text-lg">NT$ {costSummary.moldingCostPerPart.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 換模調機成本分攤 (F05) */}
          {activeSubTab === 'setup' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  換模及調機固定成本分攤 (F05)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  依吊模安裝、清料料耗、試模校車模數與訂購批量計算分攤費用。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">基本換模調機工費 (NT$/批)</label>
                  <input
                    type="number"
                    value={formData.setup.setupFixedFee}
                    onChange={e => updateNestedField(['setup', 'setupFixedFee'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">含吊模、水電油路銜接與模具校正</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">清料洗管料耗 (kg/批)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.setup.purgeResinKg}
                    onChange={e => updateNestedField(['setup', 'purgeResinKg'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">換色換料洗螺桿之耗用原料</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">試模校車不良模數 (shots)</label>
                  <input
                    type="number"
                    value={formData.setup.trialShots}
                    onChange={e => updateNestedField(['setup', 'trialShots'], parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">開機調機過程報廢模數</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">換模調機工時 (小時)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.setup.changeoverHours}
                    onChange={e => updateNestedField(['setup', 'changeoverHours'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* 分攤結果 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-800 block">換模成本分攤結果：</span>
                <p className="text-slate-600">
                  每批換模總成本: <strong className="font-mono text-slate-900">NT$ {costSummary.totalSetupBatchCost.toLocaleString()}</strong>
                  （分攤至 {(formData.commercial.orderQuantity || 0).toLocaleString()} 件）
                </p>
                <div className="pt-1 text-sm font-bold text-rose-700 flex items-center gap-1">
                  <span>單件換模調機分攤：</span>
                  <span className="font-mono text-lg">NT$ {costSummary.setupCostPerPart.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 後加工與二次製程 (F06) */}
          {activeSubTab === 'postprocess' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  後加工、包裝與品檢成本 (F06)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  包含剪料頭/修毛邊、超音波埋螺母、印刷移印、組裝工時、吸塑包材、全檢及物流運費。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">剪料頭 / 修毛邊工費 (NT$/件)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.postProcess.gateTrimmingUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'gateTrimmingUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">超音波熔接 / 埋銅螺母 (NT$/件)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.postProcess.ultrasonicUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'ultrasonicUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">網印 / 移印 / 雷射打標 (NT$/件)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.postProcess.printingUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'printingUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">零件組裝人工費 (NT$/件)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.postProcess.assemblyUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'assemblyUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">專用包材與裝箱費 (NT$/件)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.postProcess.packagingUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'packagingUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">品檢費 (全檢/三次元) (NT$/件)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.postProcess.inspectionUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'inspectionUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">國內外運輸運費分攤 (NT$/件)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={formData.postProcess.transportationUnitCost}
                    onChange={e => updateNestedField(['postProcess', 'transportationUnitCost'], parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <span className="font-bold text-slate-800">單件後加工與二次製程加總：</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  NT$ {costSummary.postProcessCostPerPart.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 7: 毛利與階梯報價 (F07) */}
          {activeSubTab === 'pricing' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-600" />
                  毛利定價、管銷費與階梯批量矩陣 (F07)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  建議售價 = 單件總成本 ÷ (1 － 目標毛利率)。支援階梯批量試算，展現規模經濟效益。
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">目標毛利率 (%) *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="90"
                      value={formData.commercial.targetGrossMarginPct}
                      onChange={e => updateNestedField(['commercial', 'targetGrossMarginPct'], parseFloat(e.target.value) || 25)}
                      className="w-full px-3 py-2 text-base font-mono font-bold text-blue-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">廠務管銷費率 (%)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={formData.commercial.managementExpenseRatePct}
                      onChange={e => updateNestedField(['commercial', 'managementExpenseRatePct'], parseFloat(e.target.value) || 8)}
                      className="w-full px-3 py-2 text-base font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    />
                    <span className="text-sm font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">付款條件 (Payment Terms)</label>
                  <input
                    type="text"
                    value={formData.commercial.paymentTerms}
                    onChange={e => updateNestedField(['commercial', 'paymentTerms'], e.target.value)}
                    placeholder="例如: 月結 30 天 / 訂金 30% 出貨 70%"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">貿易與交貨條件 (Incoterms)</label>
                  <input
                    type="text"
                    value={formData.commercial.tradeTerms}
                    onChange={e => updateNestedField(['commercial', 'tradeTerms'], e.target.value)}
                    placeholder="例如: 送貨到廠 (DDP) / 工廠交貨 (Ex-Works)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* 階梯報價矩陣 (Tiered Matrix) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">多批量階梯報價試算 (Tiered Pricing Matrix)</h4>
                  <span className="text-[11px] text-slate-500">批量越大，換模費用分攤越低</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">訂購批量 (件)</th>
                        <th className="py-2.5 px-3">換模分攤</th>
                        <th className="py-2.5 px-3">單件總成本</th>
                        <th className="py-2.5 px-3 font-bold text-blue-700">建議單價 (NT$)</th>
                        <th className="py-2.5 px-3">毛利率</th>
                        <th className="py-2.5 px-3">整批營業額</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {tieredResults.map(tier => {
                        const isCurrent = tier.quantity === formData.commercial.orderQuantity;
                        return (
                          <tr key={tier.quantity} className={isCurrent ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'}>
                            <td className="py-2.5 px-3">
                              {tier.quantity.toLocaleString()} 件
                              {isCurrent && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-blue-600 text-white text-[10px]">
                                  本次詢價
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">NT$ {tier.setupCost.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-slate-800">NT$ {tier.totalCost.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-blue-700 font-bold text-sm">
                              NT$ {tier.suggestedPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-600">{tier.grossMarginPct}%</td>
                            <td className="py-2.5 px-3 text-slate-700">NT$ {tier.totalRevenue.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: 主管核價與審核 (F08) */}
          {activeSubTab === 'approval' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                  報價審核與主管核價 (F08)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  設定安全毛利門檻、材料價格異常提醒與主管核准狀態簽核。
                </p>
              </div>

              {/* 審核狀態切換 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-xs font-bold text-slate-700 block">報價案件審核狀態 (Status)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'draft', label: '草稿建檔' },
                    { id: 'pending_approval', label: '待主管核價' },
                    { id: 'approved', label: '主管已核准' },
                    { id: 'sent', label: '已發送客戶' },
                    { id: 'won', label: '客戶已下單' },
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => updateNestedField(['status'], st.id)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        formData.status === st.id
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 審核門檻與原因 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">最低毛利安全門檻 (%)</label>
                  <input
                    type="number"
                    value={formData.approval.minMarginThreshold}
                    onChange={e => updateNestedField(['approval', 'minMarginThreshold'], parseFloat(e.target.value) || 20)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400">當前毛利 {formData.commercial.targetGrossMarginPct}%</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">核准主管姓名 / 職稱</label>
                  <input
                    type="text"
                    value={formData.approval.reviewedBy || ''}
                    onChange={e => updateNestedField(['approval', 'reviewedBy'], e.target.value)}
                    placeholder="例如: 林建興 廠長 (技術兼副總)"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">主管核價審核意見 / 特批備註</label>
                  <textarea
                    rows={3}
                    value={formData.approval.reviewNotes || ''}
                    onChange={e => updateNestedField(['approval', 'reviewNotes'], e.target.value)}
                    placeholder="例如: 該件已於 180T 富強鑫機台確認冷卻水路與模流，報價 27% 毛利符合標準，批准發送。"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              {/* 快捷核准按鈕 */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      status: 'approved',
                      approval: {
                        ...prev.approval,
                        reviewedBy: '林建興 廠長',
                        reviewedAt: new Date().toLocaleString('zh-TW'),
                        reviewNotes: prev.approval.reviewNotes || '主管線上快速覆核通過，符合毛利標準。',
                      },
                    }));
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  以主管身分一鍵核准報價
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右側：即時全域成本彙總看板 (4欄) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                全案成本與建議售價
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-300 font-mono font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                {formData.commercial.orderQuantity.toLocaleString()} 件
              </span>
            </div>

            {/* 大字看板 */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs text-slate-400 block font-medium">單件總製造成本 (含管銷)</span>
                <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-normal text-slate-400">NT$</span>
                  {costSummary.totalUnitCost.toFixed(2)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-blue-500/40">
                <span className="text-xs text-blue-300 block font-semibold">建議單件正式報價</span>
                <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1 mt-0.5">
                  <span className="text-xs font-normal text-blue-300">NT$</span>
                  {costSummary.suggestedUnitPrice.toFixed(2)}
                </div>
                <div className="flex items-center justify-between text-xs text-blue-300/80 pt-1 border-t border-blue-400/20 mt-2">
                  <span>預估單件毛利</span>
                  <span className="font-bold font-mono text-emerald-400">
                    NT$ {costSummary.grossProfitPerPart.toFixed(2)} ({formData.commercial.targetGrossMarginPct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* 成本明細清單 */}
            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">1. 材料成本 (F03)</span>
                <span className="font-mono font-semibold">NT$ {costSummary.materialCostPerPart.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">2. 成型加工費 (F04)</span>
                <span className="font-mono font-semibold">NT$ {costSummary.moldingCostPerPart.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">3. 換模調機分攤 (F05)</span>
                <span className="font-mono font-semibold">NT$ {costSummary.setupCostPerPart.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">4. 後加工與包運 (F06)</span>
                <span className="font-mono font-semibold">NT$ {costSummary.postProcessCostPerPart.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">5. 廠務管銷費 ({formData.commercial.managementExpenseRatePct}%)</span>
                <span className="font-mono font-semibold">NT$ {costSummary.managementExpensePerPart.toFixed(2)}</span>
              </div>
            </div>

            {/* 整批訂單營業額與總毛利 */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>整批預估總營業額：</span>
                <span className="font-mono font-bold text-white">NT$ {costSummary.batchTotalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>整批預估總毛利：</span>
                <span className="font-mono font-bold">NT$ {costSummary.batchTotalGrossProfit.toLocaleString()}</span>
              </div>
            </div>

            {/* 儲存按鈕 */}
            <button
              type="button"
              onClick={handleDirectSave}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              儲存核算結果
            </button>
          </div>
        </div>
      </div>

      {/* 升版儲存對話框 (F12) */}
      {saveAsNewVersionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              建立新版本紀錄 (Version Control)
            </h3>
            <p className="text-xs text-slate-500">
              系統將保留目前版本歷程，並自動將版號遞增（例如 V1.0 → V1.1）。請輸入本次修改原因。
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">變更原因說明 *</label>
              <textarea
                rows={3}
                value={versionReason}
                onChange={e => setVersionReason(e.target.value)}
                placeholder="例如: 客戶要求擴大批量至 30,000 件、原料原廠調漲 5% 重新核算..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaveAsNewVersionModal(false)}
                className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={!versionReason.trim()}
                onClick={handleConfirmNewVersion}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl cursor-pointer"
              >
                確認升版儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

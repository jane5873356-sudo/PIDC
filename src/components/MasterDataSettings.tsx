/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 久揚塑膠｜塑膠射出零件智慧成本報價系統 - 標準資料庫管理 (材料牌價 & 機台費率)
 */

import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Cpu, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  DollarSign, 
  TrendingUp,
  Building
} from 'lucide-react';
import { MaterialItem, MachineItem } from '../types';
import { STANDARD_MATERIALS, STANDARD_MACHINES } from '../data/standardData';

interface MasterDataSettingsProps {
  materials: MaterialItem[];
  machines: MachineItem[];
  onUpdateMaterials: (materials: MaterialItem[]) => void;
  onUpdateMachines: (machines: MachineItem[]) => void;
  onResetToDefaults: () => void;
}

export const MasterDataSettings: React.FC<MasterDataSettingsProps> = ({
  materials,
  machines,
  onUpdateMaterials,
  onUpdateMachines,
  onResetToDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'machines'>('materials');
  const [editingMatId, setEditingMatId] = useState<string | null>(null);
  const [editingMacId, setEditingMacId] = useState<string | null>(null);

  // 材料編輯狀態
  const [matForm, setMatForm] = useState<Partial<MaterialItem>>({});
  // 機台編輯狀態
  const [macForm, setMacForm] = useState<Partial<MachineItem>>({});

  const handleEditMaterial = (m: MaterialItem) => {
    setEditingMatId(m.id);
    setMatForm(m);
  };

  const handleSaveMaterial = () => {
    if (!matForm.name || !matForm.pricePerKg) return;
    const updated = materials.map(m => (m.id === editingMatId ? { ...m, ...matForm } as MaterialItem : m));
    onUpdateMaterials(updated);
    setEditingMatId(null);
  };

  const handleAddNewMaterial = () => {
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      code: 'NEW-RESIN',
      name: '自訂新塑料',
      category: 'OTHER',
      grade: 'Custom Grade',
      supplier: '原料供應商',
      pricePerKg: 75.0,
      density: 1.05,
      shrinkagePct: 0.5,
      flameRetardant: 'HB',
      lastUpdated: new Date().toISOString().slice(0, 10),
      description: '自訂工程塑膠規格',
    };
    onUpdateMaterials([newMat, ...materials]);
    handleEditMaterial(newMat);
  };

  const handleDeleteMaterial = (id: string) => {
    onUpdateMaterials(materials.filter(m => m.id !== id));
  };

  const handleEditMachine = (m: MachineItem) => {
    setEditingMacId(m.id);
    setMacForm(m);
  };

  const handleSaveMachine = () => {
    if (!macForm.model || !macForm.hourlyRate) return;
    const updated = machines.map(m => (m.id === editingMacId ? { ...m, ...macForm } as MachineItem : m));
    onUpdateMachines(updated);
    setEditingMacId(null);
  };

  const handleAddNewMachine = () => {
    const newMac: MachineItem = {
      id: `mac-${Date.now()}`,
      model: 'NEW-INJ-150',
      brand: '國產伺服射出機',
      clampingForceTons: 150,
      hourlyRate: 420,
      screwDiameterMm: 36,
      maxShotWeightG: 180,
      tieBarDistanceMm: '460 x 460',
      isAvailable: true,
      notes: '新添置射出機台',
    };
    onUpdateMachines([newMac, ...machines]);
    handleEditMachine(newMac);
  };

  const handleDeleteMachine = (id: string) => {
    onUpdateMachines(machines.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* 標題與重設工具列 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            標準基礎參數資料庫維護中心 (Master Data)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            維護全廠塑料市場基準價格 (NT$/kg) 與射出機台每小時加工費率 (NT$/hr)，確保業務與工程報價標準一致。
          </p>
        </div>

        <button
          onClick={onResetToDefaults}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer self-start sm:self-auto"
          title="恢復為久揚塑膠原廠標準預設牌價與機台費率"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          恢復預設標準庫
        </button>
      </div>

      {/* 模組切換按鈕 (材料庫 vs 機台庫) */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'materials'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          塑膠原料市場牌價庫 ({materials.length} 項)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('machines')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'machines'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          全廠射出成型機台費率車隊 ({machines.length} 台)
        </button>
      </div>

      {/* 材料牌價維護表 */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              材料價格將直接連動新詢價專案之預設成本計算，可隨時依大宗石化牌價調整
            </span>
            <button
              onClick={handleAddNewMaterial}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              新增工程塑料規格
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">類別</th>
                  <th className="py-3 px-3">塑膠名稱與型號規格 (Grade)</th>
                  <th className="py-3 px-3">供應商原廠</th>
                  <th className="py-3 px-3 text-right">基準單價 (NT$/kg)</th>
                  <th className="py-3 px-3 text-right">比重 (g/cm³)</th>
                  <th className="py-3 px-3 text-right">收縮率 (%)</th>
                  <th className="py-3 px-3">耐燃級別</th>
                  <th className="py-3 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {materials.map(m => {
                  const isEditing = editingMatId === m.id;
                  return (
                    <tr key={m.id} className={isEditing ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'}>
                      <td className="py-3 px-3 font-semibold text-blue-700">
                        {isEditing ? (
                          <input
                            type="text"
                            value={matForm.category || ''}
                            onChange={e => setMatForm({ ...matForm, category: e.target.value as any })}
                            className="w-20 px-2 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          m.category
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={matForm.name || ''}
                              onChange={e => setMatForm({ ...matForm, name: e.target.value })}
                              className="w-full px-2 py-1 text-xs border rounded bg-white"
                            />
                            <input
                              type="text"
                              value={matForm.grade || ''}
                              onChange={e => setMatForm({ ...matForm, grade: e.target.value })}
                              placeholder="原廠型號"
                              className="w-full px-2 py-1 text-[11px] border rounded bg-white font-mono"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-900 block">{m.name}</span>
                            <span className="text-[11px] font-mono text-slate-500">{m.grade}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={matForm.supplier || ''}
                            onChange={e => setMatForm({ ...matForm, supplier: e.target.value })}
                            className="w-28 px-2 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          m.supplier
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-800 text-sm">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={matForm.pricePerKg || 0}
                            onChange={e => setMatForm({ ...matForm, pricePerKg: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 text-xs border rounded bg-white text-right font-bold"
                          />
                        ) : (
                          `NT$ ${m.pricePerKg.toFixed(1)}`
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={matForm.density || 0}
                            onChange={e => setMatForm({ ...matForm, density: parseFloat(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-xs border rounded bg-white text-right"
                          />
                        ) : (
                          m.density
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={matForm.shrinkagePct || 0}
                            onChange={e => setMatForm({ ...matForm, shrinkagePct: parseFloat(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-xs border rounded bg-white text-right"
                          />
                        ) : (
                          `${m.shrinkagePct}%`
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">
                          {m.flameRetardant || 'HB'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={handleSaveMaterial}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            儲存
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditMaterial(m)}
                              className="p-1 text-slate-500 hover:text-blue-600 rounded cursor-pointer"
                              title="修改"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(m.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="刪除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 機台時費維護表 */}
      {activeTab === 'machines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              包含全電精密機、伺服節能機與重型射出機之時費率 (NT$/hr)
            </span>
            <button
              onClick={handleAddNewMachine}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              新增射出機台
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">機型名稱</th>
                  <th className="py-3 px-3">品牌規格與特性</th>
                  <th className="py-3 px-3 text-right">鎖模力 (噸)</th>
                  <th className="py-3 px-3 text-right">機台時費 (NT$/hr)</th>
                  <th className="py-3 px-3 text-right">最大射出重 (g)</th>
                  <th className="py-3 px-3">大柱內距 (mm)</th>
                  <th className="py-3 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {machines.map(m => {
                  const isEditing = editingMacId === m.id;
                  return (
                    <tr key={m.id} className={isEditing ? 'bg-amber-50/60' : 'hover:bg-slate-50/80'}>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={macForm.model || ''}
                            onChange={e => setMacForm({ ...macForm, model: e.target.value })}
                            className="w-28 px-2 py-1 text-xs border rounded bg-white font-mono"
                          />
                        ) : (
                          m.model
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={macForm.brand || ''}
                            onChange={e => setMacForm({ ...macForm, brand: e.target.value })}
                            className="w-full px-2 py-1 text-xs border rounded bg-white"
                          />
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-800">{m.brand}</span>
                            {m.notes && <p className="text-[11px] text-slate-400 mt-0.5">{m.notes}</p>}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-700">
                        {isEditing ? (
                          <input
                            type="number"
                            value={macForm.clampingForceTons || 0}
                            onChange={e => setMacForm({ ...macForm, clampingForceTons: parseInt(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-xs border rounded bg-white text-right"
                          />
                        ) : (
                          `${m.clampingForceTons} T`
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-indigo-700 text-sm">
                        {isEditing ? (
                          <input
                            type="number"
                            value={macForm.hourlyRate || 0}
                            onChange={e => setMacForm({ ...macForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                            className="w-24 px-2 py-1 text-xs border rounded bg-white text-right font-bold"
                          />
                        ) : (
                          `NT$ ${m.hourlyRate}/hr`
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {isEditing ? (
                          <input
                            type="number"
                            value={macForm.maxShotWeightG || 0}
                            onChange={e => setMacForm({ ...macForm, maxShotWeightG: parseFloat(e.target.value) || 0 })}
                            className="w-16 px-2 py-1 text-xs border rounded bg-white text-right"
                          />
                        ) : (
                          `${m.maxShotWeightG}g`
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={macForm.tieBarDistanceMm || ''}
                            onChange={e => setMacForm({ ...macForm, tieBarDistanceMm: e.target.value })}
                            className="w-24 px-2 py-1 text-xs border rounded bg-white font-mono"
                          />
                        ) : (
                          m.tieBarDistanceMm
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={handleSaveMachine}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            儲存
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditMachine(m)}
                              className="p-1 text-slate-500 hover:text-amber-600 rounded cursor-pointer"
                              title="修改"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMachine(m.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="刪除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

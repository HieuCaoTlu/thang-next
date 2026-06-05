'use client';

import React from 'react';
import {
  X, Copy, Check, Share2, Key, FileText, Loader2, AlertTriangle, Info,
  Settings, Plus, Trash2, UserPlus, CheckSquare, Square,
} from 'lucide-react';
import { PRODUCT_CATEGORIES, formatVND } from '../../lib/dataUtils';

// ============================================================
// CONFIRM MODAL
// ============================================================
export function ConfirmModal({ confirmAction, setConfirmAction }: { confirmAction: any; setConfirmAction: (v: any) => void }) {
  if (!confirmAction.isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {confirmAction.type === 'danger' ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{confirmAction.title}</h3>
          <p className="text-sm text-slate-600">{confirmAction.message}</p>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          {!confirmAction.hideCancel && (
            <button onClick={() => setConfirmAction({ isOpen: false })} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
          )}
          <button
            onClick={confirmAction.onConfirm || (() => setConfirmAction({ isOpen: false }))}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${confirmAction.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmAction.confirmText || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// REPORT MODAL
// ============================================================
export function ReportModal({ isOpen, onClose, report, isCopied, onCopy }: {
  isOpen: boolean; onClose: () => void; report: string; isCopied: boolean; onCopy: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FileText className="text-indigo-600" size={24} /> Báo Cáo Tổng Hợp</h3>
            <p className="text-sm text-slate-500 mt-1">Tự động tạo dựa trên dữ liệu đang xem</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
          <textarea readOnly value={report} className="w-full h-[400px] p-4 bg-white border border-slate-200 rounded-xl font-mono text-sm text-slate-700 focus:outline-none resize-none custom-scrollbar" />
        </div>
        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Đóng</button>
          <button onClick={onCopy} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all ${isCopied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'}`}>
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
            {isCopied ? 'Đã sao chép!' : 'Copy Báo Cáo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SHARE MODAL
// ============================================================
export function ShareModal({ isOpen, onClose, code, isCopied, onCopy }: {
  isOpen: boolean; onClose: () => void; code: string; isCopied: boolean; onCopy: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Share2 className="text-emerald-600" size={20} /> Đã Tạo Mã Chia Sẻ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-slate-600 mb-4">Gửi mã này cho đồng nghiệp. Họ ấn <strong>"Mở bằng Mã"</strong> để xem báo cáo.</p>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg inline-block w-full">
            <span className="text-3xl font-black tracking-widest text-emerald-600">{code}</span>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button onClick={onCopy} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all ${isCopied ? 'bg-emerald-500' : 'bg-emerald-600 shadow-sm'}`}>
            {isCopied ? <Check size={16} /> : <Copy size={16} />} {isCopied ? 'Đã Copy Mã!' : 'Copy Mã'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OPEN CODE MODAL
// ============================================================
export function OpenCodeModal({ isOpen, onClose, codeInput, setCodeInput, codeError, isProcessing, onLoad }: {
  isOpen: boolean; onClose: () => void; codeInput: string; setCodeInput: (v: string) => void;
  codeError: string; isProcessing: boolean; onLoad: (code: string) => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Key className="text-indigo-600" size={20} /> Mở Báo Cáo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4 text-center">Nhập mã báo cáo đã được chia sẻ.</p>
          <input
            type="text"
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value.toUpperCase()); }}
            placeholder="VD: A1B2C3"
            maxLength={6}
            className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-center text-2xl font-bold tracking-widest text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          {codeError && <p className="text-rose-500 text-sm mt-3 text-center font-medium">{codeError}</p>}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200">Hủy</button>
          <button onClick={() => onLoad(codeInput)} disabled={codeInput.length < 6 || isProcessing} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isProcessing ? 'Đang tải...' : 'Tải Dữ Liệu'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CUSTOM GROUP MODAL
// ============================================================
export function CustomGroupModal({ isOpen, onClose, editingGroup, setEditingGroup, newMemberInput, setNewMemberInput, groupModalError, onSave, onDelete, onAddMember, onRemoveMember }: {
  isOpen: boolean; onClose: () => void;
  editingGroup: any; setEditingGroup: (v: any) => void;
  newMemberInput: string; setNewMemberInput: (v: string) => void;
  groupModalError: string;
  onSave: () => void; onDelete: () => void;
  onAddMember: () => void; onRemoveMember: (name: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="text-indigo-600" size={20} />
            {editingGroup.id ? 'Chỉnh sửa Nhóm Tùy Chỉnh' : 'Tạo Nhóm Tùy Chỉnh Mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {groupModalError && (
            <div className="absolute top-0 left-6 right-6 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-sm font-bold border border-rose-200 z-10 flex items-center gap-2">
              <AlertTriangle size={16} /> {groupModalError}
            </div>
          )}

          {/* Left: name + target + members */}
          <div className={`flex flex-col gap-5 border-r-0 md:border-r border-slate-100 md:pr-6 border-b md:border-b-0 pb-6 md:pb-0 ${groupModalError ? 'mt-8' : ''}`}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên nhóm <span className="text-rose-500">*</span></label>
              <input type="text" value={editingGroup.name} onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })} placeholder="VD: Nhóm Chiến Dịch Mùa Hè..." className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tổng Mục tiêu Doanh thu (Không bắt buộc)</label>
              <input type="number" value={editingGroup.target || ''} onChange={e => setEditingGroup({ ...editingGroup, target: Number(e.target.value) })} placeholder="Để trống nếu muốn tự tính tổng từ mặt hàng..." className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <p className="text-[10px] text-slate-500 mt-1">VD: 5000000000 (5 Tỷ). Nếu để trống, hệ thống cộng dồn từ các mặt hàng bên cạnh.</p>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                Thành viên trong nhóm ({editingGroup.members.length})
                {editingGroup.members.length > 0 && (
                  <button onClick={() => setEditingGroup({ ...editingGroup, members: [] })} className="text-xs text-rose-500 hover:underline font-medium">Xóa tất cả</button>
                )}
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newMemberInput}
                  onChange={e => setNewMemberInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAddMember(); } }}
                  placeholder="Nhập tên nhân sự và ấn Enter..."
                  className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button type="button" onClick={onAddMember} disabled={!newMemberInput.trim()} className="bg-slate-100 text-slate-700 font-semibold px-4 rounded-lg text-sm hover:bg-slate-200 disabled:opacity-50 transition-colors">Thêm</button>
              </div>
              <div className="flex flex-wrap gap-2 flex-1 min-h-[150px] content-start p-3 border border-slate-200 rounded-lg bg-slate-50/50 overflow-y-auto custom-scrollbar">
                {editingGroup.members.map((member: string) => (
                  <div key={member} className="bg-white border border-slate-200 text-slate-700 shadow-sm px-2.5 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium">
                    <span className="truncate max-w-[150px]">{member}</span>
                    <button type="button" onClick={() => onRemoveMember(member)} className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-0.5 rounded transition-colors"><X size={14} /></button>
                  </div>
                ))}
                {editingGroup.members.length === 0 && <p className="w-full text-center text-xs text-slate-400 italic mt-4">Chưa có thành viên nào.</p>}
              </div>
            </div>
          </div>

          {/* Right: product targets */}
          <div className={`flex flex-col h-full ${groupModalError ? 'mt-8' : ''}`}>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
              Giao chỉ tiêu theo Mặt hàng
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Không bắt buộc</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">Nhập số tiền mục tiêu (VNĐ). Bỏ trống sẽ được bỏ qua.</p>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 border border-slate-200 rounded-lg bg-slate-50/50 p-2">
              {/* Catch-all row */}
              <div className="flex items-center gap-3 py-2 border-b-2 border-slate-300 mb-2 bg-indigo-50/50 rounded px-2">
                <span className="text-xs font-bold text-indigo-800 w-1/3 truncate">Các sản phẩm còn lại</span>
                <input
                  type="number"
                  value={editingGroup.productTargets?.['Các sản phẩm còn lại'] || ''}
                  onChange={e => {
                    const newTargets = { ...(editingGroup.productTargets || {}) };
                    if (e.target.value === '' || Number(e.target.value) === 0) delete newTargets['Các sản phẩm còn lại'];
                    else newTargets['Các sản phẩm còn lại'] = Number(e.target.value);
                    setEditingGroup({ ...editingGroup, productTargets: newTargets });
                  }}
                  placeholder="Gộp chung KH còn lại..."
                  className="flex-1 bg-white border border-indigo-200 rounded p-1.5 text-xs outline-none focus:border-indigo-500 text-right font-semibold text-indigo-700"
                />
              </div>
              {PRODUCT_CATEGORIES.map(cat => (
                <div key={cat} className="flex items-center gap-3 py-1.5 border-b border-dashed border-slate-200 last:border-0 group hover:bg-slate-100 rounded px-2 transition-colors">
                  <span className="text-xs font-medium text-slate-700 w-1/3 truncate" title={cat}>{cat}</span>
                  <input
                    type="number"
                    value={editingGroup.productTargets?.[cat] || ''}
                    onChange={e => {
                      const newTargets = { ...(editingGroup.productTargets || {}) };
                      if (e.target.value === '' || Number(e.target.value) === 0) delete newTargets[cat];
                      else newTargets[cat] = Number(e.target.value);
                      setEditingGroup({ ...editingGroup, productTargets: newTargets });
                    }}
                    placeholder="Chỉ tiêu VNĐ..."
                    className="flex-1 bg-white border border-slate-300 rounded p-1.5 text-xs outline-none focus:border-indigo-500 text-right"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          {editingGroup.id ? (
            <button onClick={onDelete} className="px-4 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-100 flex items-center gap-2">
              <Trash2 size={16} /> Xóa nhóm
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors">Hủy</button>
            <button onClick={onSave} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm flex items-center gap-2">
              <Check size={16} /> Lưu nhóm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

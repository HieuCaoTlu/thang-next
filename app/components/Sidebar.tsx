'use client';

import React from 'react';
import {
  LayoutDashboard, PieChart as PieChartIcon, Archive, Users,
  Eye, Shield, CheckCircle2, Clock, LogOut,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveTeamTab: (tab: string) => void;
  isViewOnly: boolean;
  onLogout: () => void;
  onExitViewOnly: () => void;
}

export default function Sidebar({
  activeTab, setActiveTab, setActiveTeamTab, isViewOnly, onLogout, onExitViewOnly,
}: Props) {
  const navBtn = (tab: string, icon: React.ReactNode, label: string, onClick?: () => void) => (
    <button
      onClick={onClick || (() => setActiveTab(tab))}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap w-full text-left ${
        activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white text-slate-300'
      }`}
    >
      <span className={activeTab === tab ? 'text-indigo-200' : 'text-slate-500'}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="bg-slate-900 text-slate-300 w-full md:w-64 shrink-0 flex flex-col shadow-xl z-20">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-white font-bold text-xl flex items-center gap-2">
          <LayoutDashboard className="text-indigo-500" /> Dashboard
        </h2>
        <p className="text-slate-500 text-xs mt-1">Version 2.0 (2026)</p>
      </div>

      <div className="flex flex-row md:flex-col gap-2 p-3 overflow-x-auto md:overflow-visible">
        {navBtn('finance', <PieChartIcon size={20} />, 'Quản trị tài chính')}
        {navBtn('inventory', <Archive size={20} />, 'Quản trị tồn kho')}
        {navBtn('team', <Users size={20} />, 'Quản trị đội nhóm', () => {
          setActiveTab('team');
          setActiveTeamTab('finance_team');
        })}
        {navBtn('custom', <Eye size={20} />, 'Theo dõi riêng')}

        <div className="md:mt-auto pt-2 md:border-t border-slate-800">
          {navBtn('admin', <Shield size={20} />, 'Quản trị hệ thống')}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800 hidden md:block">
        {isViewOnly ? (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-500 text-sm flex items-center gap-2">
            <Clock size={16} /> Chế độ khách
          </div>
        ) : (
          <div className="bg-slate-800 p-3 rounded-lg text-xs flex flex-col gap-1">
            <span className="text-slate-400">Trạng thái hệ thống:</span>
            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={12} /> Online & Đã lưu</span>
          </div>
        )}
        <button
          onClick={isViewOnly ? onExitViewOnly : onLogout}
          className="mt-3 w-full flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
        >
          <LogOut size={16} /> {isViewOnly ? 'Thoát chế độ xem' : 'Đăng xuất'}
        </button>
      </div>
    </div>
  );
}

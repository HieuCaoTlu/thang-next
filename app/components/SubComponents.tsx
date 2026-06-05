'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVND, COLORS, STATUS_COLORS, PRIORITY_COLORS } from '../../lib/dataUtils';

// --- KPI CARD ---
export function KPICard({ title, value, subValue, icon, valueColor = 'text-slate-800' }: {
  title: string; value: string; subValue?: string; icon: React.ReactNode; valueColor?: string;
}) {
  return (
    <div className="bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <h3 className={`text-2xl font-bold truncate ${valueColor}`} title={value}>{value}</h3>
          {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
        </div>
        <div className="p-3 bg-slate-50 rounded-lg shrink-0">{icon}</div>
      </div>
    </div>
  );
}

// --- EXPANDABLE QTY CARD ---
export function ExpandableQtyCard({ title, totalQty, breakdown, icon }: {
  title: string; totalQty: number; breakdown: { name: string; qty: number }[]; icon: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasBreakdown = breakdown && breakdown.length > 0;
  return (
    <div
      className={`bg-white p-5 lg:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full ${hasBreakdown ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
      onClick={() => hasBreakdown && setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
            {title}
            {hasBreakdown && (isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />)}
          </p>
          <h3 className="text-2xl font-bold truncate text-slate-800" title={totalQty.toLocaleString()}>{totalQty.toLocaleString()}</h3>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg shrink-0">{icon}</div>
      </div>
      {isExpanded && hasBreakdown && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-slate-600 truncate mr-2" title={item.name}>{item.name}</span>
              <span className="font-semibold text-slate-800">{item.qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- PROGRESS BAR CARD ---
export function ProgressBarCard({ data }: { data: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = data.subItemsArray && data.subItemsArray.length > 0;
  const isOverTarget = data.percent >= 100;
  const isOnTrack = data.percent >= 35;
  let barColor = 'bg-blue-500';
  if (isOverTarget) barColor = 'bg-emerald-500';
  else if (!isOnTrack) barColor = 'bg-amber-500';

  return (
    <div className={`flex flex-col group p-3 -m-3 rounded-xl transition-colors ${hasSubItems ? 'hover:bg-slate-50' : ''}`}>
      <div className={hasSubItems ? 'cursor-pointer' : ''} onClick={() => hasSubItems && setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-end mb-1.5">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            {data.name}
            {isOverTarget && <CheckCircle2 size={14} className="text-emerald-500" />}
            {hasSubItems && (isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />)}
          </span>
          <span className={`font-bold text-sm ${isOverTarget ? 'text-emerald-600' : 'text-blue-600'}`}>{data.percent.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden relative">
          <div className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(data.percent, 100)}%` }} />
          {data.percent > 100 && <div className="absolute top-0 bottom-0 right-0 w-1 bg-emerald-700" />}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span className="truncate mr-2">Thực: <strong className="text-slate-700">{formatVND(data.actual)}</strong></span>
          <span className="truncate text-right">KH: {formatVND(data.plan)}</span>
        </div>
      </div>
      {isExpanded && hasSubItems && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Chi tiết doanh thu Thực tế:</p>
          {data.subItemsArray.map((sub: any, idx: number) => {
            const subPercent = data.plan > 0 ? ((sub.actual / data.plan) * 100).toFixed(2) : 0;
            return (
              <div key={idx} className="flex justify-between items-center pl-1">
                <span className="text-slate-600 text-xs flex items-center gap-2 truncate pr-2" title={sub.name}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  <span className="truncate">{sub.name}</span>
                </span>
                <span className="font-medium text-slate-700 text-xs shrink-0 text-right">
                  {formatVND(sub.actual)}
                  <span className="text-indigo-600 ml-1 font-semibold">({subPercent}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- TASK BADGES ---
export function TaskStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    'Bắt đầu triển khai': 'bg-blue-100 text-blue-700 border-blue-200',
    'Đang chạy': 'bg-amber-100 text-amber-700 border-amber-200',
    'Đã hoàn thành': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Hủy': 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${colorMap[status] || colorMap['Hủy']}`}>{status}</span>;
}

export function TaskPriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    'Cao': 'bg-rose-100 text-rose-700 border-rose-200',
    'Trung bình': 'bg-orange-100 text-orange-700 border-orange-200',
    'Thấp': 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${colorMap[priority]}`}>{priority}</span>;
}

// --- CHART LEGEND & TOOLTIPS ---
export function CustomLegend({ payload }: { payload?: any[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2 overflow-y-auto max-h-24 pt-2 px-2 custom-scrollbar">
      {(payload || []).map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="truncate max-w-[100px]" title={entry.value}>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

export function TrendTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-100">
        <p className="font-bold text-slate-800 mb-2 border-b pb-2">{label}</p>
        {payload.filter((p: any) => p.value !== null).map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600 text-sm">{entry.name}:</span>
            <span className="font-bold text-slate-800">{formatVND(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function PieTooltip({ active, payload, total }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(2) : 0;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 min-w-[160px]">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }} />
          <p className="font-bold text-slate-700">{data.name}</p>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">{formatVND(data.value)}</p>
          <p className="text-sm text-slate-500 mt-1">Tỷ trọng: <strong className="text-blue-600">{percent}%</strong></p>
        </div>
      </div>
    );
  }
  return null;
}

// --- CUSTOM GROUP PRODUCT ITEM ---
export function CustomGroupProductItem({ prod }: { prod: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const prodPercent = prod.target > 0 ? (prod.doanhSo / prod.target) * 100 : 0;
  const isProdOverTarget = prodPercent >= 100;
  let prodBarColor = 'bg-blue-500';
  if (isProdOverTarget) prodBarColor = 'bg-emerald-500';
  else if (prodPercent < 35) prodBarColor = 'bg-amber-500';

  const hasSubItems = prod.subItemsArray && prod.subItemsArray.length > 0 &&
    !(prod.subItemsArray.length === 1 && prod.subItemsArray[0].name === prod.name);

  return (
    <div className={`flex flex-col gap-1 ${hasSubItems ? 'group/item p-1.5 -m-1.5 rounded-lg hover:bg-slate-50 transition-colors' : ''}`}>
      <div
        className={`flex justify-between items-center text-xs ${hasSubItems ? 'cursor-pointer' : ''}`}
        onClick={() => hasSubItems && setIsExpanded(!isExpanded)}
      >
        <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
          <span className="truncate" title={prod.name}>{prod.name}</span>
          {hasSubItems && (isExpanded ? <ChevronUp size={14} className="text-slate-400 shrink-0" /> : <ChevronDown size={14} className="text-slate-400 shrink-0" />)}
        </span>
        <span className={`font-bold ${isProdOverTarget ? 'text-emerald-600' : 'text-blue-600'}`}>
          {prod.target > 0 ? `${prodPercent.toFixed(1)}%` : '-'}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`${prodBarColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(prodPercent, 100)}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>DS: <span className="font-semibold text-slate-700">{formatVND(prod.doanhSo)}</span>
          <span className="ml-1 opacity-70">| SL: {prod.qty} | CVAT: {formatVND(prod.dthu)}</span>
        </span>
        <span>KH: {formatVND(prod.target)}</span>
      </div>
      {isExpanded && hasSubItems && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-col gap-1.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Chi tiết:</p>
          {prod.subItemsArray.map((sub: any, idx: number) => {
            const pct = prod.doanhSo > 0 ? ((sub.doanhSo / prod.doanhSo) * 100).toFixed(1) : 0;
            return (
              <div key={idx} className="flex flex-col gap-0.5 text-[10px] pl-1 mb-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1.5 truncate pr-2" title={sub.name}>
                    <span className="w-1 h-1 rounded-full bg-indigo-300 shrink-0" />
                    <span className="truncate">{sub.name}</span>
                  </span>
                  <span className="font-medium text-slate-700 shrink-0 text-right">
                    {formatVND(sub.doanhSo)}
                    <span className="text-indigo-500 font-semibold ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 pl-2.5">SL: {sub.qty} | CVAT: {formatVND(sub.dthu)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- TEAM FINANCE CARD ---
export function TeamFinanceCard({ team }: { team: any }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentTeamPlan = team.teamPlan > 0 ? ((team.totalDthu / team.teamPlan) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transition-all">
      <div
        className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center cursor-pointer hover:bg-slate-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shrink-0">
            {team.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{team.name}</h3>
            <p className="text-sm text-slate-500">
              {Object.keys(team.members || {}).length} thành viên &nbsp;|&nbsp;
              Kế hoạch: <strong className="text-slate-700">{formatVND(team.teamPlan)}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Doanh thu CVAT</p>
            <p className="text-xl font-black text-emerald-600">{formatVND(team.totalDthu)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Tiến độ KH</p>
            <p className={`text-xl font-black ${Number(percentTeamPlan) >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{percentTeamPlan}%</p>
          </div>
          <div className="text-slate-400">{isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5">
          {/* Summary row mobile */}
          <div className="flex gap-4 mb-4 sm:hidden">
            <div className="flex-1 bg-emerald-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-0.5">Doanh thu CVAT</p>
              <p className="font-black text-emerald-600">{formatVND(team.totalDthu)}</p>
            </div>
            <div className="flex-1 bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-slate-500 mb-0.5">Tiến độ KH</p>
              <p className={`font-black ${Number(percentTeamPlan) >= 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{percentTeamPlan}%</p>
            </div>
          </div>

          {/* Plan by product */}
          {Object.keys(team.planByProduct || {}).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Kế hoạch theo mặt hàng</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {Object.entries(team.planByProduct as Record<string, number>).sort((a, b) => b[1] - a[1]).map(([product, planVal]) => {
                  const actualVal = (team.membersArray || []).reduce((sum: number, m: any) => sum + (m.byProduct?.[product]?.dthu || 0), 0);
                  const pct = planVal > 0 ? (actualVal / planVal) * 100 : 0;
                  const isOver = pct >= 100;
                  return (
                    <div key={product}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-slate-700 truncate mr-2">{product}</span>
                        <span className={`text-sm font-bold shrink-0 ${isOver ? 'text-emerald-600' : 'text-blue-600'}`}>{pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-2 rounded-full ${isOver ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{formatVND(actualVal)}</span>
                        <span>/ {formatVND(planVal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Members */}
          {(team.membersArray || []).length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 border-t border-slate-100 pt-4">Đóng góp thành viên</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-100">
                      <th className="pb-2">Thành viên</th>
                      <th className="pb-2 text-right">CVAT</th>
                      <th className="pb-2 text-right">Doanh số</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.membersArray.map((m: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 font-medium text-slate-700">{m.name}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-800">{formatVND(m.dthu)}</td>
                        <td className="py-2.5 text-right text-slate-600">{formatVND(m.doanhSo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

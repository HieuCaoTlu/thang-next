'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
} from 'recharts';
import {
  Eye, Search, Plus, UserPlus, Edit, X, Trash2, Check, AlertTriangle, Settings,
} from 'lucide-react';
import { CustomGroupProductItem } from './SubComponents';
import { formatVND, COLORS, PRODUCT_CATEGORIES } from '../../lib/dataUtils';

interface Props {
  customGroups: any[];
  customGroupStats: any[];
  selectedTeam: string;
  selectedPeriod: string;
  periodLabel: string;
  onCreateGroup: () => void;
  onEditGroup: (group: any) => void;
}

export default function CustomTab({
  customGroups, customGroupStats, selectedTeam, selectedPeriod, periodLabel,
  onCreateGroup, onEditGroup,
}: Props) {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Eye className="text-indigo-600" size={24} /> Dashboard Theo Dõi Tùy Chỉnh</h2>
          <p className="text-sm text-slate-500 mt-1">Tạo các nhóm riêng biệt và gán chỉ tiêu từng mặt hàng để theo dõi chi tiết.</p>
        </div>
        <button
          onClick={onCreateGroup}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <UserPlus size={18} /> Tạo nhóm mới
        </button>
      </div>

      {customGroups.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-100 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4"><Search size={32} /></div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có nhóm theo dõi nào</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">Tạo các nhóm theo dõi riêng biệt để đo lường hiệu quả độc lập.</p>
          <button onClick={onCreateGroup} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-2">
            <Plus size={18} /> Tạo nhóm đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {customGroupStats.map((group, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {group.name}
                    <button onClick={() => onEditGroup(group)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><Edit size={14} /></button>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{group.members.length} thành viên được theo dõi</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Tổng Mục Tiêu</p>
                  <p className="font-bold text-slate-700">{group.calculatedTarget > 0 ? formatVND(group.calculatedTarget) : 'Chưa thiết lập'}</p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Tổng Thực tế đạt (Doanh số bán)</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-emerald-600">{formatVND(group.actualDoanhSo)}</p>
                      <p className="text-xs text-slate-500 font-medium pb-1">SL: {group.actualQty || 0} | CVAT: {formatVND(group.actualDthu)}</p>
                    </div>
                  </div>
                  {group.calculatedTarget > 0 && (
                    <div className="text-right">
                      <span className={`text-xl font-bold ${group.percent >= 100 ? 'text-emerald-500' : 'text-blue-600'}`}>{group.percent.toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                {group.calculatedTarget > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-1000 ${group.percent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(group.percent, 100)}%` }} />
                  </div>
                )}

                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {/* Products */}
                  <div className="flex flex-col h-full border-r-0 md:border-r border-slate-100 pr-0 md:pr-4">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Mục tiêu theo mặt hàng</p>
                    {group.productList.length > 0 && (
                      <div className="h-[140px] w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={group.productList} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" hide />
                            <Tooltip
                              cursor={{ fill: '#f8fafc' }}
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const item = payload[0].payload;
                                  const pct = item.target > 0 ? ((item.doanhSo / item.target) * 100).toFixed(1) : 0;
                                  return (
                                    <div className="bg-white p-2 rounded shadow-md border border-slate-100 text-xs">
                                      <p className="font-bold text-slate-700 mb-1">{item.name}</p>
                                      {payload.map((p: any, i: number) => <p key={i} style={{ color: p.color }}>{p.name}: {formatVND(p.value)}</p>)}
                                      {item.target > 0 && <p className="text-indigo-600 font-bold mt-1">Hoàn thành: {pct}%</p>}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="target" name="Mục tiêu" fill="#cbd5e1" radius={[2, 2, 0, 0]} maxBarSize={30} />
                            <Bar dataKey="doanhSo" name="Thực tế (DS)" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={30}>
                              <LabelList
                                dataKey="doanhSo"
                                content={(props: any) => {
                                  const { x, y, width, index } = props;
                                  const target = group.productList[index]?.target;
                                  const val = group.productList[index]?.doanhSo;
                                  if (!target || target === 0) return null;
                                  const pct = ((val / target) * 100).toFixed(0);
                                  return (
                                    <text x={x + width / 2} y={y - 4} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">{pct}%</text>
                                  );
                                }}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div className="flex flex-col gap-4 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {group.productList.length === 0
                        ? <p className="text-sm text-slate-500 italic">Chưa có chỉ tiêu mặt hàng.</p>
                        : group.productList.map((prod: any, pidx: number) => <CustomGroupProductItem key={pidx} prod={prod} />)}
                    </div>
                  </div>

                  {/* Members */}
                  <div className="flex flex-col h-full pl-0 md:pl-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Đóng góp của thành viên</p>
                    {group.memberList.some((m: any) => m.dthu > 0) && (
                      <div className="h-[140px] w-full mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={group.memberList.filter((m: any) => m.doanhSo > 0 || m.dthu > 0)}
                              cx="50%" cy="50%"
                              innerRadius={30} outerRadius={60}
                              paddingAngle={2} dataKey="doanhSo" nameKey="name"
                            >
                              {group.memberList.filter((m: any) => m.doanhSo > 0 || m.dthu > 0).map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const p = payload[0];
                                  return (
                                    <div className="bg-white p-2 rounded shadow-md border border-slate-100 text-xs text-center">
                                      <p className="font-bold text-slate-700 mb-1">{p.name}</p>
                                      <p className="font-bold" style={{ color: p.payload.fill }}>{formatVND(p.value)}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {group.memberList.map((m: any, midx: number) => {
                        const mPercent = group.actualDoanhSo > 0 ? ((m.doanhSo / group.actualDoanhSo) * 100).toFixed(1) : 0;
                        return (
                          <div key={midx} className="flex justify-between items-center text-sm border-b border-dashed border-slate-100 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2 overflow-hidden mr-2">
                              <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">{m.name.charAt(0)}</div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-700 truncate" title={m.name}>{m.name}</span>
                                <span className="text-[10px] text-slate-500">SL: {m.qty} | CVAT: {formatVND(m.dthu)}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-slate-800">{formatVND(m.doanhSo)}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Chiếm {mPercent}% nhóm</p>
                            </div>
                          </div>
                        );
                      })}
                      {group.memberList.length === 0 && <p className="text-sm text-slate-500 italic">Nhóm chưa có dữ liệu trong kỳ này.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

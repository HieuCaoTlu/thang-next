'use client';

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, DollarSign, Target, Clock,
  Package, Calendar, Filter, UploadCloud, FileText, Share2, Key, Loader2,
} from 'lucide-react';
import {
  KPICard, ExpandableQtyCard, ProgressBarCard,
  CustomLegend, TrendTooltip, PieTooltip,
} from './SubComponents';
import { formatVND, COLORS, periodOptions } from '../../lib/dataUtils';

interface Props {
  // data
  kpis: any;
  forecastData: any;
  productProgress: any[];
  chartData: any[];
  growthTableData: any[];
  forecastChartData: any[];
  qtyBreakdown: any[];
  totalActual: number;
  actualVsPlanValue: number;
  actualVsPlanPercent: number;
  forecastVsPlanValue: number;
  forecastVsPlanPercent: number;
  dynamicTeams: string[];
  // filters
  selectedTeam: string;
  setSelectedTeam: (v: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (v: string) => void;
  chartGranularity: string;
  setChartGranularity: (v: string) => void;
  financeMetric: string;
  setFinanceMetric: (v: string) => void;
  progressPeriodMode: string;
  setProgressPeriodMode: (v: string) => void;
  periodLabel: string;
  growthPeriodLabel: string;
  currentMonthNum: number;
  // actions
  isProcessing: boolean;
  uploadedActual: string | null;
  uploadedPlan: string | null;
  uploadError: string | null;
  actualFileInputRef: React.RefObject<HTMLInputElement | null>;
  planFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleActualFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePlanFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenReport: () => void;
  onOpenShare: () => void;
  onOpenCode: () => void;
}

export default function FinanceTab({
  kpis, forecastData, productProgress, chartData, growthTableData,
  forecastChartData, qtyBreakdown, totalActual,
  actualVsPlanValue, actualVsPlanPercent, forecastVsPlanValue, forecastVsPlanPercent,
  dynamicTeams, selectedTeam, setSelectedTeam, selectedPeriod, setSelectedPeriod,
  chartGranularity, setChartGranularity, financeMetric, setFinanceMetric,
  progressPeriodMode, setProgressPeriodMode, periodLabel, growthPeriodLabel, currentMonthNum,
  isProcessing, uploadedActual, uploadedPlan, uploadError,
  actualFileInputRef, planFileInputRef, handleActualFileChange, handlePlanFileChange,
  onOpenReport, onOpenShare, onOpenCode,
}: Props) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Phân tích Kết quả Kinh doanh
            {isProcessing && <Loader2 className="animate-spin text-blue-500" size={20} />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi % hoàn thành mục tiêu đa chiều</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-start xl:justify-end">
          <button onClick={onOpenCode} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 shadow-sm"><Key size={16} /> Mở bằng Mã</button>
          <button onClick={onOpenShare} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 hover:bg-emerald-100 shadow-sm"><Share2 size={16} /> Chia Sẻ</button>
          <button onClick={onOpenReport} className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 hover:bg-indigo-100 shadow-sm"><FileText size={16} /> Báo Cáo</button>
          <input type="file" ref={actualFileInputRef} onChange={handleActualFileChange} accept=".xlsx,.xls,.csv" style={{ display: 'none' }} />
          <button onClick={() => actualFileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm text-slate-600 disabled:opacity-50"><UploadCloud size={16} /> Up Thực Tế</button>
          <input type="file" ref={planFileInputRef} onChange={handlePlanFileChange} accept=".xlsx,.xls,.csv" style={{ display: 'none' }} />
          <button onClick={() => planFileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-2 bg-blue-600 border border-blue-600 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm disabled:opacity-50"><Target size={16} /> Up Kế Hoạch</button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-4 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-md border border-rose-100">⚠ {uploadError}</div>
      )}
      {(uploadedActual || uploadedPlan) && (
        <div className="mb-4 text-xs text-slate-500 flex gap-4 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
          {uploadedActual && <span>Thực tế: <span className="font-semibold text-blue-700">{uploadedActual}</span></span>}
          {uploadedPlan && <span>Kế hoạch: <span className="font-semibold text-blue-700">{uploadedPlan}</span></span>}
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium min-w-fit"><Filter size={18} /> Lọc Báo Cáo:</div>
        <select className="bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-sm rounded-lg p-2.5 outline-none min-w-[200px]" value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
          <option value="All">🏢 Toàn Công Ty (Tất cả Nhóm)</option>
          {dynamicTeams.map(t => <option key={t} value={t}>👤 Nhóm: {t}</option>)}
        </select>
        <select className="bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-sm rounded-lg p-2.5 outline-none min-w-[180px]" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
          {periodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div className="w-px h-8 bg-slate-200 hidden md:block mx-2" />
        <div className="flex items-center gap-4 ml-auto flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Chỉ số:</span>
            <select className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-lg p-2.5 outline-none" value={financeMetric} onChange={e => setFinanceMetric(e.target.value)}>
              <option value="dthuChuaVat">Doanh thu CVAT</option>
              <option value="doanhSo">Doanh số bán</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Kỳ đối chiếu:</span>
            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 outline-none" value={chartGranularity} onChange={e => setChartGranularity(e.target.value)}>
              <option value="day">Theo Ngày</option>
              <option value="month">Theo Tháng</option>
              <option value="quarter">Theo Quý</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        <KPICard title="Doanh thu hôm nay" value={formatVND(kpis.totalDthuToday)} icon={<Calendar className="text-orange-500" size={24} />} valueColor="text-orange-600" />
        <KPICard title="Doanh thu chưa VAT" value={formatVND(kpis.totalDthuChuaVAT)} icon={<DollarSign className="text-emerald-500" size={24} />} />
        <KPICard title={`Kế hoạch (${periodLabel})`} value={formatVND(kpis.totalPlan)} icon={<Target className="text-slate-500" size={24} />} />
        <KPICard
          title={`Dự phóng (${periodLabel})`}
          value={formatVND(forecastData.forecast)}
          subValue={`${forecastData.method} • Dự kiến đạt: ${forecastData.forecastPercent.toFixed(1)}% KH`}
          icon={<TrendingUp className="text-indigo-500" size={24} />}
        />
        <KPICard
          title="Tiến độ hiện tại"
          value={`${kpis.percentAchieved}%`}
          icon={<Clock className={Number(kpis.percentAchieved) >= 80 ? 'text-emerald-500' : 'text-amber-500'} size={24} />}
          valueColor={Number(kpis.percentAchieved) >= 80 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <KPICard title="Doanh số bán" value={formatVND(kpis.totalDoanhSo)} icon={<DollarSign className="text-blue-500" size={24} />} />
        <ExpandableQtyCard title="Số lượng sp đã bán" totalQty={kpis.totalQty} breakdown={qtyBreakdown} icon={<Package className="text-purple-500" size={24} />} />
      </div>

      {/* PROGRESS BARS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-blue-600" size={20} /> Hoàn thành Mục tiêu từng Mặt hàng
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Nhóm: <strong className="text-blue-600">{selectedTeam === 'All' ? 'Toàn công ty' : selectedTeam}</strong>
              <span className="mx-2">|</span>
              Mốc đối chiếu: <strong className="text-indigo-600">{growthPeriodLabel}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap pl-2">Mốc kế hoạch:</span>
            <select
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-md py-1 px-2.5 outline-none"
              value={progressPeriodMode}
              onChange={e => setProgressPeriodMode(e.target.value)}
            >
              <option value="global">🔗 Đồng bộ bộ lọc chung ({periodLabel})</option>
              <option value="ytd">📅 Lũy kế từ đầu năm (YTD - T1-T{currentMonthNum})</option>
              <option value="current_month">🗓️ Chỉ riêng Tháng hiện tại (T{currentMonthNum})</option>
              <option value="full_year">📊 Toàn bộ kế hoạch cả năm 2026</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6">
          {productProgress.map((prod, idx) => <ProgressBarCard key={idx} data={prod} />)}
          {productProgress.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-400 font-medium">Chưa có dữ liệu kế hoạch và thực tế cho mốc thời gian này.</div>
          )}
        </div>
      </div>

      {/* TREND CHART */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">Biến động & Dự báo Doanh thu</h2>
          <p className="text-sm text-slate-500">Đường dự báo nối tiếp thực tế theo {chartGranularity === 'day' ? 'Ngày' : chartGranularity === 'month' ? 'Tháng' : 'Quý'}</p>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} minTickGap={20} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={val => `${(val / 1e9).toFixed(0)}Tỷ`} />
              <Tooltip content={<TrendTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line yAxisId="left" type="monotone" dataKey="plan" name="Kế hoạch giao" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="forecast" name="Dự báo (Forecast)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
              <Area yAxisId="left" type="monotone" dataKey="actual" name={`Thực tế (${financeMetric === 'doanhSo' ? 'DS' : 'CVAT'})`} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIE + BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">So sánh Tổng quan</h2>
            <p className="text-sm text-slate-500">Thực tế ({financeMetric === 'doanhSo' ? 'Doanh số' : 'Doanh thu CVAT'}) & Dự phóng vs Kế hoạch ({periodLabel})</p>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">Thực tế vs KH</p>
              <div className="flex items-center gap-1.5">
                {actualVsPlanValue > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : actualVsPlanValue < 0 ? <TrendingDown size={16} className="text-rose-500" /> : <Minus size={16} className="text-slate-400" />}
                <span className={`font-bold ${actualVsPlanValue > 0 ? 'text-emerald-600' : actualVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {actualVsPlanValue > 0 ? '+' : ''}{formatVND(actualVsPlanValue)}
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${actualVsPlanValue > 0 ? 'text-emerald-600' : actualVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                ({actualVsPlanPercent > 0 ? '+' : ''}{actualVsPlanPercent.toFixed(1)}%)
              </p>
            </div>
            <div className="flex-1 bg-purple-50/40 p-3 rounded-lg border border-purple-100">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">Dự phóng vs KH</p>
              <div className="flex items-center gap-1.5">
                {forecastVsPlanValue > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : forecastVsPlanValue < 0 ? <TrendingDown size={16} className="text-rose-500" /> : <Minus size={16} className="text-slate-400" />}
                <span className={`font-bold ${forecastVsPlanValue > 0 ? 'text-emerald-600' : forecastVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {forecastVsPlanValue > 0 ? '+' : ''}{formatVND(forecastVsPlanValue)}
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${forecastVsPlanValue > 0 ? 'text-emerald-600' : forecastVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                ({forecastVsPlanPercent > 0 ? '+' : ''}{forecastVsPlanPercent.toFixed(1)}%)
              </p>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barSize={50}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={val => `${(val / 1e9).toFixed(0)}Tỷ`} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
                          <p className="font-bold text-slate-700">{payload[0].payload.name}</p>
                          <p className="font-bold text-lg" style={{ color: payload[0].payload.fill }}>{formatVND(payload[0].value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {forecastChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">Cơ cấu Doanh thu</h2>
            <p className="text-sm text-slate-500">Đóng góp của các mặt hàng vào số Thực tế</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={productProgress.filter(p => p.actual > 0)} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="actual">
                  {productProgress.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip content={(props: any) => <PieTooltip {...props} total={totalActual} />} />
                <Legend content={<CustomLegend />} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GROWTH TABLE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">Phân tích Tăng trưởng (Period-over-Period)</h2>
          <p className="text-sm text-slate-500">So sánh thực tế giữa các <strong className="text-blue-600">{chartGranularity === 'day' ? 'ngày' : chartGranularity === 'month' ? 'tháng' : 'quý'}</strong> liên tiếp</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-y border-slate-200">
                <th className="p-3 font-semibold">Kỳ báo cáo</th>
                <th className="p-3 font-semibold text-right">Thực tế ({financeMetric === 'doanhSo' ? 'Doanh số' : 'Doanh thu CVAT'})</th>
                <th className="p-3 font-semibold text-right">Kế hoạch</th>
                <th className="p-3 font-semibold text-right">Tiến độ KH</th>
                <th className="p-3 font-semibold text-right">+/- Giá trị vs Kỳ trước</th>
                <th className="p-3 font-semibold text-right">Tăng trưởng (%)</th>
              </tr>
            </thead>
            <tbody>
              {growthTableData.map((row, idx) => {
                const isPositive = row.diffValue > 0;
                const isNegative = row.diffValue < 0;
                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-700">{row.time}</td>
                    <td className="p-3 text-right font-bold text-slate-800">{formatVND(row.actual)}</td>
                    <td className="p-3 text-right text-slate-500">{formatVND(row.plan)}</td>
                    <td className="p-3 text-right">
                      {row.plan > 0 ? (
                        <span className={`font-medium ${row.actual >= row.plan ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {((row.actual / row.plan) * 100).toFixed(1)}%
                        </span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-3 text-right">
                      {row.hasPrev && (row.actual > 0 || row.prevActual > 0) ? (
                        <span className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-emerald-600' : isNegative ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                          {isPositive ? '+' : ''}{formatVND(row.diffValue)}
                        </span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-3 text-right">
                      {row.hasPrev && row.prevActual > 0 ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700' : isNegative ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          {isPositive ? '+' : ''}{row.diffPercent.toFixed(1)}%
                        </span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

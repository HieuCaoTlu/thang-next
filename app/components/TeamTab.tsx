'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  DollarSign, PieChart as PieChartIcon, ListTodo,
  Users, Lock, AlertTriangle, Clock, Plus, Briefcase, Trash2,
} from 'lucide-react';
import { TeamFinanceCard, TaskStatusBadge, TaskPriorityBadge } from './SubComponents';
import { STATUS_COLORS } from '../../lib/dataUtils';

interface Props {
  activeTeamTab: string;
  setActiveTeamTab: (v: string) => void;
  teamAggregations: any[];
  tasks: any[];
  filteredTasks: any[];
  taskKPIs: any;
  taskFilters: any;
  setTaskFilters: (v: any) => void;
  dynamicEmployees: string[];
  newTask: any;
  setNewTask: (v: any) => void;
  handleTaskSubmit: (e: React.FormEvent) => void;
  handleDeleteTaskConfirm: (id: string) => void;
}

const STATUS_KEYS = Object.keys(STATUS_COLORS);

export default function TeamTab({
  activeTeamTab, setActiveTeamTab,
  teamAggregations, tasks, filteredTasks, taskKPIs,
  taskFilters, setTaskFilters, dynamicEmployees,
  newTask, setNewTask, handleTaskSubmit, handleDeleteTaskConfirm,
}: Props) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* SUB TABS */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto custom-scrollbar">
        <button onClick={() => setActiveTeamTab('finance_team')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeTeamTab === 'finance_team' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
          <DollarSign size={18} /> Tài chính nhóm
        </button>
        <button onClick={() => setActiveTeamTab('task_overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeTeamTab === 'task_overview' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
          <PieChartIcon size={18} /> Tổng quan công việc
        </button>
        <button onClick={() => setActiveTeamTab('task_management')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeTeamTab === 'task_management' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}>
          <ListTodo size={18} /> Quản lý công việc
        </button>
      </div>

      {/* FINANCE TEAM */}
      {activeTeamTab === 'finance_team' && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          {teamAggregations.length === 0 ? (
            <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-100 text-center">
              <Users size={48} className="text-slate-300 mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có dữ liệu đội nhóm</h3>
              <p className="text-slate-500">Vui lòng tải lên file báo cáo thực tế chứa thông tin Trưởng nhóm.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {teamAggregations.map((team, idx) => <TeamFinanceCard key={idx} team={team} />)}
            </div>
          )}
        </div>
      )}

      {/* TASK OVERVIEW */}
      {activeTeamTab === 'task_overview' && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Từ ngày</p>
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none" value={taskFilters.startDate} onChange={e => setTaskFilters({ ...taskFilters, startDate: e.target.value })} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Đến ngày</p>
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none" value={taskFilters.endDate} onChange={e => setTaskFilters({ ...taskFilters, endDate: e.target.value })} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Nhân sự phụ trách</p>
              <select className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none w-40" value={taskFilters.empName} onChange={e => setTaskFilters({ ...taskFilters, empName: e.target.value })}>
                <option value="All">Tất cả nhân sự</option>
                {dynamicEmployees.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Trạng thái</p>
              <select className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 outline-none w-40" value={taskFilters.status} onChange={e => setTaskFilters({ ...taskFilters, status: e.target.value })}>
                <option value="All">Tất cả trạng thái</option>
                {STATUS_KEYS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* KPI boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><p className="text-sm font-medium text-slate-500 mb-1">Tổng công việc</p><h3 className="text-2xl font-bold text-indigo-600">{taskKPIs.total}</h3></div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><p className="text-sm font-medium text-slate-500 mb-1">Hoàn thành / Hủy</p><h3 className="text-2xl font-bold text-emerald-600">{taskKPIs.completed}</h3></div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><p className="text-sm font-medium text-slate-500 mb-1">Đang làm</p><h3 className="text-2xl font-bold text-amber-500">{taskKPIs.inProgress}</h3></div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><p className="text-sm font-medium text-slate-500 mb-1">Quá hạn</p><h3 className="text-2xl font-bold text-rose-600">{taskKPIs.overdue}</h3></div>
          </div>

          {/* Overdue & upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100">
              <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2 mb-4"><AlertTriangle size={18} /> Quá hạn cần xử lý</h3>
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {taskKPIs.overdueList.length === 0
                  ? <p className="text-sm text-slate-500 italic">Không có công việc nào quá hạn.</p>
                  : taskKPIs.overdueList.map((t: any) => (
                    <div key={t.id} className="bg-white p-3 rounded-lg border border-rose-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-800 truncate" title={t.name}>{t.name}</p>
                        <TaskPriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-xs text-slate-500 mb-2 truncate">PT: {t.empName} | Hạn: {t.endDate}</p>
                      <TaskStatusBadge status={t.status} />
                    </div>
                  ))}
              </div>
            </div>
            <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100">
              <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4"><Clock size={18} /> Sắp đến hạn (7 ngày tới)</h3>
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                {taskKPIs.upcomingList.length === 0
                  ? <p className="text-sm text-slate-500 italic">Không có công việc sắp đến hạn.</p>
                  : taskKPIs.upcomingList.map((t: any) => (
                    <div key={t.id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-slate-800 truncate" title={t.name}>{t.name}</p>
                        <TaskPriorityBadge priority={t.priority} />
                      </div>
                      <p className="text-xs text-slate-500 mb-2 truncate">PT: {t.empName} | Hạn: {t.endDate}</p>
                      <TaskStatusBadge status={t.status} />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Status pie */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 h-[350px] w-full flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Dashboard Trạng Thái Công Việc</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskKPIs.statusChartData}
                  cx="50%" cy="45%"
                  innerRadius={60} outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskKPIs.statusChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TASK MANAGEMENT */}
      {activeTeamTab === 'task_management' && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          {/* Add form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={18} /> Thêm mới công việc / dự án</h3>
            <form onSubmit={handleTaskSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="Mã dự án (Tự động nếu trống)" className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newTask.id} onChange={e => setNewTask({ ...newTask, id: e.target.value })} />
              <input type="text" required placeholder="Tên dự án" className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 lg:col-span-2" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
              <input type="text" required placeholder="Mục tiêu" className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newTask.goal} onChange={e => setNewTask({ ...newTask, goal: e.target.value })} />
              <input type="text" placeholder="Mã NV quản lý" className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newTask.empId} onChange={e => setNewTask({ ...newTask, empId: e.target.value })} />
              <input type="text" required placeholder="Họ tên NV quản lý" className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500" value={newTask.empName} onChange={e => setNewTask({ ...newTask, empName: e.target.value })} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Bắt đầu:</span>
                <input type="date" required className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none w-full" value={newTask.startDate} onChange={e => setNewTask({ ...newTask, startDate: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Kết thúc:</span>
                <input type="date" required className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none w-full" value={newTask.endDate} onChange={e => setNewTask({ ...newTask, endDate: e.target.value })} />
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none lg:col-span-2" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                {STATUS_KEYS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                <option value="Thấp">Ưu tiên: Thấp</option>
                <option value="Trung bình">Ưu tiên: Trung bình</option>
                <option value="Cao">Ưu tiên: Cao</option>
              </select>
              <button type="submit" className="bg-indigo-600 text-white font-bold rounded-lg p-2.5 text-sm hover:bg-indigo-700 transition-colors">Thêm Công Việc</button>
            </form>
          </div>

          {/* Task list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase size={18} /> Danh sách toàn bộ công việc</h3>
              <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-3 py-1 rounded-full">{tasks.length} tasks</span>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 font-semibold pl-5">Mã</th>
                    <th className="p-3 font-semibold">Tên Dự án / Mục tiêu</th>
                    <th className="p-3 font-semibold">Nhân sự</th>
                    <th className="p-3 font-semibold">Thời gian</th>
                    <th className="p-3 font-semibold text-center">Trạng thái</th>
                    <th className="p-3 font-semibold text-center">Ưu tiên</th>
                    <th className="p-3 font-semibold text-center pr-5">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 pl-5 text-xs font-mono text-slate-500">{t.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t.goal}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-700 text-sm">{t.empName}</p>
                        <p className="text-xs text-slate-400">{t.empId}</p>
                      </td>
                      <td className="p-3 text-xs text-slate-600">{t.startDate} ➔ <strong className="text-slate-800">{t.endDate}</strong></td>
                      <td className="p-3 text-center"><TaskStatusBadge status={t.status} /></td>
                      <td className="p-3 text-center"><TaskPriorityBadge priority={t.priority} /></td>
                      <td className="p-3 text-center pr-5">
                        <button onClick={() => handleDeleteTaskConfirm(t.id)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors" title="Xóa công việc"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500 italic">Không tìm thấy công việc nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
} from 'recharts';
import { Package, Archive, Database, Target, Briefcase, Search, UploadCloud } from 'lucide-react';
import { COLORS, formatVND } from '../../lib/dataUtils';

interface Props {
  activeInventoryTab: string;
  setActiveInventoryTab: (v: string) => void;
  // overview inventory
  invSearch: string;
  setInvSearch: (v: string) => void;
  invRegionFilter: string;
  setInvRegionFilter: (v: string) => void;
  invBrandFilter: string;
  setInvBrandFilter: (v: string) => void;
  invDynamicRegions: string[];
  invDynamicBrands: string[];
  inventoryDataProcessed: any;
  // detailed inventory
  rawDetailedInventory: any[];
  invDetailSearch: string;
  setInvDetailSearch: (v: string) => void;
  // upload
  isProcessing: boolean;
  inventoryFileInputRef: React.RefObject<HTMLInputElement | null>;
  detailedInventoryFileInputRef: React.RefObject<HTMLInputElement | null>;
  handleInventoryFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDetailedInventoryFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InventoryTab({
  activeInventoryTab, setActiveInventoryTab,
  invSearch, setInvSearch, invRegionFilter, setInvRegionFilter,
  invBrandFilter, setInvBrandFilter, invDynamicRegions, invDynamicBrands,
  inventoryDataProcessed, rawDetailedInventory, invDetailSearch, setInvDetailSearch,
  isProcessing, inventoryFileInputRef, detailedInventoryFileInputRef,
  handleInventoryFileChange, handleDetailedInventoryFileChange,
}: Props) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản Trị Tồn Kho</h1>
          <p className="text-slate-500 text-sm mt-1">Kiểm soát hàng hóa tồn kho theo khu vực và thương hiệu</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeInventoryTab === 'overview' && (
            <>
              <input type="file" ref={inventoryFileInputRef} onChange={handleInventoryFileChange} accept=".xlsx,.xls,.csv" style={{ display: 'none' }} />
              <button onClick={() => inventoryFileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-2 bg-blue-600 border border-blue-600 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 shadow-sm disabled:opacity-50">
                <Database size={16} /> Up Tồn Kho Tổng Quan
              </button>
            </>
          )}
          {activeInventoryTab === 'detailed' && (
            <>
              <input type="file" ref={detailedInventoryFileInputRef} onChange={handleDetailedInventoryFileChange} accept=".xlsx,.xls,.csv" style={{ display: 'none' }} />
              <button onClick={() => detailedInventoryFileInputRef.current?.click()} disabled={isProcessing} className="flex items-center gap-2 bg-emerald-600 border border-emerald-600 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm disabled:opacity-50">
                <Archive size={16} /> Up Tồn Kho Chi Tiết
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUB TABS */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3 overflow-x-auto custom-scrollbar">
        <button onClick={() => setActiveInventoryTab('overview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeInventoryTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Package size={18} /> Tổng quan
        </button>
        <button onClick={() => setActiveInventoryTab('detailed')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${activeInventoryTab === 'detailed' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Archive size={18} /> Tổng tồn kho chi tiết
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeInventoryTab === 'overview' && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px]">
              <p className="text-xs font-semibold text-slate-500 mb-1">Tìm kiếm Mã hoặc Tên hàng</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Nhập mã hàng hoặc tên hàng..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" value={invSearch} onChange={e => setInvSearch(e.target.value)} />
              </div>
            </div>
            <div className="w-full md:w-auto">
              <p className="text-xs font-semibold text-slate-500 mb-1">Khu vực</p>
              <select className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none w-full md:w-48" value={invRegionFilter} onChange={e => setInvRegionFilter(e.target.value)}>
                <option value="All">Tất cả Khu vực</option>
                {invDynamicRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="w-full md:w-auto">
              <p className="text-xs font-semibold text-slate-500 mb-1">Thương hiệu</p>
              <select className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none w-full md:w-48" value={invBrandFilter} onChange={e => setInvBrandFilter(e.target.value)}>
                <option value="All">Tất cả Thương hiệu</option>
                {invDynamicBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* KPI boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Tổng SL Tồn</p><h3 className="text-2xl font-bold text-slate-800">{inventoryDataProcessed.totalQty.toLocaleString()}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Archive size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Số Sản Phẩm</p><h3 className="text-2xl font-bold text-slate-800">{inventoryDataProcessed.products.length.toLocaleString()}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Database size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Khu vực</p><h3 className="text-2xl font-bold text-slate-800">{inventoryDataProcessed.byRegion.length}</h3></div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Target size={24} /></div>
              <div><p className="text-sm font-medium text-slate-500">Thương hiệu</p><h3 className="text-2xl font-bold text-slate-800">{inventoryDataProcessed.byBrand.length}</h3></div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tồn kho theo Khu vực</h3>
              <div className="h-[250px] w-full">
                {inventoryDataProcessed.byRegion.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={inventoryDataProcessed.byRegion} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                        {inventoryDataProcessed.byRegion.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value: any) => value.toLocaleString()} />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-400 italic">Không có dữ liệu</div>}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Tồn kho theo Thương hiệu (Top 10)</h3>
              <div className="h-[250px] w-full">
                {inventoryDataProcessed.byBrand.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryDataProcessed.byBrand.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v: any) => v.toLocaleString()} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: any) => [value.toLocaleString(), 'Tồn kho']} />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                        <LabelList dataKey="value" position="top" formatter={(val: any) => val.toLocaleString()} style={{ fontSize: '10px', fill: '#64748b', fontWeight: 'bold' }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-slate-400 italic">Không có dữ liệu</div>}
              </div>
            </div>
          </div>

          {/* Product list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Briefcase size={18} /> Danh sách Hàng hóa Tồn kho</h3>
            </div>
            <div className="overflow-x-auto w-full max-h-[600px] custom-scrollbar relative">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="sticky top-0 bg-slate-50 z-10">
                  <tr className="text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="p-4 font-semibold pl-6 w-[150px]">Mã hàng</th>
                    <th className="p-4 font-semibold w-[30%]">Tên sản phẩm</th>
                    <th className="p-4 font-semibold text-center">Thương hiệu</th>
                    <th className="p-4 font-semibold text-right pr-6 w-[120px]">Tổng tồn</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryDataProcessed.products.map((p: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-mono text-sm font-bold text-slate-700">{p.code}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800 text-sm leading-snug">{p.name}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {p.locArray.map((locItem: any, locIdx: number) => (
                            <span key={locIdx} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded text-[11px] font-medium">
                              {locItem.loc}: <strong className="text-blue-600">{locItem.qty.toLocaleString()}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap">{p.brand}</span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <span className="text-lg font-black text-slate-800">{p.totalQty.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                  {inventoryDataProcessed.products.length === 0 && (
                    <tr><td colSpan={4} className="p-10 text-center text-slate-500 italic">Không tìm thấy dữ liệu. Vui lòng tải lên file tồn kho.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED TAB */}
      {activeInventoryTab === 'detailed' && (
        <div className="animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-end">
            <div className="flex-1 min-w-[250px] max-w-md">
              <p className="text-xs font-semibold text-slate-500 mb-1">Tìm kiếm Tên kho, Mã, Tên hàng</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Nhập thông tin cần tìm..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" value={invDetailSearch} onChange={e => setInvDetailSearch(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Archive size={18} className="text-emerald-600" /> Báo cáo Tổng tồn kho chi tiết</h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">{rawDetailedInventory.length} mã hàng</span>
            </div>
            <div className="overflow-x-auto w-full max-h-[650px] custom-scrollbar relative">
              <table className="w-full text-left border-collapse min-w-[1400px]">
                <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th rowSpan={2} className="p-3 border-r border-b border-slate-200 text-center w-[150px]">Tên kho</th>
                    <th rowSpan={2} className="p-3 border-r border-b border-slate-200 text-center w-[100px]">Mã kho</th>
                    <th rowSpan={2} className="p-3 border-r border-b border-slate-200 text-center w-[120px]">Mã hàng</th>
                    <th rowSpan={2} className="p-3 border-r border-b border-slate-200 w-[200px]">Tên hàng</th>
                    <th rowSpan={2} className="p-3 border-r border-b border-slate-200 text-center w-[60px]">ĐVT</th>
                    <th colSpan={2} className="p-2 border-r border-b border-slate-200 text-center bg-blue-50 text-blue-800">Đầu kỳ</th>
                    <th colSpan={2} className="p-2 border-r border-b border-slate-200 text-center bg-orange-50 text-orange-800">Xuất kho</th>
                    <th colSpan={2} className="p-2 border-r border-b border-slate-200 text-center bg-emerald-50 text-emerald-800">Cuối kỳ</th>
                    <th rowSpan={2} className="p-3 border-b border-slate-200 text-center w-[100px]">Nhãn hàng</th>
                  </tr>
                  <tr className="bg-slate-50 text-[10px]">
                    <th className="p-2 border-r border-b border-slate-200 text-right">Số lượng</th>
                    <th className="p-2 border-r border-b border-slate-200 text-right">Giá trị</th>
                    <th className="p-2 border-r border-b border-slate-200 text-right">Số lượng</th>
                    <th className="p-2 border-r border-b border-slate-200 text-right">Giá trị</th>
                    <th className="p-2 border-r border-b border-slate-200 text-right">Số lượng</th>
                    <th className="p-2 border-b border-slate-200 text-right">Giá trị</th>
                  </tr>
                </thead>
                <tbody>
                  {rawDetailedInventory
                    .filter(item => {
                      if (!invDetailSearch) return true;
                      const q = invDetailSearch.toLowerCase();
                      return (item.tenKho || '').toLowerCase().includes(q) ||
                        (item.maHang || '').toLowerCase().includes(q) ||
                        (item.tenHang || '').toLowerCase().includes(q);
                    })
                    .map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
                        <td className="p-3 border-r border-slate-100 text-xs text-slate-600">{row.tenKho}</td>
                        <td className="p-3 border-r border-slate-100 text-xs text-slate-500 font-mono text-center">{row.maKho}</td>
                        <td className="p-3 border-r border-slate-100 font-mono font-semibold text-slate-700">{row.maHang}</td>
                        <td className="p-3 border-r border-slate-100 text-xs font-medium text-slate-800 leading-snug">{row.tenHang}</td>
                        <td className="p-3 border-r border-slate-100 text-xs text-center text-slate-500">{row.dvt}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-medium text-slate-700 bg-blue-50/20">{row.dauKySL.toLocaleString()}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-semibold text-blue-700 bg-blue-50/20">{formatVND(row.dauKyGT)}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-medium text-slate-700 bg-orange-50/20">{row.xuatKhoSL.toLocaleString()}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-semibold text-orange-700 bg-orange-50/20">{formatVND(row.xuatKhoGT)}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-bold text-slate-800 bg-emerald-50/20">{row.cuoiKySL.toLocaleString()}</td>
                        <td className="p-3 border-r border-slate-100 text-right font-bold text-emerald-700 bg-emerald-50/20">{formatVND(row.cuoiKyGT)}</td>
                        <td className="p-3 text-center"><span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold whitespace-nowrap">{row.nhanHang}</span></td>
                      </tr>
                    ))}
                  {rawDetailedInventory.length === 0 && (
                    <tr><td colSpan={12} className="p-10 text-center text-slate-500 italic">Không có dữ liệu. Vui lòng tải lên file "Tổng tồn kho chi tiết".</td></tr>
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

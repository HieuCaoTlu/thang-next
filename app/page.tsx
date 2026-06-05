'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { uploadFile, checkForUpdate, getCached, setCached } from '../lib/cloudinaryCache';
import {
  parseActualData, parsePlanData, parseDetailedInventoryData, parseOverviewInventoryData,
  generateMockPlans, loadSheetJS, formatVND,
  MOCK_TASKS,
} from '../lib/dataUtils';

import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import FinanceTab from './components/FinanceTab';
import InventoryTab from './components/InventoryTab';
import TeamTab from './components/TeamTab';
import CustomTab from './components/CustomTab';
import {
  ConfirmModal, ReportModal, ShareModal, OpenCodeModal, CustomGroupModal,
} from './components/Modals';

// ============================================================
// TYPES
// ============================================================
type Tab = 'finance' | 'inventory' | 'team' | 'custom' | 'admin';
type TeamTab = 'finance_team' | 'task_overview' | 'task_management';
type InventorySubTab = 'overview' | 'detailed';

interface User { role: string; }
interface CustomGroup {
  id: string; name: string; members: string[];
  target?: number; productTargets?: Record<string, number>;
}

// ============================================================
// SHARE CODE STORE (in-memory — survives page refresh via sessionStorage)
// ============================================================
const SHARE_STORE_KEY = 'dashboardShareStore';
function getShareStore(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(SHARE_STORE_KEY) || '{}'); } catch { return {}; }
}
function setShareStore(store: Record<string, string>) {
  sessionStorage.setItem(SHARE_STORE_KEY, JSON.stringify(store));
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<Tab>('finance');
  const [activeTeamTab, setActiveTeamTab] = useState<TeamTab>('finance_team');
  const [inventorySubTab, setInventorySubTab] = useState<InventorySubTab>('overview');

  // Processing / errors
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Finance data
  const [rawPlans, setRawPlans] = useState<any[]>(() => generateMockPlans());
  const [rawActuals, setRawActuals] = useState<any[]>([]);
  const [uploadedActual, setUploadedActual] = useState<string | null>(null);
  const [uploadedPlan, setUploadedPlan] = useState<string | null>(null);

  // Finance filters
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState<'doanhSo' | 'dthu'>('dthu');
  const [chartGranularity, setChartGranularity] = useState('month');
  const [progressPeriodMode, setProgressPeriodMode] = useState<'month' | 'quarter' | 'year'>('year');

  // Inventory data
  const [rawOverviewInventory, setRawOverviewInventory] = useState<any[]>([]);
  const [rawDetailedInventory, setRawDetailedInventory] = useState<any[]>([]);
  const [uploadedOverviewInventory, setUploadedOverviewInventory] = useState<string | null>(null);
  const [uploadedDetailedInventory, setUploadedDetailedInventory] = useState<string | null>(null);

  // Inventory filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryRegion, setInventoryRegion] = useState('All');
  const [inventoryBrand, setInventoryBrand] = useState('All');

  // Tasks
  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const [taskFilters, setTaskFilters] = useState({ empName: 'All', status: 'All', startDate: '', endDate: '' });
  const [newTask, setNewTask] = useState({ name: '', goal: '', empName: '', startDate: '', endDate: '', status: 'Bắt đầu triển khai', priority: 'Trung bình' });

  // Custom groups
  const [customGroups, setCustomGroups] = useState<CustomGroup[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>({ id: '', name: '', members: [], target: 0, productTargets: {} });
  const [newMemberInput, setNewMemberInput] = useState('');
  const [groupModalError, setGroupModalError] = useState('');

  // Modals
  const [confirmAction, setConfirmAction] = useState<any>({ isOpen: false });
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showOpenCodeModal, setShowOpenCodeModal] = useState(false);
  const [shareCodeInput, setShareCodeInput] = useState('');
  const [shareCodeError, setShareCodeError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // File input refs
  const actualFileInputRef = useRef<HTMLInputElement>(null);
  const planFileInputRef = useRef<HTMLInputElement>(null);
  const overviewInventoryRef = useRef<HTMLInputElement>(null);
  const detailedInventoryRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // INIT
  // ============================================================
  useEffect(() => {
    setIsMounted(true);

    // Restore session if previously logged in
    try {
      const saved = sessionStorage.getItem('dashboardUser');
      if (saved) setUser(JSON.parse(saved));
    } catch {}

    const loadFinanceType = async (type: 'actual' | 'plan') => {
      const cached = getCached(type);
      if (cached) {
        if (type === 'actual') { setRawActuals(cached.parsedData as any[]); setUploadedActual(cached.fileName); }
        else { setRawPlans(cached.parsedData as any[]); setUploadedPlan(cached.fileName); }
      }
      try {
        const update = await checkForUpdate(type);
        if (update) {
          const res = await fetch(update.url);
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const XLSX = await loadSheetJS();
          const wb = (XLSX as any).read(arrayBuffer, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          if (type === 'actual') {
            const data = (XLSX as any).utils.sheet_to_json(ws, { defval: '' });
            const parsed = parseActualData(data);
            setRawActuals(parsed);
            setCached('actual', { fileName: cached?.fileName ?? 'cloudinary', cloudinaryUrl: update.url, publicId: 'dashboard/actual', version: update.version, parsedData: parsed, uploadedAt: Date.now() });
            setUploadedActual(cached?.fileName ?? 'cloudinary');
          } else {
            const data = (XLSX as any).utils.sheet_to_json(ws, { header: 1, defval: '' });
            const parsed = parsePlanData(data);
            if (parsed.length > 0) {
              setRawPlans(parsed);
              setCached('plan', { fileName: cached?.fileName ?? 'cloudinary', cloudinaryUrl: update.url, publicId: 'dashboard/plan', version: update.version, parsedData: parsed, uploadedAt: Date.now() });
              setUploadedPlan(cached?.fileName ?? 'cloudinary');
            }
          }
        }
      } catch { /* ignore */ }
    };

    loadFinanceType('actual');
    loadFinanceType('plan');

    // Load cached inventory files + check Cloudinary for updates
    const loadInventoryType = async (type: 'inventory_overview' | 'inventory_detailed') => {
      const cached = getCached(type);
      if (cached) {
        if (type === 'inventory_overview') { setRawOverviewInventory(cached.parsedData as any[]); setUploadedOverviewInventory(cached.fileName); }
        else { setRawDetailedInventory(cached.parsedData as any[]); setUploadedDetailedInventory(cached.fileName); }
      }
      try {
        const update = await checkForUpdate(type);
        if (update) {
          const res = await fetch(update.url);
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const XLSX = await loadSheetJS();
          const wb = (XLSX as any).read(arrayBuffer, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          if (type === 'inventory_overview') {
            const data = (XLSX as any).utils.sheet_to_json(ws, { defval: '' });
            const parsed = parseOverviewInventoryData(data);
            setRawOverviewInventory(parsed);
            setCached(type, { fileName: cached?.fileName ?? 'cloudinary', cloudinaryUrl: update.url, publicId: 'dashboard/inventory_overview', version: update.version, parsedData: parsed, uploadedAt: Date.now() });
            setUploadedOverviewInventory(cached?.fileName ?? 'cloudinary');
          } else {
            const data = (XLSX as any).utils.sheet_to_json(ws, { header: 1, defval: '' });
            const parsed = parseDetailedInventoryData(data);
            setRawDetailedInventory(parsed);
            setCached(type, { fileName: cached?.fileName ?? 'cloudinary', cloudinaryUrl: update.url, publicId: 'dashboard/inventory_detailed', version: update.version, parsedData: parsed, uploadedAt: Date.now() });
            setUploadedDetailedInventory(cached?.fileName ?? 'cloudinary');
          }
        }
      } catch { /* ignore */ }
    };

    loadInventoryType('inventory_overview');
    loadInventoryType('inventory_detailed');

    const savedGroups = localStorage.getItem('customGroups');
    if (savedGroups) { try { setCustomGroups(JSON.parse(savedGroups)); } catch {} }
  }, []);

  // Persist custom groups
  useEffect(() => { localStorage.setItem('customGroups', JSON.stringify(customGroups)); }, [customGroups]);

  // ============================================================
  // COMPUTED: Finance
  // ============================================================
  const dynamicTeams = useMemo(() => {
    const s = new Set<string>();
    rawPlans.forEach(p => s.add(p.team));
    rawActuals.forEach(a => s.add(a.team));
    return Array.from(s).filter(t => t && !t.toLowerCase().includes('chưa phân nhóm') && t !== 'Unknown').sort();
  }, [rawPlans, rawActuals]);

  const filterByPeriod = useCallback((monthStr: string) => {
    if (selectedPeriod === 'All') return true;
    if (selectedPeriod.startsWith('Quý')) {
      const m = parseInt(monthStr.replace('Tháng ', ''));
      return `Quý ${Math.ceil(m / 3)}` === selectedPeriod;
    }
    return monthStr === selectedPeriod;
  }, [selectedPeriod]);

  const filteredPlans = useMemo(() => rawPlans.filter(p =>
    (selectedTeam === 'All' || p.team === selectedTeam) && filterByPeriod(p.month)
  ), [selectedTeam, selectedPeriod, rawPlans, filterByPeriod]);

  const filteredActuals = useMemo(() => rawActuals.filter(a =>
    (selectedTeam === 'All' || a.team === selectedTeam) && filterByPeriod(a.month)
  ), [selectedTeam, selectedPeriod, rawActuals, filterByPeriod]);

  const kpis = useMemo(() => {
    const totalDoanhSo = filteredActuals.reduce((s, i) => s + (i.doanhSoBan || 0), 0);
    const totalDthuChuaVAT = filteredActuals.reduce((s, i) => s + (i.revenueActual || 0), 0);
    const totalPlan = filteredPlans.reduce((s, i) => s + (i.planValue || 0), 0);
    const totalQty = filteredActuals.reduce((s, i) => s + (i.qtyActual || 0), 0);
    const percentAchieved = totalPlan > 0 ? ((totalDthuChuaVAT / totalPlan) * 100).toFixed(2) : '0.00';
    return { totalDoanhSo, totalDthuChuaVAT, totalPlan, percentAchieved, totalQty };
  }, [filteredActuals, filteredPlans]);

  const qtyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredActuals.forEach(a => { map[a.productGroup] = (map[a.productGroup] || 0) + (a.qtyActual || 0); });
    return Object.entries(map).filter(([, q]) => q > 0).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
  }, [filteredActuals]);

  const forecastData = useMemo(() => {
    const realToday = new Date();
    const today = new Date(2026, realToday.getMonth(), realToday.getDate());
    const reportYear = 2026;
    let targetMonth = -1, targetQuarter = -1;
    const isAll = selectedPeriod === 'All';
    if (selectedPeriod.startsWith('Tháng')) targetMonth = parseInt(selectedPeriod.replace('Tháng ', ''));
    else if (selectedPeriod.startsWith('Quý')) targetQuarter = parseInt(selectedPeriod.replace('Quý ', ''));
    const getDays = (m: number, y: number) => new Date(y, m, 0).getDate();

    let daysPassed = 0, totalDays = 0, isPast = false, isFuture = false;
    if (isAll) {
      totalDays = 365;
      if (today.getFullYear() > reportYear) isPast = true;
      else if (today.getFullYear() < reportYear) isFuture = true;
      else daysPassed = Math.floor((today.getTime() - new Date(reportYear, 0, 1).getTime()) / 86400000) + 1;
    } else if (targetMonth !== -1) {
      totalDays = getDays(targetMonth, reportYear);
      if (today.getFullYear() > reportYear || (today.getFullYear() === reportYear && today.getMonth() + 1 > targetMonth)) isPast = true;
      else if (today.getFullYear() < reportYear || (today.getFullYear() === reportYear && today.getMonth() + 1 < targetMonth)) isFuture = true;
      else daysPassed = today.getDate();
    } else if (targetQuarter !== -1) {
      const sm = (targetQuarter - 1) * 3 + 1;
      totalDays = getDays(sm, reportYear) + getDays(sm + 1, reportYear) + getDays(targetQuarter * 3, reportYear);
      const cq = Math.ceil((today.getMonth() + 1) / 3);
      if (today.getFullYear() > reportYear || (today.getFullYear() === reportYear && cq > targetQuarter)) isPast = true;
      else if (today.getFullYear() < reportYear || (today.getFullYear() === reportYear && cq < targetQuarter)) isFuture = true;
      else daysPassed = Math.floor((today.getTime() - new Date(reportYear, sm - 1, 1).getTime()) / 86400000) + 1;
    }

    const actual = filteredActuals.reduce((s, i) => s + (i.revenueActual || 0), 0);
    const plan = filteredPlans.reduce((s, i) => s + (i.planValue || 0), 0);
    let forecast = 0, method = '';
    if (isPast) { forecast = actual; method = 'Đã chốt kỳ'; }
    else if (isFuture) { forecast = plan; method = 'Bằng Kế hoạch'; }
    else if (daysPassed > 0) { forecast = (actual / daysPassed) * totalDays; method = `Run-rate (${daysPassed}/${totalDays} ngày)`; }
    const forecastPercent = plan > 0 ? (forecast / plan) * 100 : 0;
    return { forecast, method, forecastPercent };
  }, [filteredActuals, filteredPlans, selectedPeriod]);

  const productProgress = useMemo(() => {
    const map: Record<string, any> = {};
    filteredPlans.forEach(p => {
      if (!map[p.productGroup]) map[p.productGroup] = { name: p.productGroup, plan: 0, actual: 0, subItems: {} };
      map[p.productGroup].plan += p.planValue;
    });
    filteredActuals.forEach(a => {
      if (!map[a.productGroup]) map[a.productGroup] = { name: a.productGroup, plan: 0, actual: 0, subItems: {} };
      map[a.productGroup].actual += a.revenueActual;
      if (a.subProductGroup && a.subProductGroup.toUpperCase() !== a.productGroup.toUpperCase()) {
        map[a.productGroup].subItems[a.subProductGroup] = (map[a.productGroup].subItems[a.subProductGroup] || 0) + a.revenueActual;
      }
    });
    return Object.values(map).map(item => ({
      ...item,
      percent: item.plan > 0 ? (item.actual / item.plan) * 100 : 0,
      subItemsArray: Object.entries(item.subItems as Record<string, number>).map(([name, actual]) => ({ name, actual })).sort((a, b) => (b.actual as number) - (a.actual as number)),
    })).sort((a, b) => b.plan - a.plan);
  }, [filteredPlans, filteredActuals]);

  const chartData = useMemo(() => {
    const agg: Record<string, any> = {};
    filteredPlans.forEach(p => {
      let key = p.month;
      if (chartGranularity === 'quarter') key = `Quý ${Math.ceil(parseInt(p.month.replace('Tháng ', '')) / 3)}`;
      if (!agg[key]) agg[key] = { time: key, actual: 0, plan: 0 };
      agg[key].plan += p.planValue;
    });
    filteredActuals.forEach(a => {
      let key = a.month;
      if (chartGranularity === 'quarter') key = a.quarter;
      if (chartGranularity === 'day') key = a.date;
      if (!agg[key]) agg[key] = { time: key, actual: 0, plan: 0 };
      agg[key].actual += a.revenueActual;
    });

    const todayRr = new Date(2026, new Date().getMonth(), new Date().getDate());
    const cm = todayRr.getMonth() + 1;
    const cq = Math.ceil(cm / 3);

    return Object.values(agg).sort((a, b) => {
      if (a.time.includes('Tháng') && b.time.includes('Tháng'))
        return parseInt(a.time.replace('Tháng ', '')) - parseInt(b.time.replace('Tháng ', ''));
      return a.time.localeCompare(b.time);
    }).map(item => {
      let forecast = null;
      if (chartGranularity === 'month') {
        const m = parseInt(item.time.replace('Tháng ', ''));
        if (m === cm - 1) forecast = item.actual;
        else if (m === cm) { const td = new Date(2026, m, 0).getDate(); forecast = todayRr.getDate() > 0 ? (item.actual / todayRr.getDate()) * td : 0; }
        else if (m > cm) forecast = item.plan;
      } else if (chartGranularity === 'quarter') {
        const q = parseInt(item.time.replace('Quý ', ''));
        if (q === cq - 1) forecast = item.actual;
        else if (q === cq) {
          const sm2 = (q - 1) * 3 + 1;
          const td = new Date(2026, sm2, 0).getDate() + new Date(2026, sm2 + 1, 0).getDate() + new Date(2026, sm2 + 2, 0).getDate();
          const dp = Math.floor((todayRr.getTime() - new Date(2026, sm2 - 1, 1).getTime()) / 86400000) + 1;
          forecast = dp > 0 ? (item.actual / dp) * td : 0;
        } else if (q > cq) forecast = item.plan;
      }
      return { ...item, forecast };
    });
  }, [filteredActuals, filteredPlans, chartGranularity]);

  const growthTableData = useMemo(() => {
    return chartData.map((item, idx) => {
      if (idx === 0) return { ...item, diffValue: 0, diffPercent: 0, hasPrev: false, prevActual: 0 };
      const prev = chartData[idx - 1];
      const diffValue = item.actual - prev.actual;
      return { ...item, diffValue, diffPercent: prev.actual > 0 ? (diffValue / prev.actual) * 100 : 0, prevActual: prev.actual, hasPrev: true };
    }).filter(i => i.actual > 0 || i.plan > 0);
  }, [chartData]);

  const periodLabel = selectedPeriod === 'All' ? 'Năm' : selectedPeriod;

  const teamFinanceStats = useMemo(() => {
    return dynamicTeams.map(team => {
      const teamActuals = rawActuals.filter(a => a.team === team && filterByPeriod(a.month));
      const teamPlans = rawPlans.filter(p => p.team === team && filterByPeriod(p.month));
      const totalDthu = teamActuals.reduce((s, a) => s + (a.revenueActual || 0), 0);
      const totalDoanhSo = teamActuals.reduce((s, a) => s + (a.doanhSoBan || 0), 0);
      const totalQty = teamActuals.reduce((s, a) => s + (a.qtyActual || 0), 0);
      const totalPlan = teamPlans.reduce((s, p) => s + (p.planValue || 0), 0);
      const percent = totalPlan > 0 ? (totalDthu / totalPlan) * 100 : 0;

      const prodMap: Record<string, any> = {};
      teamPlans.forEach(p => {
        if (!prodMap[p.productGroup]) prodMap[p.productGroup] = { name: p.productGroup, plan: 0, actual: 0 };
        prodMap[p.productGroup].plan += p.planValue;
      });
      teamActuals.forEach(a => {
        if (!prodMap[a.productGroup]) prodMap[a.productGroup] = { name: a.productGroup, plan: 0, actual: 0 };
        prodMap[a.productGroup].actual += a.revenueActual;
      });
      const planByProduct = Object.values(prodMap).filter(p => p.plan > 0 || p.actual > 0).map(p => ({ ...p, percent: p.plan > 0 ? (p.actual / p.plan) * 100 : 0 })).sort((a, b) => b.plan - a.plan);

      const memberMap: Record<string, any> = {};
      teamActuals.forEach(a => {
        if (!memberMap[a.team]) memberMap[a.team] = { name: a.team, dthu: 0, doanhSo: 0, qty: 0 };
        memberMap[a.team].dthu += a.revenueActual || 0;
        memberMap[a.team].doanhSo += a.doanhSoBan || 0;
        memberMap[a.team].qty += a.qtyActual || 0;
      });
      const members = Object.values(memberMap);

      return { name: team, totalDthu, totalDoanhSo, totalQty, totalPlan, percent, planByProduct, members };
    });
  }, [dynamicTeams, rawActuals, rawPlans, filterByPeriod]);

  // ============================================================
  // COMPUTED: Inventory
  // ============================================================
  const inventoryRegions = useMemo(() => Array.from(new Set(rawOverviewInventory.map((i: any) => i.region).filter(Boolean))).sort() as string[], [rawOverviewInventory]);
  const inventoryBrands = useMemo(() => Array.from(new Set(rawOverviewInventory.map((i: any) => i.brand).filter(Boolean))).sort() as string[], [rawOverviewInventory]);

  const inventoryDataProcessed = useMemo(() => {
    const filtered = rawOverviewInventory.filter((item: any) => {
      const matchSearch = !inventorySearch || item.productName?.toLowerCase().includes(inventorySearch.toLowerCase()) || item.brand?.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchRegion = inventoryRegion === 'All' || item.region === inventoryRegion;
      const matchBrand = inventoryBrand === 'All' || item.brand === inventoryBrand;
      return matchSearch && matchRegion && matchBrand;
    });
    const totalQty = filtered.reduce((s: number, i: any) => s + (i.totalQty || 0), 0);
    const regionMap: Record<string, number> = {};
    const brandMap: Record<string, number> = {};
    filtered.forEach((i: any) => {
      if (i.region) regionMap[i.region] = (regionMap[i.region] || 0) + (i.totalQty || 0);
      if (i.brand) brandMap[i.brand] = (brandMap[i.brand] || 0) + (i.totalQty || 0);
    });
    const byRegion = Object.entries(regionMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const byBrand = Object.entries(brandMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    return { totalQty, products: filtered, byRegion, byBrand };
  }, [rawOverviewInventory, inventorySearch, inventoryRegion, inventoryBrand]);

  const filteredDetailedInventory = useMemo(() => {
    if (!inventorySearch) return rawDetailedInventory;
    return rawDetailedInventory.filter((i: any) =>
      i.productName?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      i.brand?.toLowerCase().includes(inventorySearch.toLowerCase())
    );
  }, [rawDetailedInventory, inventorySearch]);

  // ============================================================
  // COMPUTED: Custom Groups
  // ============================================================
  const customGroupStats = useMemo(() => {
    return customGroups.map(group => {
      const memberActuals = rawActuals.filter(a =>
        group.members.includes(a.team) && filterByPeriod(a.month)
      );
      const actualDoanhSo = memberActuals.reduce((s, a) => s + (a.doanhSoBan || 0), 0);
      const actualDthu = memberActuals.reduce((s, a) => s + (a.revenueActual || 0), 0);
      const actualQty = memberActuals.reduce((s, a) => s + (a.qtyActual || 0), 0);

      const targets = group.productTargets || {};
      const hasProductTargets = Object.keys(targets).length > 0;
      const calculatedTarget = group.target || (hasProductTargets ? Object.values(targets).reduce((s, v) => s + v, 0) : 0);

      const percent = calculatedTarget > 0 ? (actualDoanhSo / calculatedTarget) * 100 : 0;

      const productMap: Record<string, any> = {};
      Object.entries(targets).forEach(([name, target]) => {
        productMap[name] = { name, target, doanhSo: 0, dthu: 0, qty: 0 };
      });
      memberActuals.forEach(a => {
        const cat = a.productGroup;
        let key = Object.keys(targets).find(k => k === cat || (k === 'Các sản phẩm còn lại' && !Object.keys(targets).includes(cat)));
        if (!key && hasProductTargets) key = 'Các sản phẩm còn lại';
        if (key && productMap[key]) {
          productMap[key].doanhSo += a.doanhSoBan || 0;
          productMap[key].dthu += a.revenueActual || 0;
          productMap[key].qty += a.qtyActual || 0;
        }
      });
      const productList = Object.values(productMap);

      const memberMap: Record<string, any> = {};
      group.members.forEach(m => { memberMap[m] = { name: m, doanhSo: 0, dthu: 0, qty: 0 }; });
      memberActuals.forEach(a => {
        if (memberMap[a.team]) {
          memberMap[a.team].doanhSo += a.doanhSoBan || 0;
          memberMap[a.team].dthu += a.revenueActual || 0;
          memberMap[a.team].qty += a.qtyActual || 0;
        }
      });
      const memberList = Object.values(memberMap);

      return { ...group, actualDoanhSo, actualDthu, actualQty, calculatedTarget, percent, productList, memberList };
    });
  }, [customGroups, rawActuals, filterByPeriod]);

  // ============================================================
  // HANDLERS: File upload
  // ============================================================
  const handleActualFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsProcessing(true); setUploadError(null); setUploadedActual(file.name);
    try {
      const { url: cloudinaryUrl, publicId } = await uploadFile(file, 'actual');
      const XLSX = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = (XLSX as any).read((evt.target as FileReader).result, { type: 'binary' });
          const data = (XLSX as any).utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
          const parsed = parseActualData(data);
          setRawActuals(parsed);
          setCached('actual', { fileName: file.name, cloudinaryUrl, publicId, version: Math.floor(Date.now() / 1000), parsedData: parsed, uploadedAt: Date.now() });
        } catch (err) { setUploadError(err instanceof Error ? err.message : 'Lỗi parse'); }
        finally { setIsProcessing(false); if (actualFileInputRef.current) actualFileInputRef.current.value = ''; }
      };
      reader.readAsBinaryString(file);
    } catch (err) { setUploadError(err instanceof Error ? err.message : 'Lỗi upload'); setIsProcessing(false); }
  };

  const handlePlanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsProcessing(true); setUploadError(null); setUploadedPlan(file.name);
    try {
      const { url: cloudinaryUrl, publicId } = await uploadFile(file, 'plan');
      const XLSX = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = (XLSX as any).read((evt.target as FileReader).result, { type: 'binary' });
        const data = (XLSX as any).utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
        const parsed = parsePlanData(data);
        if (parsed.length > 0) {
          setRawPlans(parsed);
          setCached('plan', { fileName: file.name, cloudinaryUrl, publicId, version: Math.floor(Date.now() / 1000), parsedData: parsed, uploadedAt: Date.now() });
        }
        setIsProcessing(false);
        if (planFileInputRef.current) planFileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (err) { setUploadError(err instanceof Error ? err.message : 'Lỗi upload'); setIsProcessing(false); }
  };

  const handleOverviewInventoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsProcessing(true); setUploadedOverviewInventory(file.name);
    try {
      const { url: cloudinaryUrl, publicId } = await uploadFile(file, 'inventory_overview');
      const XLSX = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = (XLSX as any).read((evt.target as FileReader).result, { type: 'binary' });
        const data = (XLSX as any).utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
        const parsed = parseOverviewInventoryData(data);
        setRawOverviewInventory(parsed);
        setCached('inventory_overview', { fileName: file.name, cloudinaryUrl, publicId, version: Math.floor(Date.now() / 1000), parsedData: parsed, uploadedAt: Date.now() });
        setIsProcessing(false);
        if (overviewInventoryRef.current) overviewInventoryRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (err) { setUploadError(err instanceof Error ? err.message : 'Lỗi upload'); setIsProcessing(false); }
  };

  const handleDetailedInventoryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsProcessing(true); setUploadedDetailedInventory(file.name);
    try {
      const { url: cloudinaryUrl, publicId } = await uploadFile(file, 'inventory_detailed');
      const XLSX = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = (XLSX as any).read((evt.target as FileReader).result, { type: 'binary' });
        const data = (XLSX as any).utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
        const parsed = parseDetailedInventoryData(data);
        setRawDetailedInventory(parsed);
        setCached('inventory_detailed', { fileName: file.name, cloudinaryUrl, publicId, version: Math.floor(Date.now() / 1000), parsedData: parsed, uploadedAt: Date.now() });
        setIsProcessing(false);
        if (detailedInventoryRef.current) detailedInventoryRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (err) { setUploadError(err instanceof Error ? err.message : 'Lỗi upload'); setIsProcessing(false); }
  };

  // ============================================================
  // HANDLERS: Tasks
  // ============================================================
  const handleAddTask = () => {
    if (!newTask.name.trim() || !newTask.empName.trim()) return;
    const id = `DA${String(tasks.length + 1).padStart(3, '0')}`;
    setTasks(prev => [...prev, { ...newTask, id, empId: `NV${String(tasks.length + 1).padStart(2, '0')}` }]);
    setNewTask({ name: '', goal: '', empName: '', startDate: '', endDate: '', status: 'Bắt đầu triển khai', priority: 'Trung bình' });
  };

  const handleDeleteTask = (id: string) => {
    setConfirmAction({
      isOpen: true, type: 'danger',
      title: 'Xóa nhiệm vụ?', message: 'Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      onConfirm: () => { setTasks(prev => prev.filter(t => t.id !== id)); setConfirmAction({ isOpen: false }); },
    });
  };

  // ============================================================
  // HANDLERS: Custom Groups
  // ============================================================
  const handleOpenCreateGroup = () => {
    setEditingGroup({ id: '', name: '', members: [], target: 0, productTargets: {} });
    setNewMemberInput(''); setGroupModalError('');
    setShowGroupModal(true);
  };

  const handleOpenEditGroup = (group: any) => {
    setEditingGroup({ ...group, productTargets: group.productTargets || {} });
    setNewMemberInput(''); setGroupModalError('');
    setShowGroupModal(true);
  };

  const handleSaveGroup = () => {
    if (!editingGroup.name.trim()) { setGroupModalError('Tên nhóm không được để trống!'); return; }
    if (editingGroup.members.length === 0) { setGroupModalError('Nhóm phải có ít nhất 1 thành viên!'); return; }
    if (editingGroup.id) {
      setCustomGroups(prev => prev.map(g => g.id === editingGroup.id ? editingGroup : g));
    } else {
      setCustomGroups(prev => [...prev, { ...editingGroup, id: `CG${Date.now()}` }]);
    }
    setShowGroupModal(false);
  };

  const handleDeleteGroup = () => {
    setConfirmAction({
      isOpen: true, type: 'danger',
      title: 'Xóa nhóm?', message: `Xóa nhóm "${editingGroup.name}"?`,
      confirmText: 'Xóa nhóm',
      onConfirm: () => {
        setCustomGroups(prev => prev.filter(g => g.id !== editingGroup.id));
        setShowGroupModal(false);
        setConfirmAction({ isOpen: false });
      },
    });
  };

  const handleAddMember = () => {
    const name = newMemberInput.trim();
    if (!name || editingGroup.members.includes(name)) return;
    setEditingGroup((prev: any) => ({ ...prev, members: [...prev.members, name] }));
    setNewMemberInput('');
  };

  const handleRemoveMember = (name: string) => {
    setEditingGroup((prev: any) => ({ ...prev, members: prev.members.filter((m: string) => m !== name) }));
  };

  // ============================================================
  // HANDLERS: Share / Report
  // ============================================================
  const generateReportText = useCallback(() => {
    const lines = [
      `=== BÁO CÁO KINH DOANH ===`,
      `Kỳ: ${periodLabel} | Nhóm: ${selectedTeam === 'All' ? 'Toàn công ty' : selectedTeam}`,
      `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
      ``,
      `--- TỔNG QUAN ---`,
      `Doanh thu thực tế (chưa VAT): ${formatVND(kpis.totalDthuChuaVAT)} VNĐ`,
      `Doanh số bán: ${formatVND(kpis.totalDoanhSo)} VNĐ`,
      `Kế hoạch: ${formatVND(kpis.totalPlan)} VNĐ`,
      `Tiến độ: ${kpis.percentAchieved}%`,
      `Dự phóng: ${formatVND(forecastData.forecast)} VNĐ (${forecastData.method})`,
      ``,
      `--- TIẾN ĐỘ THEO MẶT HÀNG ---`,
      ...productProgress.map(p => `${p.name}: ${formatVND(p.actual)} / ${formatVND(p.plan)} (${p.percent.toFixed(1)}%)`),
    ];
    return lines.join('\n');
  }, [kpis, forecastData, productProgress, periodLabel, selectedTeam]);

  const handleGenerateReport = () => {
    setGeneratedReport(generateReportText());
    setShowReportModal(true);
    setIsCopied(false);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generatedReport).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); });
  };

  const handleShareCode = () => {
    const payload = JSON.stringify({
      plans: rawPlans.slice(0, 500),
      actuals: rawActuals.slice(0, 500),
      team: selectedTeam,
      period: selectedPeriod,
    });
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const store = getShareStore();
    store[code] = payload;
    setShareStore(store);
    setGeneratedCode(code);
    setShowShareModal(true);
    setIsCopied(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode).then(() => { setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); });
  };

  const handleLoadByCode = (code: string) => {
    const store = getShareStore();
    const payload = store[code.trim().toUpperCase()];
    if (!payload) { setShareCodeError('Mã không hợp lệ hoặc đã hết hạn.'); return; }
    try {
      const { plans, actuals, team, period } = JSON.parse(payload);
      setRawPlans(plans || []);
      setRawActuals(actuals || []);
      setSelectedTeam(team || 'All');
      setSelectedPeriod(period || 'All');
      setIsViewOnly(true);
      setUser({ role: 'viewer' });
      setShowOpenCodeModal(false);
      setShareCodeInput('');
      setShareCodeError('');
    } catch { setShareCodeError('Dữ liệu bị lỗi, không thể tải.'); }
  };

  // ============================================================
  // AUTH
  // ============================================================
  if (!user) {
    return (
      <>
        <LoginScreen onLogin={setUser} />
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowOpenCodeModal(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg px-4 py-2.5 rounded-full text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            🔑 Mở bằng Mã
          </button>
        </div>
        <OpenCodeModal
          isOpen={showOpenCodeModal} onClose={() => setShowOpenCodeModal(false)}
          codeInput={shareCodeInput} setCodeInput={setShareCodeInput}
          codeError={shareCodeError} isProcessing={false}
          onLoad={handleLoadByCode}
        />
      </>
    );
  }

  // ============================================================
  // MAIN LAYOUT
  // ============================================================
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Hidden file inputs */}
      <input type="file" ref={actualFileInputRef} onChange={handleActualFile} accept=".xlsx,.xls,.csv" className="hidden" />
      <input type="file" ref={planFileInputRef} onChange={handlePlanFile} accept=".xlsx,.xls,.csv" className="hidden" />
      <input type="file" ref={overviewInventoryRef} onChange={handleOverviewInventoryFile} accept=".xlsx,.xls,.csv" className="hidden" />
      <input type="file" ref={detailedInventoryRef} onChange={handleDetailedInventoryFile} accept=".xlsx,.xls,.csv" className="hidden" />

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(v) => setActiveTab(v as Tab)}
        setActiveTeamTab={(v) => setActiveTeamTab(v as TeamTab)}
        isViewOnly={isViewOnly}
        onLogout={() => { sessionStorage.removeItem('dashboardUser'); setUser(null); setIsViewOnly(false); }}
        onExitViewOnly={() => { setIsViewOnly(false); setUser(null); }}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-screen-2xl mx-auto">
          {activeTab === 'finance' && (
            <FinanceTab
              kpis={kpis}
              forecastData={forecastData}
              productProgress={productProgress}
              chartData={chartData}
              growthTableData={growthTableData}
              forecastChartData={[
                { name: 'Thực tế', value: kpis.totalDthuChuaVAT, fill: '#3b82f6' },
                { name: 'Dự phóng', value: forecastData.forecast, fill: '#8b5cf6' },
                { name: 'Kế hoạch', value: kpis.totalPlan, fill: '#94a3b8' },
              ]}
              qtyBreakdown={qtyBreakdown}
              totalActual={kpis.totalDthuChuaVAT}
              actualVsPlanValue={kpis.totalDthuChuaVAT - kpis.totalPlan}
              actualVsPlanPercent={kpis.totalPlan > 0 ? ((kpis.totalDthuChuaVAT - kpis.totalPlan) / kpis.totalPlan) * 100 : 0}
              forecastVsPlanValue={forecastData.forecast - kpis.totalPlan}
              forecastVsPlanPercent={kpis.totalPlan > 0 ? ((forecastData.forecast - kpis.totalPlan) / kpis.totalPlan) * 100 : 0}
              dynamicTeams={dynamicTeams}
              selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
              selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod}
              chartGranularity={chartGranularity} setChartGranularity={setChartGranularity}
              financeMetric={selectedMetric} setFinanceMetric={(v) => setSelectedMetric(v as 'doanhSo' | 'dthu')}
              progressPeriodMode={progressPeriodMode} setProgressPeriodMode={(v) => setProgressPeriodMode(v as 'month' | 'quarter' | 'year')}
              periodLabel={periodLabel}
              growthPeriodLabel={chartGranularity === 'day' ? 'ngày' : chartGranularity === 'month' ? 'tháng' : 'quý'}
              currentMonthNum={new Date().getMonth() + 1}
              isProcessing={isProcessing}
              uploadedActual={uploadedActual}
              uploadedPlan={uploadedPlan}
              uploadError={uploadError}
              actualFileInputRef={actualFileInputRef}
              planFileInputRef={planFileInputRef}
              handleActualFileChange={handleActualFile}
              handlePlanFileChange={handlePlanFile}
              onOpenReport={handleGenerateReport}
              onOpenShare={handleShareCode}
              onOpenCode={() => setShowOpenCodeModal(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              activeInventoryTab={inventorySubTab}
              setActiveInventoryTab={(v) => setInventorySubTab(v as InventorySubTab)}
              invSearch={inventorySearch} setInvSearch={setInventorySearch}
              invRegionFilter={inventoryRegion} setInvRegionFilter={setInventoryRegion}
              invBrandFilter={inventoryBrand} setInvBrandFilter={setInventoryBrand}
              invDynamicRegions={inventoryRegions}
              invDynamicBrands={inventoryBrands}
              inventoryDataProcessed={inventoryDataProcessed}
              rawDetailedInventory={filteredDetailedInventory}
              invDetailSearch={inventorySearch} setInvDetailSearch={setInventorySearch}
              isProcessing={isProcessing}
              inventoryFileInputRef={overviewInventoryRef}
              detailedInventoryFileInputRef={detailedInventoryRef}
              handleInventoryFileChange={handleOverviewInventoryFile}
              handleDetailedInventoryFileChange={handleDetailedInventoryFile}
            />
          )}

          {activeTab === 'team' && (
            <TeamTab
              activeTeamTab={activeTeamTab}
              setActiveTeamTab={(v) => setActiveTeamTab(v as TeamTab)}
              teamAggregations={teamFinanceStats}
              tasks={tasks}
              filteredTasks={tasks.filter(t => {
                return (taskFilters.empName === 'All' || t.empName === taskFilters.empName) &&
                  (taskFilters.status === 'All' || t.status === taskFilters.status) &&
                  (!taskFilters.startDate || t.endDate >= taskFilters.startDate) &&
                  (!taskFilters.endDate || t.startDate <= taskFilters.endDate);
              })}
              taskKPIs={(() => {
                const filtered = tasks.filter(t =>
                  (taskFilters.empName === 'All' || t.empName === taskFilters.empName) &&
                  (taskFilters.status === 'All' || t.status === taskFilters.status) &&
                  (!taskFilters.startDate || t.endDate >= taskFilters.startDate) &&
                  (!taskFilters.endDate || t.startDate <= taskFilters.endDate)
                );
                const today = new Date().toISOString().split('T')[0];
                const sevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                const overdueList = filtered.filter(t => t.endDate < today && t.status !== 'Đã hoàn thành' && t.status !== 'Hủy');
                const upcomingList = filtered.filter(t => t.endDate >= today && t.endDate <= sevenDays && t.status !== 'Đã hoàn thành' && t.status !== 'Hủy');
                return {
                  total: filtered.length,
                  completed: filtered.filter(t => t.status === 'Đã hoàn thành' || t.status === 'Hủy').length,
                  inProgress: filtered.filter(t => t.status === 'Đang chạy' || t.status === 'Bắt đầu triển khai').length,
                  overdue: overdueList.length,
                  overdueList,
                  upcomingList,
                  statusChartData: Object.entries(
                    filtered.reduce((acc: Record<string, number>, t: any) => {
                      acc[t.status] = (acc[t.status] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([name, value]) => ({ name, value })),
                };
              })()}
              taskFilters={taskFilters}
              setTaskFilters={setTaskFilters}
              dynamicEmployees={Array.from(new Set(tasks.map(t => t.empName))).sort()}
              newTask={newTask}
              setNewTask={setNewTask}
              handleTaskSubmit={(e) => { e.preventDefault(); handleAddTask(); }}
              handleDeleteTaskConfirm={handleDeleteTask}
            />
          )}

          {activeTab === 'custom' && (
            <CustomTab
              customGroups={customGroups}
              customGroupStats={customGroupStats}
              selectedTeam={selectedTeam}
              selectedPeriod={selectedPeriod}
              periodLabel={periodLabel}
              onCreateGroup={handleOpenCreateGroup}
              onEditGroup={handleOpenEditGroup}
            />
          )}

          {activeTab === 'admin' && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quản trị hệ thống</h2>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-600">
                <p className="font-semibold mb-2">Thông tin tài khoản:</p>
                <p>Tài khoản: <strong>admin</strong></p>
                <p>Vai trò: <strong>Quản trị viên</strong></p>
                <p className="mt-3 text-slate-500 text-xs">Hệ thống sử dụng tài khoản admin mặc định. Không có quản lý người dùng động.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <ConfirmModal confirmAction={confirmAction} setConfirmAction={setConfirmAction} />
      <ReportModal
        isOpen={showReportModal} onClose={() => setShowReportModal(false)}
        report={generatedReport} isCopied={isCopied} onCopy={handleCopyReport}
      />
      <ShareModal
        isOpen={showShareModal} onClose={() => setShowShareModal(false)}
        code={generatedCode} isCopied={isCopied} onCopy={handleCopyCode}
      />
      <OpenCodeModal
        isOpen={showOpenCodeModal} onClose={() => { setShowOpenCodeModal(false); setShareCodeError(''); }}
        codeInput={shareCodeInput} setCodeInput={setShareCodeInput}
        codeError={shareCodeError} isProcessing={false}
        onLoad={handleLoadByCode}
      />
      {showGroupModal && (
        <CustomGroupModal
          isOpen={showGroupModal} onClose={() => setShowGroupModal(false)}
          editingGroup={editingGroup} setEditingGroup={setEditingGroup}
          newMemberInput={newMemberInput} setNewMemberInput={setNewMemberInput}
          groupModalError={groupModalError}
          onSave={handleSaveGroup} onDelete={handleDeleteGroup}
          onAddMember={handleAddMember} onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
}

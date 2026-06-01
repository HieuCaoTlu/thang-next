'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { uploadFile, checkForUpdate, getCached, setCached } from '../lib/cloudinaryCache';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
  PieChart, Pie, Cell, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, DollarSign,
  Package, UploadCloud, Filter,
  CheckCircle2, Clock, Loader2,
  ChevronDown, ChevronUp, Minus
} from 'lucide-react';

// --- INITIAL DATA & MOCK FALLBACKS ---
const fallbackTeams = ['Nguyễn Huyền My', 'Nguyễn Thị Nhàn', 'Lê Quân'];
const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const periodOptions = [
  { value: 'All', label: '📅 Toàn Năm 2026' },
  { value: 'Quý 1', label: '📊 Quý 1 (T1-T3)' },
  { value: 'Quý 2', label: '📊 Quý 2 (T4-T6)' },
  { value: 'Quý 3', label: '📊 Quý 3 (T7-T9)' },
  { value: 'Quý 4', label: '📊 Quý 4 (T10-T12)' },
  ...months.map(m => ({ value: m, label: `🗓️ ${m}` }))
];

const TEAM_YEARLY_PLANS: Record<string, Record<string, number>> = {
  'Nguyễn Huyền My': { 'Bàn phím': 7500000000, 'Màn hình': 21200000000, 'Phụ Kiện': 2000000000, 'Case': 4000000000 },
  'Nguyễn Thị Nhàn': { 'Bàn phím': 8500000000, 'Màn hình': 47600000000, 'Phụ Kiện': 10000000000 },
  'Lê Quân': { 'Dầu khí': 31700000000, 'UNV': 11500000000, 'GREATWALL': 20000000000 }
};

const monthWeights = [0.06, 0.06, 0.07, 0.08, 0.08, 0.08, 0.09, 0.09, 0.09, 0.1, 0.1, 0.1];

const generateMockPlans = () => {
  const plans: any[] = [];
  fallbackTeams.forEach(team => {
    const teamPlans = TEAM_YEARLY_PLANS[team];
    if (teamPlans) {
      Object.keys(teamPlans).forEach(product => {
        const yearlyValue = teamPlans[product];
        months.forEach((month, idx) => {
          plans.push({ team, productGroup: product, month, planValue: yearlyValue * monthWeights[idx] });
        });
      });
    }
  });
  return plans;
};

const formatVND = (value: any) => {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#d946ef', '#f97316', '#64748b', '#84cc16', '#14b8a6', '#f43f5e', '#6366f1', '#ec4899', '#0ea5e9', '#eab308'];

export default function App() {
  const [chartGranularity, setChartGranularity] = useState('month');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [isProcessing, setIsProcessing] = useState(false);

  const [rawPlans, setRawPlans] = useState<any[]>(generateMockPlans());
  const [rawActuals, setRawActuals] = useState<any[]>([]);

  const actualFileInputRef = useRef<HTMLInputElement>(null);
  const planFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedActual, setUploadedActual] = useState<string | null>(null);
  const [uploadedPlan, setUploadedPlan] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Load cached data on mount + check Cloudinary for newer versions
  useEffect(() => {
    setIsMounted(true);

    const loadType = async (type: 'actual' | 'plan') => {
      const cached = getCached(type);
      if (cached) {
        if (type === 'actual') {
          setRawActuals(cached.parsedData as any[]);
          setUploadedActual(cached.fileName);
        } else {
          setRawPlans(cached.parsedData as any[]);
          setUploadedPlan(cached.fileName);
        }
      }

      // Kiểm tra xem Cloudinary có file mới hơn cache không
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
            setCached('actual', {
              fileName: cached?.fileName ?? 'cloudinary',
              cloudinaryUrl: update.url,
              publicId: 'dashboard/actual',
              version: update.version,
              parsedData: parsed,
              uploadedAt: Date.now(),
            });
            setUploadedActual(cached?.fileName ?? 'cloudinary');
          } else {
            const data = (XLSX as any).utils.sheet_to_json(ws, { header: 1, defval: '' });
            const parsed = parsePlanData(data);
            if (parsed.length > 0) {
              setRawPlans(parsed);
              setCached('plan', {
                fileName: cached?.fileName ?? 'cloudinary',
                cloudinaryUrl: update.url,
                publicId: 'dashboard/plan',
                version: update.version,
                parsedData: parsed,
                uploadedAt: Date.now(),
              });
              setUploadedPlan(cached?.fileName ?? 'cloudinary');
            }
          }
        }
      } catch {
        // Bỏ qua lỗi checkForUpdate — không ảnh hưởng trải nghiệm
      }
    };

    loadType('actual');
    loadType('plan');
  }, []);

  const loadSheetJS = (): Promise<unknown> => {
    return new Promise((resolve) => {
      if ((window as any).XLSX) return resolve((window as any).XLSX);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.onload = () => resolve((window as any).XLSX);
      document.body.appendChild(script);
    });
  };

  const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val || val === '') return 0;
    let str = String(val).trim();
    if (str === '-') return 0;
    if (str.startsWith('(') && str.endsWith(')')) str = '-' + str.slice(1, -1);
    str = str.replace(/\s/g, '');
    if (str.includes(',') && str.includes('.')) {
      const lastComma = str.lastIndexOf(',');
      const lastDot = str.lastIndexOf('.');
      if (lastDot > lastComma) str = str.replace(/,/g, '');
      else str = str.replace(/\./g, '').replace(',', '.');
    } else {
      if ((str.match(/\./g) || []).length > 1) str = str.replace(/\./g, '');
      else if ((str.match(/,/g) || []).length > 1) str = str.replace(/,/g, '');
      else {
        if (/\.\d{3}$/.test(str)) str = str.replace(/\./g, '');
        else if (/,\d{3}$/.test(str)) str = str.replace(/,/g, '');
        else str = str.replace(',', '.');
      }
    }
    const num = Number(str);
    return isNaN(num) ? 0 : num;
  };

  const parseActualData = (data: any[]): any[] => {
    const parsedActuals: any[] = [];
    let currentActualMonth = 'Tháng 1';
    let currentActualTeam = 'Chưa phân nhóm';

    data.forEach((row) => {
      const isTotalRow = Object.values(row).some(v =>
        typeof v === 'string' && (v.toLowerCase().includes('tổng cộng') || v.toLowerCase() === 'cộng')
      );
      if (isTotalRow) return;

      let doanhSo = 0;
      let dthuChuaVAT = 0;
      let teamRaw = '';
      let spRaw = '';
      let dateRaw: any = '';

      for (const key in row) {
        const k = key.toUpperCase();
        if (k.includes('DTHU CHƯA VAT') || k.includes('DOANH THU CHƯA VAT')) dthuChuaVAT = parseNum(row[key]);
        else if (k.includes('DOANH SỐ BÁN') || k.includes('DOANH SO BAN')) doanhSo = parseNum(row[key]);
        else if (k.includes('TRƯỞNG NHÓM') || k.includes('TÊN NHÂN VIÊN')) teamRaw = row[key];
        else if (k.includes('NHÓM SẢN PHẨM') || k.includes('MẶT HÀNG') || k.includes('SẢN PHẨM')) spRaw = row[key];
        else if (k.includes('NGÀY HẠCH TOÁN') || k.includes('NGÀY CHỨNG TỪ')) dateRaw = row[key];
      }

      if (doanhSo === 0 && dthuChuaVAT === 0) return;

      if (teamRaw && String(teamRaw).trim() !== '') {
        currentActualTeam = String(teamRaw).trim();
      }

      let explicitMonth: string | null = null;
      Object.values(row).forEach(val => {
        if (typeof val === 'string') {
          const match = val.trim().match(/^Tháng\s*0?(\d{1,2})$/i);
          if (match) explicitMonth = `Tháng ${parseInt(match[1])}`;
        }
      });

      if (explicitMonth) {
        currentActualMonth = explicitMonth;
      } else if (dateRaw) {
        if (typeof dateRaw === 'number') {
          const jsDate = new Date((dateRaw - 25569) * 86400 * 1000);
          currentActualMonth = `Tháng ${jsDate.getUTCMonth() + 1}`;
        } else if (typeof dateRaw === 'string') {
          const match = dateRaw.match(/(?:\/|-)(\d{1,2})(?:\/|-)/);
          if (match) currentActualMonth = `Tháng ${parseInt(match[1])}`;
        }
      }

      let spRawString = String(spRaw || 'Khác').trim();
      let sp = spRawString;
      const subSp = spRawString;

      if (sp.toUpperCase().startsWith('UNV')) sp = 'UNV';

      const monthNum = parseInt(currentActualMonth.replace('Tháng ', ''));
      const quarterVal = isNaN(monthNum) ? 1 : Math.ceil(monthNum / 3);

      parsedActuals.push({
        date: typeof dateRaw === 'string' ? dateRaw : new Date().toISOString().split('T')[0],
        month: currentActualMonth,
        quarter: `Quý ${quarterVal}`,
        team: currentActualTeam,
        productGroup: sp,
        subProductGroup: subSp,
        revenueActual: dthuChuaVAT,
        doanhSoBan: doanhSo,
        qtyActual: parseNum(row['Tổng số lượng bán'])
      });
    });

    return parsedActuals;
  };

  const parsePlanData = (data: any[][]): any[] => {
    const parsedPlans: any[] = [];
    let teamCol = -1;
    let productCol = -1;
    let monthCols: Record<string, number> = {};
    let headerRowIndex = -1;

    for (let i = 0; i < Math.min(data.length, 15); i++) {
      let tempMonthCols: Record<string, number> = {};
      let foundTeam = false;
      let foundProduct = false;

      data[i].forEach((val: any, idx: number) => {
        if (typeof val === 'string') {
          const str = val.toLowerCase().trim();
          if (str.includes('trưởng nhóm')) { teamCol = idx; foundTeam = true; }
          if (str.includes('sản phẩm') || str === 'nhóm sản phẩm' || str === 'mặt hàng') { productCol = idx; foundProduct = true; }
          const monthMatch = str.match(/(?:tháng|t)\s*0?(\d{1,2})(?:\.|\/|\s|$)/i);
          if (monthMatch) {
            const mNum = parseInt(monthMatch[1]);
            if (mNum >= 1 && mNum <= 12) tempMonthCols[`Tháng ${mNum}`] = idx;
          }
        }
      });

      if (foundTeam || foundProduct || Object.keys(tempMonthCols).length > 0) {
        headerRowIndex = Math.max(headerRowIndex, i);
        monthCols = { ...monthCols, ...tempMonthCols };
      }
    }

    if (teamCol === -1) teamCol = 0;
    if (productCol === -1) productCol = 1;
    if (Object.keys(monthCols).length === 0) {
      for (let m = 1; m <= 12; m++) monthCols[`Tháng ${m}`] = productCol + m;
    }

    const startRow = headerRowIndex !== -1 ? headerRowIndex + 1 : 1;
    let currentTeam = 'Chưa phân nhóm';

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      const rawTeam = String(row[teamCol] || '').trim();
      const product = String(row[productCol] || '').trim();

      if (rawTeam && !rawTeam.toLowerCase().includes('trưởng nhóm')) currentTeam = rawTeam;

      if (!product || product.toLowerCase().includes('sản phẩm')) continue;
      if (currentTeam.toLowerCase().startsWith('tổng') || product.toLowerCase().startsWith('tổng') || product.toLowerCase().startsWith('cộng')) continue;
      if (product.toUpperCase().startsWith('UNV-') || product.toUpperCase().startsWith('UNV -')) continue;

      Object.keys(monthCols).forEach(mName => {
        const num = parseNum(row[monthCols[mName]]);
        if (num !== 0) {
          parsedPlans.push({ team: currentTeam, productGroup: product, month: mName, planValue: num });
        }
      });
    }

    return parsedPlans;
  };

  const handleActualFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setUploadError(null);
    setUploadedActual(file.name);
    try {
      const { url: cloudinaryUrl, publicId } = await uploadFile(file, 'actual');
      const XLSX = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = (evt.target as FileReader).result;
          const wb = (XLSX as any).read(bstr, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = (XLSX as any).utils.sheet_to_json(ws, { defval: '' });
          const parsed = parseActualData(data);
          setRawActuals(parsed);
          // version dùng timestamp để checkForUpdate có thể so sánh
          const version = Math.floor(Date.now() / 1000);
          setCached('actual', { fileName: file.name, cloudinaryUrl, publicId, version, parsedData: parsed, uploadedAt: Date.now() });
        } catch (parseErr) {
          setUploadError(parseErr instanceof Error ? parseErr.message : 'Lỗi parse file');
        } finally {
          setIsProcessing(false);
          if (actualFileInputRef.current) actualFileInputRef.current.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Lỗi không xác định');
      setIsProcessing(false);
    }
  };

  const handlePlanFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setUploadError(null);
    setUploadedPlan(file.name);
    try {
      const { url: cloudinaryUrl, publicId } = await uploadFile(file, 'plan');
      const XLSX = await loadSheetJS();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = (evt.target as FileReader).result;
        const wb = (XLSX as any).read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = (XLSX as any).utils.sheet_to_json(ws, { header: 1, defval: '' });
        const parsed = parsePlanData(data);
        if (parsed.length > 0) {
          setRawPlans(parsed);
          const version = Math.floor(Date.now() / 1000);
          setCached('plan', { fileName: file.name, cloudinaryUrl, publicId, version, parsedData: parsed, uploadedAt: Date.now() });
        }
        setIsProcessing(false);
        if (planFileInputRef.current) planFileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Lỗi không xác định');
      setIsProcessing(false);
    }
  };

  const dynamicTeams = useMemo(() => {
    const teams = new Set<string>();
    rawPlans.forEach(p => teams.add(p.team));
    rawActuals.forEach(a => teams.add(a.team));
    return Array.from(teams).filter(t => t && t.toLowerCase() !== 'chưa phân nhóm' && t !== 'Unknown').sort();
  }, [rawPlans, rawActuals]);

  const filterByPeriod = (itemMonthStr: string) => {
    if (selectedPeriod === 'All') return true;
    if (selectedPeriod.startsWith('Quý')) {
      const mNum = parseInt(itemMonthStr.replace('Tháng ', ''));
      return `Quý ${Math.ceil(mNum / 3)}` === selectedPeriod;
    }
    return itemMonthStr === selectedPeriod;
  };

  const filteredPlans = useMemo(() => rawPlans.filter(p => {
    return (selectedTeam === 'All' || p.team === selectedTeam) && filterByPeriod(p.month);
  }), [selectedTeam, selectedPeriod, rawPlans]);

  const filteredActuals = useMemo(() => rawActuals.filter(a => {
    return (selectedTeam === 'All' || a.team === selectedTeam) && filterByPeriod(a.month);
  }), [selectedTeam, selectedPeriod, rawActuals]);

  const kpis = useMemo(() => {
    const totalDoanhSo = filteredActuals.reduce((sum, item) => sum + (item.doanhSoBan || 0), 0);
    const totalDthuChuaVAT = filteredActuals.reduce((sum, item) => sum + (item.revenueActual || 0), 0);
    const totalPlan = filteredPlans.reduce((sum, item) => sum + (item.planValue || 0), 0);
    const totalQty = filteredActuals.reduce((sum, item) => sum + (item.qtyActual || 0), 0);
    const percentAchieved = totalPlan > 0 ? ((totalDthuChuaVAT / totalPlan) * 100).toFixed(2) : 0;
    return { totalDoanhSo, totalDthuChuaVAT, totalPlan, percentAchieved, totalQty };
  }, [filteredActuals, filteredPlans]);

  const qtyBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredActuals.forEach(a => {
      if (!map[a.productGroup]) map[a.productGroup] = 0;
      map[a.productGroup] += (a.qtyActual || 0);
    });
    return Object.entries(map)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [filteredActuals]);

  const forecastData = useMemo(() => {
    let targetMonth = -1;
    let targetQuarter = -1;
    const isAll = selectedPeriod === 'All';

    if (selectedPeriod.startsWith('Tháng')) targetMonth = parseInt(selectedPeriod.replace('Tháng ', ''));
    else if (selectedPeriod.startsWith('Quý')) targetQuarter = parseInt(selectedPeriod.replace('Quý ', ''));

    const realToday = new Date();
    const today = new Date(2026, realToday.getMonth(), realToday.getDate());
    const reportYear = 2026;

    let daysPassed = 0;
    let totalDays = 0;
    let isPast = false;
    let isFuture = false;

    const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();

    if (isAll) {
      totalDays = 365;
      if (today.getFullYear() > reportYear) isPast = true;
      else if (today.getFullYear() < reportYear) isFuture = true;
      else {
        const startOfYear = new Date(reportYear, 0, 1);
        daysPassed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    } else if (targetMonth !== -1) {
      totalDays = getDaysInMonth(targetMonth, reportYear);
      if (today.getFullYear() > reportYear || (today.getFullYear() === reportYear && today.getMonth() + 1 > targetMonth)) isPast = true;
      else if (today.getFullYear() < reportYear || (today.getFullYear() === reportYear && today.getMonth() + 1 < targetMonth)) isFuture = true;
      else daysPassed = today.getDate();
    } else if (targetQuarter !== -1) {
      const startMonth = (targetQuarter - 1) * 3 + 1;
      totalDays = getDaysInMonth(startMonth, reportYear) + getDaysInMonth(startMonth + 1, reportYear) + getDaysInMonth(targetQuarter * 3, reportYear);
      const currentQ = Math.ceil((today.getMonth() + 1) / 3);
      if (today.getFullYear() > reportYear || (today.getFullYear() === reportYear && currentQ > targetQuarter)) isPast = true;
      else if (today.getFullYear() < reportYear || (today.getFullYear() === reportYear && currentQ < targetQuarter)) isFuture = true;
      else {
        const startOfQuarter = new Date(reportYear, startMonth - 1, 1);
        daysPassed = Math.floor((today.getTime() - startOfQuarter.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const actual = filteredActuals.reduce((sum, item) => sum + (item.revenueActual || 0), 0);
    const plan = filteredPlans.reduce((sum, item) => sum + (item.planValue || 0), 0);

    let forecast = 0;
    let method = '';
    let forecastPercent = 0;

    if (isPast) { forecast = actual; method = 'Đã chốt kỳ'; }
    else if (isFuture) { forecast = plan; method = 'Bằng Kế hoạch'; }
    else if (daysPassed > 0) { forecast = (actual / daysPassed) * totalDays; method = `Run-rate (${daysPassed}/${totalDays} ngày)`; }

    if (plan > 0) forecastPercent = (forecast / plan) * 100;
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
        if (!map[a.productGroup].subItems[a.subProductGroup]) map[a.productGroup].subItems[a.subProductGroup] = 0;
        map[a.productGroup].subItems[a.subProductGroup] += a.revenueActual;
      }
    });
    return Object.values(map)
      .map(item => ({
        ...item,
        percent: item.plan > 0 ? (item.actual / item.plan) * 100 : 0,
        subItemsArray: Object.entries(item.subItems as Record<string, number>)
          .map(([name, actual]) => ({ name, actual }))
          .sort((a, b) => (b.actual as number) - (a.actual as number))
      }))
      .sort((a, b) => b.plan - a.plan);
  }, [filteredPlans, filteredActuals]);

  const chartData = useMemo(() => {
    const aggregated: Record<string, any> = {};
    filteredPlans.forEach(p => {
      let key = p.month;
      if (chartGranularity === 'quarter') {
        const m = parseInt(p.month.replace('Tháng ', ''));
        key = `Quý ${Math.ceil(m / 3)}`;
      }
      if (!aggregated[key]) aggregated[key] = { time: key, actual: 0, plan: 0 };
      aggregated[key].plan += p.planValue;
    });

    filteredActuals.forEach(item => {
      let key = item.month;
      if (chartGranularity === 'quarter') key = item.quarter;
      if (chartGranularity === 'day') key = item.date;
      if (!aggregated[key]) {
        aggregated[key] = { time: key, actual: 0, plan: chartGranularity === 'day' ? (aggregated[item.month]?.plan || 0) / 30 : 0 };
      }
      aggregated[key].actual += item.revenueActual;
    });

    const todayForRunrate = new Date(2026, new Date().getMonth(), new Date().getDate());
    const currentMonthNum = todayForRunrate.getMonth() + 1;
    const currentQuarterNum = Math.ceil(currentMonthNum / 3);

    const sortedData = Object.values(aggregated).sort((a, b) => {
      if (a.time.includes('Tháng') && b.time.includes('Tháng')) {
        return parseInt(a.time.replace('Tháng ', '')) - parseInt(b.time.replace('Tháng ', ''));
      }
      return a.time.localeCompare(b.time);
    });

    return sortedData.map((item) => {
      let forecast = null;
      if (chartGranularity === 'month') {
        const m = parseInt(item.time.replace('Tháng ', ''));
        if (m === currentMonthNum - 1) forecast = item.actual;
        else if (m === currentMonthNum) {
          const totalDays = new Date(2026, m, 0).getDate();
          const daysPassed = todayForRunrate.getDate();
          forecast = daysPassed > 0 ? (item.actual / daysPassed) * totalDays : 0;
        } else if (m > currentMonthNum) forecast = item.plan;
      } else if (chartGranularity === 'quarter') {
        const q = parseInt(item.time.replace('Quý ', ''));
        if (q === currentQuarterNum - 1) forecast = item.actual;
        else if (q === currentQuarterNum) {
          const sm = (q - 1) * 3 + 1;
          const totalDays = new Date(2026, sm, 0).getDate() + new Date(2026, sm + 1, 0).getDate() + new Date(2026, sm + 2, 0).getDate();
          const startOfQ = new Date(2026, sm - 1, 1);
          const daysPassed = Math.floor((todayForRunrate.getTime() - startOfQ.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          forecast = daysPassed > 0 ? (item.actual / daysPassed) * totalDays : 0;
        } else if (q > currentQuarterNum) forecast = item.plan;
      }
      return { ...item, forecast };
    });
  }, [filteredActuals, filteredPlans, chartGranularity]);

  const growthTableData = useMemo(() => {
    return chartData.map((item, index) => {
      if (index === 0) return { ...item, diffValue: 0, diffPercent: 0, hasPrev: false, prevActual: 0 };
      const prevItem = chartData[index - 1];
      const diffValue = item.actual - prevItem.actual;
      const diffPercent = prevItem.actual > 0 ? (diffValue / prevItem.actual) * 100 : 0;
      return { ...item, diffValue, diffPercent, prevActual: prevItem.actual, hasPrev: true };
    }).filter(item => item.actual > 0 || item.plan > 0);
  }, [chartData]);

  const periodLabel = selectedPeriod === 'All' ? 'Năm' : selectedPeriod;

  const forecastChartData = [
    { name: 'Thực tế', value: kpis.totalDthuChuaVAT, fill: '#3b82f6' },
    { name: 'Dự phóng', value: forecastData.forecast, fill: '#8b5cf6' },
    { name: 'Kế hoạch', value: kpis.totalPlan, fill: '#94a3b8' }
  ];

  const actualVsPlanValue = kpis.totalDthuChuaVAT - kpis.totalPlan;
  const actualVsPlanPercent = kpis.totalPlan > 0 ? (actualVsPlanValue / kpis.totalPlan) * 100 : 0;
  const forecastVsPlanValue = forecastData.forecast - kpis.totalPlan;
  const forecastVsPlanPercent = kpis.totalPlan > 0 ? (forecastVsPlanValue / kpis.totalPlan) * 100 : 0;

  return (
    <div className="bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Dashboard Kinh Doanh 2026
            {isProcessing && <Loader2 className="animate-spin text-blue-500" size={20} />}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi % hoàn thành mục tiêu đa chiều</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-3">
            <input type="file" ref={actualFileInputRef} onChange={handleActualFileChange} accept=".xlsx, .xls, .csv" style={{ display: 'none' }} />
            <button
              onClick={() => actualFileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm text-slate-600 disabled:opacity-50"
            >
              <UploadCloud size={16} /> Up File Thực Tế
            </button>
            <input type="file" ref={planFileInputRef} onChange={handlePlanFileChange} accept=".xlsx, .xls, .csv" style={{ display: 'none' }} />
            <button
              onClick={() => planFileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Target size={16} /> Up File Kế Hoạch
            </button>
          </div>
          {uploadError && (
            <div className="text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-md border border-rose-100 max-w-[340px] text-right">
              ⚠ {uploadError}
            </div>
          )}
          {(uploadedActual || uploadedPlan) && (
            <div className="text-xs text-slate-500 flex gap-4 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
              {uploadedActual && <span>Thực tế: <span className="font-semibold text-blue-700 truncate max-w-[150px] inline-block align-bottom">{uploadedActual}</span></span>}
              {uploadedPlan && <span>Kế hoạch: <span className="font-semibold text-blue-700 truncate max-w-[150px] inline-block align-bottom">{uploadedPlan}</span></span>}
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap w-full">
          <div className="flex items-center gap-2 text-slate-500 font-medium min-w-fit">
            <Filter size={18} /> Lọc Báo Cáo:
          </div>
          <select
            className="bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none flex-grow md:flex-grow-0 min-w-[200px]"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            <option value="All">🏢 Toàn Công Ty (Tất cả Nhóm)</option>
            {dynamicTeams.map(t => <option key={t} value={t}>👤 Nhóm: {t}</option>)}
          </select>
          <select
            className="bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none flex-grow md:flex-grow-0 min-w-[180px]"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {periodOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="w-px h-8 bg-slate-200 hidden md:block mx-2"></div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">Kỳ đối chiếu:</span>
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
              value={chartGranularity}
              onChange={(e) => setChartGranularity(e.target.value)}
            >
              <option value="day">Theo Ngày</option>
              <option value="month">Theo Tháng</option>
              <option value="quarter">Theo Quý</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
        <ExpandableQtyCard
          title="Số lượng sp đã bán"
          totalQty={kpis.totalQty}
          breakdown={qtyBreakdown}
          icon={<Package className="text-purple-500" size={24} />}
        />
      </div>

      {/* PROGRESS BARS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="mb-6 flex justify-between items-end flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Hoàn thành Mục tiêu từng Mặt hàng</h2>
            <p className="text-sm text-slate-500 mt-1">
              Nhóm: <strong className="text-blue-600">{selectedTeam === 'All' ? 'Toàn công ty' : selectedTeam}</strong>
              <span className="mx-2">|</span>
              Kỳ báo cáo: <strong className="text-amber-600">{periodLabel}</strong>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-6">
          {productProgress.map((prod, idx) => (
            <ProgressBarCard key={idx} data={prod} />
          ))}
        </div>
      </div>

      {/* CHART: TREND */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">Biến động & Dự báo Doanh thu</h2>
          <p className="text-sm text-slate-500">Đường dự báo nối tiếp thực tế theo {chartGranularity === 'day' ? 'Ngày' : chartGranularity === 'month' ? 'Tháng' : 'Quý'}</p>
        </div>
        {isMounted && (
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
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${(val / 1000000000).toFixed(0)}Tỷ`} />
                <Tooltip content={<TrendTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="plan" name="Kế hoạch giao" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="forecast" name="Dự báo (Forecast)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                <Area yAxisId="left" type="monotone" dataKey="actual" name="Thực tế đạt" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">So sánh Tổng quan</h2>
            <p className="text-sm text-slate-500">Thực tế & Dự phóng vs Kế hoạch ({periodLabel})</p>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-blue-50/40 p-3 rounded-lg border border-blue-100">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">Thực tế vs KH</p>
              <div className="flex items-center gap-1.5">
                {actualVsPlanValue > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : (actualVsPlanValue < 0 ? <TrendingDown size={16} className="text-rose-500" /> : <Minus size={16} className="text-slate-400" />)}
                <span className={`font-bold ${actualVsPlanValue > 0 ? 'text-emerald-600' : (actualVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-600')}`}>
                  {actualVsPlanValue > 0 ? '+' : ''}{formatVND(actualVsPlanValue)}
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${actualVsPlanValue > 0 ? 'text-emerald-600' : (actualVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-500')}`}>
                ({actualVsPlanPercent > 0 ? '+' : ''}{actualVsPlanPercent.toFixed(1)}%)
              </p>
            </div>
            <div className="flex-1 bg-purple-50/40 p-3 rounded-lg border border-purple-100">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1">Dự phóng vs KH</p>
              <div className="flex items-center gap-1.5">
                {forecastVsPlanValue > 0 ? <TrendingUp size={16} className="text-emerald-500" /> : (forecastVsPlanValue < 0 ? <TrendingDown size={16} className="text-rose-500" /> : <Minus size={16} className="text-slate-400" />)}
                <span className={`font-bold ${forecastVsPlanValue > 0 ? 'text-emerald-600' : (forecastVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-600')}`}>
                  {forecastVsPlanValue > 0 ? '+' : ''}{formatVND(forecastVsPlanValue)}
                </span>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${forecastVsPlanValue > 0 ? 'text-emerald-600' : (forecastVsPlanValue < 0 ? 'text-rose-600' : 'text-slate-500')}`}>
                ({forecastVsPlanPercent > 0 ? '+' : ''}{forecastVsPlanPercent.toFixed(1)}%)
              </p>
            </div>
          </div>
          {isMounted && (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastChartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${(val / 1000000000).toFixed(0)}Tỷ`} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
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
                    {forecastChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800">Cơ cấu Doanh thu</h2>
            <p className="text-sm text-slate-500">Đóng góp của các mặt hàng vào số Thực tế</p>
          </div>
          {isMounted && (
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productProgress.filter(p => p.actual > 0)} cx="50%" cy="45%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="actual">
                    {productProgress.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={(props: any) => <PieTooltip {...props} total={kpis.totalDthuChuaVAT} />} />
                  <Legend content={<CustomLegend />} verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* BẢNG TĂNG TRƯỞNG */}
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
                <th className="p-3 font-semibold text-right">Thực tế</th>
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
                        <span className={`flex items-center justify-end gap-1 font-medium ${isPositive ? 'text-emerald-600' : (isNegative ? 'text-rose-600' : 'text-slate-500')}`}>
                          {isPositive ? <TrendingUp size={14} /> : (isNegative ? <TrendingDown size={14} /> : <Minus size={14} />)}
                          {isPositive ? '+' : ''}{formatVND(row.diffValue)}
                        </span>
                      ) : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="p-3 text-right">
                      {row.hasPrev && row.prevActual > 0 ? (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700' : (isNegative ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600')}`}>
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

// --- SUB-COMPONENTS ---
function KPICard({ title, value, subValue, icon, valueColor = 'text-slate-800' }: {
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

function ExpandableQtyCard({ title, totalQty, breakdown, icon }: {
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
          <h3 className="text-2xl font-bold truncate text-slate-800">{totalQty.toLocaleString()}</h3>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg shrink-0">{icon}</div>
      </div>
      {isExpanded && hasBreakdown && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2 max-h-36 overflow-y-auto pr-2">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-slate-600 truncate mr-2">{item.name}</span>
              <span className="font-semibold text-slate-800">{item.qty.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBarCard({ data }: { data: any }) {
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
          <div className={`${barColor} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${Math.min(data.percent, 100)}%` }}></div>
          {data.percent > 100 && <div className="absolute top-0 bottom-0 right-0 w-1 bg-emerald-700"></div>}
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span className="truncate mr-2">Thực: <strong className="text-slate-700">{formatVND(data.actual)}</strong></span>
          <span className="truncate text-right">KH: {formatVND(data.plan)}</span>
        </div>
      </div>
      {isExpanded && hasSubItems && (
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Chi tiết doanh thu Thực tế:</p>
          {data.subItemsArray.map((sub: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center pl-1">
              <span className="text-slate-600 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                {sub.name}
              </span>
              <span className="font-medium text-slate-700 text-xs">{formatVND(sub.actual)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomLegend({ payload }: { payload?: any[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2 overflow-y-auto max-h-24 pt-2 px-2">
      {(payload || []).map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center gap-1.5 text-xs text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}></span>
          <span className="truncate max-w-[100px]">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

function TrendTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-slate-100">
        <p className="font-bold text-slate-800 mb-2 border-b pb-2">{label}</p>
        {payload.filter((p: any) => p.value !== null).map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-600 text-sm">{entry.name}:</span>
            <span className="font-bold text-slate-800">{formatVND(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function PieTooltip({ active, payload, total }: any) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? ((data.value / total) * 100).toFixed(2) : 0;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 min-w-[160px]">
        <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }}></div>
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

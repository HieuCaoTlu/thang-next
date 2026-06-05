// ============================================================
// DATA UTILS — constants, formatters, parsers
// ============================================================

export const months = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];

export const fallbackTeams = ['Nguyễn Huyền My', 'Nguyễn Thị Nhàn', 'Lê Quân'];

export const periodOptions = [
  { value: 'All', label: '📅 Toàn Năm 2026' },
  { value: 'Quý 1', label: '📊 Quý 1 (T1-T3)' },
  { value: 'Quý 2', label: '📊 Quý 2 (T4-T6)' },
  { value: 'Quý 3', label: '📊 Quý 3 (T7-T9)' },
  { value: 'Quý 4', label: '📊 Quý 4 (T10-T12)' },
  ...months.map(m => ({ value: m, label: `🗓️ ${m}` })),
];

export const PRODUCT_CATEGORIES = [
  'Bàn phím','Chuột','Tai nghe','Ghế','Bàn Gaming','Màn hình','Phụ Kiện','Case','Nguồn',
  'AIO','FLESPORTS','Thronmax','Sihoo','Huntkey','Patriot','Cidoo','Feeltek','Khác',
  'SIMORCHIP','GREATWALL','RAIDMAX','THUNDERBIRD','Netis','Dầu khí','SSTC','ZOTAC',
  'UNV','UNV- camera','UNV- thẻ nhớ','UNV- bộ chuyển mạch','UNV- đầu máy ghi hình','UNV- dây cáp mạng','UNV- màn hình',
];

export const TEAM_YEARLY_PLANS: Record<string, Record<string, number>> = {
  'Nguyễn Huyền My': { 'Bàn phím': 7500000000, 'Màn hình': 21200000000, 'Phụ Kiện': 2000000000, 'Case': 4000000000 },
  'Nguyễn Thị Nhàn': { 'Bàn phím': 8500000000, 'Màn hình': 47600000000, 'Phụ Kiện': 10000000000 },
  'Lê Quân': { 'Dầu khí': 31700000000, 'UNV': 11500000000, 'GREATWALL': 20000000000 },
};

export const monthWeights = [0.06,0.06,0.07,0.08,0.08,0.08,0.09,0.09,0.09,0.1,0.1,0.1];

export const COLORS = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4',
  '#d946ef','#f97316','#64748b','#84cc16','#14b8a6','#f43f5e',
  '#6366f1','#ec4899','#0ea5e9','#eab308',
];

export const STATUS_COLORS: Record<string, string> = {
  'Bắt đầu triển khai': '#3b82f6',
  'Đang chạy': '#f59e0b',
  'Đã hoàn thành': '#10b981',
  'Hủy': '#64748b',
};

export const PRIORITY_COLORS: Record<string, string> = {
  'Cao': '#ef4444', 'Trung bình': '#f59e0b', 'Thấp': '#3b82f6',
};

export const KNOWN_BRANDS = [
  'EDRA','UNV','GREATWALL','FEELTEK','ACER','FLESPORTS','THRONMAX','SIHOO','HUNTKEY',
  'PATRIOT','CIDOO','SIMORCHIP','RAIDMAX','ZOTAC','NETIS','SSTC','DAHUA','HIKVISION',
  'DELL','ASUS','HP','LOGITECH','MSI',
];

export const MOCK_TASKS = [
  { id: 'DA001', name: 'Triển khai CRM Khách hàng', goal: 'Đồng bộ data Sales', empId: 'NV01', empName: 'Lê Quân', startDate: '2026-05-01', endDate: '2026-05-20', status: 'Đã hoàn thành', priority: 'Cao' },
  { id: 'DA002', name: 'Chiến dịch UNV Tháng 5', goal: 'Đạt target 5 Tỷ', empId: 'NV02', empName: 'Nguyễn Huyền My', startDate: '2026-05-10', endDate: '2026-06-05', status: 'Đang chạy', priority: 'Cao' },
  { id: 'DA003', name: 'Clear tồn kho Màn hình', goal: 'Xả 2000 chiếc', empId: 'NV03', empName: 'Nguyễn Thị Nhàn', startDate: '2026-05-28', endDate: '2026-06-15', status: 'Bắt đầu triển khai', priority: 'Trung bình' },
];

// Admin credentials — hardcoded, no user management
export const ADMIN_CREDENTIALS = { username: 'admin', password: 'camonquykhach' };

export function formatVND(value: any): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return value.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
}

export function parseNum(val: any): number {
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
}

export function extractBrand(name: string): string {
  if (!name) return 'Khác';
  const upper = name.toUpperCase();
  if (upper.includes('E-DRA') || upper.includes('EDRA')) return 'EDRA';
  for (const b of KNOWN_BRANDS) {
    if (upper.includes(b)) return b;
  }
  return 'Khác';
}

export function generateMockPlans(): any[] {
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
}

export function parseActualData(data: any[]): any[] {
  const parsedActuals: any[] = [];
  let currentActualMonth = 'Tháng 1';
  let currentActualTeam = 'Chưa phân nhóm';

  data.forEach((row) => {
    const isTotalRow = Object.values(row).some(v =>
      typeof v === 'string' && (v.toLowerCase().includes('tổng cộng') || v.toLowerCase() === 'cộng')
    );
    if (isTotalRow) return;

    let doanhSo = 0, dthuChuaVAT = 0, teamRaw = '', empRaw = '', spRaw = '', dateRaw: any = '';

    for (const key in row) {
      const k = key.toUpperCase();
      if (k.includes('DTHU CHƯA VAT') || k.includes('DOANH THU CHƯA VAT')) dthuChuaVAT = parseNum(row[key]);
      else if (k.includes('DOANH SỐ BÁN') || k.includes('DOANH SO BAN')) doanhSo = parseNum(row[key]);
      else if (k.includes('TRƯỞNG NHÓM')) teamRaw = row[key];
      else if (k.includes('TÊN NHÂN VIÊN') || k.includes('NHÂN VIÊN')) empRaw = row[key];
      else if (k.includes('NHÓM SẢN PHẨM') || k.includes('MẶT HÀNG') || k.includes('SẢN PHẨM')) spRaw = row[key];
      else if (k.includes('NGÀY HẠCH TOÁN') || k.includes('NGÀY CHỨNG TỪ')) dateRaw = row[key];
    }

    if (doanhSo === 0 && dthuChuaVAT === 0) return;
    if (teamRaw && String(teamRaw).trim() !== '') currentActualTeam = String(teamRaw).trim();
    const currentEmp = (empRaw && String(empRaw).trim() !== '') ? String(empRaw).trim() : 'Chưa xác định';

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

    let jsDate = new Date();
    if (typeof dateRaw === 'number') jsDate = new Date((dateRaw - 25569) * 86400 * 1000);
    else if (typeof dateRaw === 'string') {
      const parts = dateRaw.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) jsDate = new Date(+parts[0], +parts[1]-1, +parts[2]);
        else jsDate = new Date(+parts[2], +parts[1]-1, +parts[0]);
      }
    }
    if (isNaN(jsDate.getTime())) jsDate = new Date();
    const stdDate = `${jsDate.getFullYear()}-${String(jsDate.getMonth()+1).padStart(2,'0')}-${String(jsDate.getDate()).padStart(2,'0')}`;

    let spRawString = String(spRaw || 'Khác').trim();
    let sp = spRawString;
    const subSp = spRawString;
    if (sp.toUpperCase().startsWith('UNV')) sp = 'UNV';

    const monthNum = parseInt(currentActualMonth.replace('Tháng ', ''));
    const quarterVal = isNaN(monthNum) ? 1 : Math.ceil(monthNum / 3);

    parsedActuals.push({
      date: stdDate,
      month: currentActualMonth,
      quarter: `Quý ${quarterVal}`,
      team: currentActualTeam,
      employee: currentEmp,
      productGroup: sp,
      subProductGroup: subSp,
      revenueActual: dthuChuaVAT,
      doanhSoBan: doanhSo,
      qtyActual: parseNum(row['Tổng số lượng bán']),
    });
  });

  return parsedActuals;
}

export function parsePlanData(data: any[][]): any[] {
  const parsedPlans: any[] = [];
  let teamCol = -1, productCol = -1;
  let monthCols: Record<string, number> = {};
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(data.length, 15); i++) {
    let tempMonthCols: Record<string, number> = {};
    let foundTeam = false, foundProduct = false;
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
      if (num !== 0) parsedPlans.push({ team: currentTeam, productGroup: product, month: mName, planValue: num });
    });
  }

  return parsedPlans;
}

export function parseDetailedInventoryData(data: any[][]): any[] {
  const parsedInv: any[] = [];
  let headerIdx = -1;

  for (let i = 0; i < Math.min(data.length, 10); i++) {
    if (data[i].some(v => String(v).toLowerCase().includes('mã hàng'))) {
      headerIdx = i; break;
    }
  }

  if (headerIdx > -1) {
    const h1 = data[headerIdx].map((x: any) => String(x).toLowerCase().trim());
    const h2 = data.length > headerIdx + 1 ? data[headerIdx + 1].map((x: any) => String(x).toLowerCase().trim()) : [];

    let cTenKho=0, cMaKho=1, cMaHang=2, cTenHang=3, cDVT=4;
    let cDauKySL=5, cDauKyGT=6, cXuatKhoSL=7, cXuatKhoGT=8, cCuoiKySL=9, cCuoiKyGT=10, cNhanHang=11;

    let currentGroup = '';
    for (let i = 0; i < Math.max(h1.length, h2.length); i++) {
      const v1 = h1[i] || ''; const v2 = h2[i] || '';
      if (v1) currentGroup = v1;
      if (v1.includes('tên kho')) cTenKho = i;
      else if (v1.includes('mã kho')) cMaKho = i;
      else if (v1.includes('mã hàng')) cMaHang = i;
      else if (v1.includes('tên hàng')) cTenHang = i;
      else if (v1.includes('đvt') || v1.includes('đơn vị')) cDVT = i;
      else if (v1.includes('nhãn hàng')) cNhanHang = i;

      if (currentGroup.includes('đầu kỳ')) {
        if (v2.includes('số lượng') || v1.includes('số lượng')) cDauKySL = i;
        if (v2.includes('giá trị') || v1.includes('giá trị')) cDauKyGT = i;
      } else if (currentGroup.includes('xuất kho')) {
        if (v2.includes('số lượng') || v1.includes('số lượng')) cXuatKhoSL = i;
        if (v2.includes('giá trị') || v1.includes('giá trị')) cXuatKhoGT = i;
      } else if (currentGroup.includes('cuối kỳ')) {
        if (v2.includes('số lượng') || v1.includes('số lượng')) cCuoiKySL = i;
        if (v2.includes('giá trị') || v1.includes('giá trị')) cCuoiKyGT = i;
      }
    }

    const isDoubleHeader = h2.some(x => x.includes('số lượng') || x.includes('giá trị'));
    const startRow = headerIdx + (isDoubleHeader ? 2 : 1);

    for (let i = startRow; i < data.length; i++) {
      const row = data[i];
      if (!row[cMaHang] && !row[cTenHang]) continue;
      parsedInv.push({
        tenKho: row[cTenKho] || '',
        maKho: row[cMaKho] || '',
        maHang: row[cMaHang] || '',
        tenHang: row[cTenHang] || '',
        dvt: row[cDVT] || '',
        dauKySL: parseNum(row[cDauKySL]),
        dauKyGT: parseNum(row[cDauKyGT]),
        xuatKhoSL: parseNum(row[cXuatKhoSL]),
        xuatKhoGT: parseNum(row[cXuatKhoGT]),
        cuoiKySL: parseNum(row[cCuoiKySL]),
        cuoiKyGT: parseNum(row[cCuoiKyGT]),
        nhanHang: row[cNhanHang] || extractBrand(row[cTenHang]),
      });
    }
  }

  return parsedInv;
}

export function parseOverviewInventoryData(data: any[]): any[] {
  const parsedInv: any[] = [];
  data.forEach(row => {
    let khuVuc = '', tenKho = '', maHang = '', tenHang = '', cuoiKy = 0;
    for (const key in row) {
      const k = key.toUpperCase();
      if (k.includes('KHU VỰC')) khuVuc = row[key];
      else if (k.includes('TÊN KHO') || k.includes('MÃ KHO')) tenKho = row[key];
      else if (k.includes('MÃ HÀNG')) maHang = row[key];
      else if (k.includes('TÊN HÀNG')) tenHang = row[key];
      else if (k.includes('CUỐI KỲ') || k.includes('TỒN KHO') || k.includes('SỐ LƯỢNG TỒN')) cuoiKy = parseNum(row[key]);
    }
    if (maHang && tenHang && cuoiKy > 0) {
      parsedInv.push({
        region: String(khuVuc || 'Chưa xác định').trim(),
        warehouse: String(tenKho || 'Chưa xác định').trim(),
        productCode: String(maHang).trim(),
        productName: String(tenHang).trim(),
        brand: extractBrand(tenHang),
        qty: cuoiKy,
      });
    }
  });
  return parsedInv;
}

export function loadSheetJS(): Promise<unknown> {
  return new Promise((resolve) => {
    if ((window as any).XLSX) return resolve((window as any).XLSX);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve((window as any).XLSX);
    document.body.appendChild(script);
  });
}

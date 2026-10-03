import { DrainPoint, LoaiCong, TinhTrang } from '../types';

export const GOOGLE_SHEETS_HEADERS = [
  'TenViTri',
  'ViDo',
  'KinhDo',
  'LoaiCong',
  'TinhTrang',
  'HinhAnh',
  'NgayCapNhat'
];

export function exportPointsToCSV(points: DrainPoint[]): string {
  const headerLine = GOOGLE_SHEETS_HEADERS.join(',');
  const rows = points.map(p => {
    const escape = (val: string | number | undefined) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(p.TenViTri),
      p.ViDo,
      p.KinhDo,
      escape(p.LoaiCong),
      escape(p.TinhTrang),
      escape(p.HinhAnh || ''),
      escape(p.NgayCapNhat)
    ].join(',');
  });

  // Include UTF-8 BOM so Excel and Google Sheets properly render Vietnamese diacritics
  return '\uFEFF' + [headerLine, ...rows].join('\r\n');
}

export function parseGoogleSheetsCSV(csvText: string): DrainPoint[] {
  // Clean BOM if present
  let cleanText = csvText.trim();
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.substring(1);
  }

  const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headerLine = lines[0];
  const delimiter = headerLine.includes('\t') ? '\t' : ',';

  const parseRow = (line: string): string[] => {
    if (delimiter === '\t') {
      return line.split('\t').map(c => c.trim().replace(/^"(.*)"$/, '$1'));
    }
    const result: string[] = [];
    let cur = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result.map(c => c.replace(/^"(.*)"$/, '$1'));
  };

  const headers = parseRow(headerLine).map(h => h.trim().toLowerCase());
  const tenViTriIdx = headers.findIndex(h => h === 'tenvitri' || h.includes('ten') || h.includes('vi tri'));
  const viDoIdx = headers.findIndex(h => h === 'vido' || h.includes('vĩ độ') || h.includes('lat'));
  const kinhDoIdx = headers.findIndex(h => h === 'kinhdo' || h.includes('kinh độ') || h.includes('lng') || h.includes('lon'));
  const loaiCongIdx = headers.findIndex(h => h === 'loaicong' || h.includes('loại cống') || h.includes('loai'));
  const tinhTrangIdx = headers.findIndex(h => h === 'tinhtrang' || h.includes('tình trạng') || h.includes('trang'));
  const hinhAnhIdx = headers.findIndex(h => h === 'hinhanh' || h.includes('hình ảnh') || h.includes('ảnh') || h.includes('image'));
  const ngayCapNhatIdx = headers.findIndex(h => h === 'ngaycapnhat' || h.includes('ngày') || h.includes('thời gian') || h.includes('date'));

  const parsedPoints: DrainPoint[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    if (cols.length < 3) continue;

    const tenViTri = (tenViTriIdx >= 0 ? cols[tenViTriIdx] : cols[0]) || `Điểm khảo sát #${i}`;
    const rawViDo = parseFloat(viDoIdx >= 0 ? cols[viDoIdx] : cols[1]);
    const rawKinhDo = parseFloat(kinhDoIdx >= 0 ? cols[kinhDoIdx] : cols[2]);

    if (isNaN(rawViDo) || isNaN(rawKinhDo)) continue;

    const rawLoaiCong = (loaiCongIdx >= 0 ? cols[loaiCongIdx] : cols[3] || '').trim();
    const loaiCong: LoaiCong = rawLoaiCong.toLowerCase().includes('mặt') ? 'Mặt đường' : 'Hàm ếch';

    const rawTinhTrang = (tinhTrangIdx >= 0 ? cols[tinhTrangIdx] : cols[4] || '').trim().toLowerCase();
    let tinhTrang: TinhTrang = 'Bình thường';
    if (rawTinhTrang.includes('tắc') || rawTinhTrang.includes('nghẽn') || rawTinhTrang.includes('tac')) {
      tinhTrang = 'Tắc nghẽn';
    } else if (rawTinhTrang.includes('lấp') || rawTinhTrang.includes('bị lấp') || rawTinhTrang.includes('lap')) {
      tinhTrang = 'Bị lấp kín';
    } else if (rawTinhTrang.includes('rác') || rawTinhTrang.includes('rac')) {
      tinhTrang = 'Có rác';
    }

    const hinhAnh = hinhAnhIdx >= 0 ? cols[hinhAnhIdx] : cols[5] || '';
    const ngayCapNhat = (ngayCapNhatIdx >= 0 ? cols[ngayCapNhatIdx] : cols[6]) || new Date().toISOString().slice(0, 16).replace('T', ' ');

    // Only Phường Phước Thắng or Phường Tam Thắng
    let khuVuc = 'Phường Phước Thắng';
    const lowerName = tenViTri.toLowerCase();
    if (lowerName.includes('tam thắng') || lowerName.includes('tam thang')) {
      khuVuc = 'Phường Tam Thắng';
    } else {
      khuVuc = 'Phường Phước Thắng';
    }

    let mucDoNguyCo: 'Thấp' | 'Trung bình' | 'Cao' | 'Báo động' = 'Thấp';
    if (tinhTrang === 'Tắc nghẽn') mucDoNguyCo = 'Báo động';
    else if (tinhTrang === 'Bị lấp kín') mucDoNguyCo = 'Cao';
    else if (tinhTrang === 'Có rác') mucDoNguyCo = 'Trung bình';

    parsedPoints.push({
      id: `GS-${Date.now().toString(36)}-${i}`,
      TenViTri: tenViTri,
      ViDo: rawViDo,
      KinhDo: rawKinhDo,
      LoaiCong: loaiCong,
      TinhTrang: tinhTrang,
      HinhAnh: hinhAnh,
      NgayCapNhat: ngayCapNhat,
      KhuVuc: khuVuc,
      MucDoNguyCo: mucDoNguyCo,
      GhiChu: `Nhập từ Google Sheets vào lúc ${new Date().toLocaleTimeString('vi-VN')}`,
      ChieuSauNuocCm: tinhTrang === 'Tắc nghẽn' ? 25 : tinhTrang === 'Bị lấp kín' ? 15 : tinhTrang === 'Có rác' ? 8 : 0,
      KhaNangThoatNuoc: tinhTrang === 'Tắc nghẽn' ? '10%' : tinhTrang === 'Bị lấp kín' ? '25%' : tinhTrang === 'Có rác' ? '60%' : '95%',
      SoNhaTuyenDuong: khuVuc
    });
  }

  return parsedPoints;
}

export function downloadCSVFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const DEFAULT_SHEET_ID = '16ofYMc8F-eNHgcTCKLPZ-B9a8v4Orgqtes2fc3Ufksg';

export async function fetchPointsFromOpenSheet(sheetId: string = DEFAULT_SHEET_ID, sheetTab: string = 'Sheet1'): Promise<DrainPoint[]> {
  const cleanId = sheetId.trim() || DEFAULT_SHEET_ID;
  const cleanTab = sheetTab.trim() || 'Sheet1';
  const apiUrl = `https://opensheet.elk.sh/${cleanId}/${cleanTab}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    throw new Error(`Lỗi kết nối OpenSheet (HTTP ${res.status}). Kiểm tra lại Sheet ID và quyền chia sẻ của Google Sheet.`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Định dạng dữ liệu trả về từ OpenSheet không phải danh sách mảng JSON.');
  }

  const resultPoints: DrainPoint[] = [];

  data.forEach((item: any, idx: number) => {
    const lat = parseFloat(item.ViDo || item.lat || item.Lat || item.Latitude || item.vi_do);
    const lng = parseFloat(item.KinhDo || item.lng || item.Lng || item.Longitude || item.kinh_do);
    if (isNaN(lat) || isNaN(lng)) return;

    const tenViTri = (item.TenViTri || item.TenDiaDiem || item.name || item.dia_diem || `Cống #${idx + 1}`).trim();
    const loaiRaw = (item.LoaiCong || item.Loai || item.type || '').toString().toLowerCase();
    const loaiCong: LoaiCong = loaiRaw.includes('mặt') ? 'Mặt đường' : 'Hàm ếch';

    const tinhTrangRaw = (item.TinhTrang || item.status || item.tinh_trang || '').toString().toLowerCase();
    let tinhTrang: TinhTrang = 'Bình thường';
    if (tinhTrangRaw.includes('rác') || tinhTrangRaw.includes('lá')) {
      tinhTrang = 'Có rác';
    } else if (tinhTrangRaw.includes('tắc') || tinhTrangRaw.includes('lấp') || tinhTrangRaw.includes('nghẽn')) {
      tinhTrang = 'Tắc nghẽn';
    }

    let khuVuc = 'Phường Phước Thắng';
    const lowerName = tenViTri.toLowerCase();
    if (lowerName.includes('tam thắng') || lowerName.includes('tam thang')) {
      khuVuc = 'Phường Tam Thắng';
    } else {
      khuVuc = 'Phường Phước Thắng';
    }

    resultPoints.push({
      id: `OS-${cleanId.slice(0, 6)}-${idx}`,
      TenViTri: tenViTri,
      ViDo: lat,
      KinhDo: lng,
      LoaiCong: loaiCong,
      TinhTrang: tinhTrang,
      HinhAnh: item.HinhAnh || item.image || item.hinh_anh || '',
      NgayCapNhat: item.NgayCapNhat || new Date().toISOString().slice(0, 16).replace('T', ' '),
      KhuVuc: khuVuc,
      GhiChu: item.GhiChu || item.DanhGiaXacThuc || `Đồng bộ từ Google Sheets (${cleanId})`,
      MucDoNguyCo: tinhTrang === 'Tắc nghẽn' ? 'Báo động' : tinhTrang === 'Có rác' ? 'Trung bình' : 'Thấp',
      ChieuSauNuocCm: tinhTrang === 'Tắc nghẽn' ? 25 : tinhTrang === 'Có rác' ? 8 : 0,
      KhaNangThoatNuoc: tinhTrang === 'Tắc nghẽn' ? '10%' : tinhTrang === 'Có rác' ? '60%' : '95%',
      SoNhaTuyenDuong: khuVuc
    });
  });

  return resultPoints;
}

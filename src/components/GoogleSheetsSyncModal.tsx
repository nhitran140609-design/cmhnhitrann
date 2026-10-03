import React, { useState } from 'react';
import { DrainPoint } from '../types';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  Copy,
  Check,
  FolderOpen,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  exportPointsToCSV,
  parseGoogleSheetsCSV,
  downloadCSVFile,
  fetchPointsFromOpenSheet,
  DEFAULT_SHEET_ID,
  GOOGLE_SHEETS_HEADERS
} from '../utils/csvHelper';
import { GOOGLE_DRIVE_FOLDER_URL } from '../data/initialPoints';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: DrainPoint[];
  onImportPoints: (newPoints: DrainPoint[], mode: 'replace' | 'append') => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  points,
  onImportPoints
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'export' | 'import'>('url');
  const [pasteData, setPasteData] = useState('');
  const [sheetId, setSheetId] = useState(DEFAULT_SHEET_ID);
  const [sheetName, setSheetName] = useState('Sheet1');
  const [sheetUrl, setSheetUrl] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('replace');
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCSV = exportPointsToCSV(points);

  const handleDownloadCSV = () => {
    downloadCSVFile(
      `DrainMap_VungTau_${new Date().toISOString().slice(0, 10)}.csv`,
      currentCSV
    );
  };

  const handleCopyHeaderTemplate = () => {
    navigator.clipboard.writeText(GOOGLE_SHEETS_HEADERS.join('\t'));
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleImportText = () => {
    if (!pasteData.trim()) {
      alert('Vui lòng dán dữ liệu bảng tính Google Sheets.');
      return;
    }

    try {
      const parsed = parseGoogleSheetsCSV(pasteData);
      if (parsed.length === 0) {
        alert('Không tìm thấy dòng dữ liệu hợp lệ nào. Vui lòng kiểm tra lại cấu trúc cột.');
        return;
      }

      onImportPoints(parsed, importMode);
      setImportStatus(`Đã nạp thành công ${parsed.length} điểm cống khảo sát!`);
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert('Lỗi xử lý dữ liệu: ' + err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseGoogleSheetsCSV(text);
        if (parsed.length === 0) {
          alert('Không tìm thấy dữ liệu hợp lệ trong file CSV.');
          return;
        }
        onImportPoints(parsed, importMode);
        setImportStatus(`Đã nạp thành công ${parsed.length} điểm từ file ${file.name}!`);
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleFetchFromOpenSheet = async () => {
    if (!sheetId.trim()) {
      alert('Vui lòng nhập Google Sheet ID.');
      return;
    }

    setIsLoadingUrl(true);
    try {
      const parsed = await fetchPointsFromOpenSheet(sheetId.trim(), sheetName.trim() || 'Sheet1');
      if (parsed.length === 0) {
        throw new Error('Không đọc được dữ liệu nào từ Sheet. Hãy kiểm tra Sheet ID và quyền xem công khai (Ai có liên kết đều có thể xem).');
      }

      onImportPoints(parsed, importMode);
      setImportStatus(`✅ Đã đồng bộ thành công ${parsed.length} điểm cống từ OpenSheet API!`);
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert('Lỗi nạp Google Sheets: ' + err.message);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleFetchGoogleSheetsUrl = async () => {
    if (!sheetUrl.trim()) {
      alert('Vui lòng nhập đường link Google Sheets.');
      return;
    }

    setIsLoadingUrl(true);
    try {
      // Normalize Google Sheets URL to CSV export format
      let fetchUrl = sheetUrl.trim();
      const match = fetchUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error('Không thể tải file CSV từ Google Sheets. Hãy chắc chắn rằng bạn đã vào Tệp > Chia sẻ > Xuất bản lên web (định dạng CSV).');
      }

      const csvText = await res.text();
      const parsed = parseGoogleSheetsCSV(csvText);
      if (parsed.length === 0) {
        throw new Error('Không đọc được dữ liệu nào từ bảng tính. Hãy kiểm tra lại hàng tiêu đề.');
      }

      onImportPoints(parsed, importMode);
      setImportStatus(`Đồng bộ thành công ${parsed.length} điểm cống từ Google Sheets!`);
      setTimeout(() => {
        setImportStatus(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      alert('Lỗi đồng bộ: ' + err.message);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Tích Hợp & Đồng Bộ Google Sheets
              </h2>
              <p className="text-xs text-slate-400">
                Chuẩn hóa cấu trúc cột khảo sát thoát nước đô thị Vũng Tàu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-950/30 text-xs">
          <button
            id="tab-opensheet-btn"
            onClick={() => setActiveTab('url')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Đồng bộ trực tiếp Google Sheet ID
          </button>
          <button
            id="tab-export-btn"
            onClick={() => setActiveTab('export')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Cấu trúc cột & Mẫu Sheets
          </button>
          <button
            id="tab-import-btn"
            onClick={() => setActiveTab('import')}
            className={`py-2.5 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Dán dữ liệu / File CSV
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {importStatus && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* TAB 1: EXPORT & SCHEMA EXPLANATION */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
                <div className="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
                  <span>Cấu trúc cột Google Sheets (Bắt buộc):</span>
                  <button
                    onClick={handleCopyHeaderTemplate}
                    className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    {copiedTemplate ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>Sao chép dòng tiêu đề</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-1.5 px-2 font-semibold">Tên cột</th>
                        <th className="py-1.5 px-2 font-semibold">Quy cách nhập liệu</th>
                        <th className="py-1.5 px-2 font-semibold">Ví dụ mẫu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">TenViTri</td>
                        <td className="py-1.5 px-2">Tên vị trí cống</td>
                        <td className="py-1.5 px-2 text-slate-400">Điểm cống số 01 - Phường Phước Thắng</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">ViDo</td>
                        <td className="py-1.5 px-2">Tọa độ Vĩ độ</td>
                        <td className="py-1.5 px-2 text-slate-400">10.3698</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">KinhDo</td>
                        <td className="py-1.5 px-2">Tọa độ Kinh độ</td>
                        <td className="py-1.5 px-2 text-slate-400">107.0782</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">LoaiCong</td>
                        <td className="py-1.5 px-2">Nhập <b>Hàm ếch</b> hoặc <b>Mặt đường</b></td>
                        <td className="py-1.5 px-2 text-slate-400">Hàm ếch</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">TinhTrang</td>
                        <td className="py-1.5 px-2">
                          Nhập <b>Bình thường</b>, <b>Có rác</b>, <b>Bị lấp kín</b>, hoặc <b>Tắc nghẽn</b>
                        </td>
                        <td className="py-1.5 px-2 text-slate-400">Tắc nghẽn</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">HinhAnh</td>
                        <td className="py-1.5 px-2">(Tùy chọn) Link ảnh chụp thực tế cống</td>
                        <td className="py-1.5 px-2 text-slate-400 truncate max-w-[150px]">Link Drive / ảnh web</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 px-2 font-mono text-emerald-400 font-bold">NgayCapNhat</td>
                        <td className="py-1.5 px-2">Thời gian ghi nhận gần nhất</td>
                        <td className="py-1.5 px-2 text-slate-400">2026-09-22 08:30</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Google Drive Link Box */}
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderOpen className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-amber-200">
                      Kho ảnh khảo sát thực tế trên Google Drive
                    </div>
                    <div className="text-[11px] text-amber-400/80 line-clamp-1">
                      {GOOGLE_DRIVE_FOLDER_URL}
                    </div>
                  </div>
                </div>
                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-sm"
                >
                  <span>Mở Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Export Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  Tổng cộng: <b className="text-white">{points.length}</b> điểm cống sẵn sàng xuất file
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải file CSV cho Google Sheets</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT BY PASTE OR CSV FILE */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-300">
                Sao chép các dòng từ bảng tính Google Sheets của bạn và dán vào ô bên dưới, hoặc tải lên file CSV:
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Chọn file CSV tải lên</span>
                  <input
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Chế độ:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-blue-600"
                    />
                    <span>Thêm vào dữ liệu hiện có</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-blue-600"
                    />
                    <span>Thay thế tất cả</span>
                  </label>
                </div>
              </div>

              <div>
                <textarea
                  rows={8}
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder={`TenViTri\tViDo\tKinhDo\tLoaiCong\tTinhTrang\tHinhAnh\tNgayCapNhat\nĐiểm cống số 01 - Phường Phước Thắng\t10.4185\t107.1395\tHàm ếch\tTắc nghẽn\thttps://drive.google.com/...\t2026-09-22 08:30`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-600"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={handleImportText}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                >
                  Xử lý & Cập nhật lên bản đồ
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT GOOGLE SHEETS VIA OPENSHEET API OR PUBLISHED URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              {/* Primary Method: OpenSheet API */}
              <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Phương thức 1: Đồng bộ qua Google Sheet ID (Khuyên dùng)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    OpenSheet API
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Hệ thống kết nối trực tiếp với file Google Sheet của bạn. Lưu ý file Google Sheets cần được bật chế độ <b>"Bất kỳ ai có đường liên kết đều có thể xem"</b>.
                </p>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    Mã Google Sheet ID:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="google-sheet-id-input"
                      type="text"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      placeholder="16ofYMc8F-eNHgcTCKLPZ-B9a8v4Orgqtes2fc3Ufksg"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500 font-mono"
                    />
                    <input
                      id="google-sheet-name-input"
                      type="text"
                      value={sheetName}
                      onChange={(e) => setSheetName(e.target.value)}
                      placeholder="Sheet1"
                      title="Tên tab sheet"
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-500 font-mono text-center"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Endpoint API:</span>
                    <code className="text-sky-300 font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      https://opensheet.elk.sh/{sheetId || 'ID'}/{sheetName || 'Sheet1'}
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importModeOpenSheet"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Ghi đè tất cả</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="importModeOpenSheet"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Thêm nối tiếp</span>
                    </label>
                  </div>

                  <button
                    id="btn-sync-opensheet"
                    onClick={handleFetchFromOpenSheet}
                    disabled={isLoadingUrl}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUrl ? 'animate-spin' : ''}`} />
                    <span>{isLoadingUrl ? 'Đang tải dữ liệu...' : '⚡ Đồng bộ ngay từ Sheet ID'}</span>
                  </button>
                </div>
              </div>

              {/* Secondary Method: Published Web CSV */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-400">
                <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  <span>Phương thức 2: Nhập link xuất bản trực tiếp (Publish to web CSV)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-600 font-mono"
                  />
                  <button
                    onClick={handleFetchGoogleSheetsUrl}
                    disabled={isLoadingUrl}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors"
                  >
                    Đồng bộ link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

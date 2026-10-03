import React, { useRef, useState } from 'react';
import { DrainPoint } from '../types';
import {
  X,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { exportPointsToCSV, downloadCSVFile } from '../utils/csvHelper';
import { exportPointsToJSON, importPointsFromJSON } from '../utils/storageHelper';

interface StorageBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: DrainPoint[];
  lastSavedTime: string;
  onRestorePoints: (points: DrainPoint[]) => void;
  onResetToDefaults: () => void;
}

export const StorageBackupModal: React.FC<StorageBackupModalProps> = ({
  isOpen,
  onClose,
  points,
  lastSavedTime,
  onRestorePoints,
  onResetToDefaults
}) => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(points, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DrainMap_VungTau_Backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMessage('Đã tải xuống file sao lưu JSON an toàn!');
  };

  const handleExportCSV = () => {
    const csv = exportPointsToCSV(points);
    downloadCSVFile(`DrainMap_VungTau_${new Date().toISOString().slice(0, 10)}.csv`, csv);
    setStatusMessage('Đã tải xuống file CSV chuẩn Google Sheets!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('File không chứa danh sách điểm cống hợp lệ.');
      }
      onRestorePoints(parsed);
      setStatusMessage(`Đã khôi phục thành công ${parsed.length} điểm khảo sát từ file sao lưu!`);
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      alert('Lỗi nạp file sao lưu: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Bạn có chắc muốn khôi phục lại danh sách điểm cống mẫu ban đầu của Vũng Tàu? Các điểm mới tạo nếu chưa sao lưu sẽ bị xóa.')) {
      onResetToDefaults();
      setStatusMessage('Đã khôi phục dữ liệu mẫu ban đầu của Vũng Tàu!');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Trạng Thái Lưu Trữ & Sao Lưu Dữ Liệu
              </h2>
              <p className="text-xs text-slate-400">
                Tự động lưu vào bộ nhớ máy (IndexedDB & LocalStorage)
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

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          {statusMessage && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Current Storage Health Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cơ chế lưu trữ tự động: ĐANG HOẠT ĐỘNG
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                An toàn 100%
              </span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              Mỗi khi bạn <b>thêm điểm cống mới, cập nhật tình trạng, chụp hoặc tải ảnh HEIC/JPG</b>, hệ thống sẽ tự động lưu ngay lập tức vào cơ sở dữ liệu IndexedDB của trình duyệt. Dữ liệu không bị mất khi tải lại trang (F5) hoặc tắt trình duyệt.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Tổng số điểm cống đã lưu:</div>
                <div className="text-sm font-bold text-blue-400 mt-0.5">{points.length} vị trí</div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400">Lần lưu tự động gần nhất:</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lastSavedTime || 'Vừa xong'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Export / Backup Options */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 block">
              Tùy chọn sao lưu an toàn ra file máy:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2.5 rounded-xl flex items-center gap-2.5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Tải file Backup JSON</div>
                  <div className="text-[10px] text-slate-400">Bao gồm toàn bộ ảnh & ghi chú</div>
                </div>
              </button>

              <button
                onClick={handleExportCSV}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-2.5 rounded-xl flex items-center gap-2.5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Tải file CSV Sheets</div>
                  <div className="text-[10px] text-slate-400">Mở trên Google Sheets, Excel</div>
                </div>
              </button>
            </div>
          </div>

          {/* Import / Restore Section */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Khôi phục từ file JSON</span>
            </button>

            <button
              onClick={handleReset}
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục dữ liệu mẫu ban đầu</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

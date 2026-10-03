import React from 'react';
import { DrainPoint, FloodSimulationParams } from '../types';
import {
  Waves,
  FileSpreadsheet,
  Plus,
  CloudRain,
  Download,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  HardDrive,
  Camera,
  Dice5
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL } from '../data/initialPoints';

interface HeaderProps {
  points: DrainPoint[];
  onOpenAddModal: () => void;
  onOpenSyncModal: () => void;
  onOpenFloodModal: () => void;
  onOpenStorageModal?: () => void;
  onOpenGalleryModal?: () => void;
  onOpenJpgRandomModal?: () => void;
  onExportCSV: () => void;
  floodSimulation: FloodSimulationParams;
  lastSavedTime?: string;
}

export const Header: React.FC<HeaderProps> = ({
  points,
  onOpenAddModal,
  onOpenSyncModal,
  onOpenFloodModal,
  onOpenStorageModal,
  onOpenGalleryModal,
  onOpenJpgRandomModal,
  onExportCSV,
  floodSimulation,
  lastSavedTime
}) => {
  const normalCount = points.filter((p) => p.TinhTrang === 'Bình thường').length;
  const trashCount = points.filter((p) => p.TinhTrang === 'Có rác').length;
  const coveredCount = points.filter((p) => p.TinhTrang === 'Bị lấp kín').length;
  const blockedCount = points.filter((p) => p.TinhTrang === 'Tắc nghẽn').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-lg z-20">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Waves className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight">
              DrainMap Vũng Tàu
            </h1>
            <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
              Khảo sát cống & Cảnh báo ngập
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1">
            Phường Phước Thắng • Phường Tam Thắng (TP. Vũng Tàu)
          </p>
        </div>
      </div>

      {/* Realtime KPI Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={onOpenStorageModal}
          title="Bấm để xem chi tiết lưu trữ & sao lưu dữ liệu"
          className="bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-slate-300 transition-colors cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white">{points.length}</span>
          <span className="text-slate-400 text-[11px] group-hover:text-slate-200">điểm (Đã lưu 💾)</span>
        </button>

        <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold">{normalCount}</span>
          <span className="text-emerald-400/80 text-[11px] hidden sm:inline">bình thường</span>
        </div>

        <div className="bg-amber-950/60 border border-amber-800/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-amber-300">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">{trashCount}</span>
          <span className="text-amber-400/80 text-[11px] hidden sm:inline">có rác</span>
        </div>

        <div className="bg-orange-950/60 border border-orange-800/60 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-orange-300">
          <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-bold">{coveredCount}</span>
          <span className="text-orange-400/80 text-[11px] hidden sm:inline">bị lấp kín</span>
        </div>

        <div className="bg-rose-950/80 border border-rose-700/80 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs text-rose-300 animate-pulse">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span className="font-bold">{blockedCount}</span>
          <span className="text-rose-400/90 text-[11px]">tắc nghẽn</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        {/* Storage & Backup Details Button */}
        {onOpenStorageModal && (
          <button
            onClick={onOpenStorageModal}
            title="Quản lý sao lưu & kiểm tra bộ nhớ đã lưu"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Bộ nhớ</span>
          </button>
        )}

        {/* Field Survey Photos Gallery (26 photos) */}
        {onOpenGalleryModal && (
          <button
            id="field-survey-gallery-btn"
            onClick={onOpenGalleryModal}
            title="Xem toàn bộ 26 ảnh khảo sát hiện trường hệ thống cống Vũng Tàu"
            className="bg-sky-950/90 hover:bg-sky-900 text-sky-200 hover:text-white px-2.5 py-1.5 rounded-lg border border-sky-600/50 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            <span>26 Ảnh khảo sát</span>
          </button>
        )}

        {/* Batch JPG Random Upload & Distribution */}
        {onOpenJpgRandomModal && (
          <button
            id="batch-jpg-random-btn"
            onClick={onOpenJpgRandomModal}
            title="Tải ảnh đuôi JPG lên và random ngẫu nhiên vào các điểm cống (Phường Phước Thắng & Tam Thắng)"
            className="bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 text-white px-2.5 py-1.5 rounded-lg border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm shadow-amber-600/20 cursor-pointer animate-pulse"
          >
            <Dice5 className="w-3.5 h-3.5 text-amber-200" />
            <span>🎲 Tải ảnh JPG Random</span>
          </button>
        )}

        {/* Google Drive Link */}
        <a
          id="google-drive-link-btn"
          href={GOOGLE_DRIVE_FOLDER_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Mở thư mục ảnh khảo sát thực tế trên Google Drive"
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Thư mục Drive</span>
        </a>

        {/* Flood Alert Simulation Button */}
        <button
          id="flood-simulation-trigger-btn"
          onClick={onOpenFloodModal}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border whitespace-nowrap ${
            floodSimulation.simulationActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-600/30 animate-pulse'
              : 'bg-sky-950/90 hover:bg-sky-900 text-sky-200 border-sky-600/50'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>
            {floodSimulation.simulationActive ? 'Mô phỏng ngập: ĐANG BẬT' : 'Cảnh báo ngập lụt'}
          </span>
        </button>

        {/* Google Sheets Sync Button */}
        <button
          id="google-sheets-sync-btn"
          onClick={onOpenSyncModal}
          className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-600/60 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shadow-sm"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Sheets</span>
        </button>

        {/* Export CSV */}
        <button
          id="export-csv-btn"
          onClick={onExportCSV}
          title="Xuất file CSV chuẩn Google Sheets"
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Add New Point Button */}
        <button
          id="add-survey-point-btn"
          onClick={onOpenAddModal}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm cống mới</span>
        </button>
      </div>
    </header>
  );
};

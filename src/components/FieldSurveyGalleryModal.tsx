import React, { useState, useMemo } from 'react';
import { DrainPoint, SurveyPhotoItem, LoaiCong, TinhTrang } from '../types';
import { SURVEY_PHOTOS_26, GOOGLE_DRIVE_FOLDER_URL } from '../data/initialPoints';
import {
  X,
  Camera,
  MapPin,
  ExternalLink,
  FolderOpen,
  Search,
  Filter,
  Check,
  Copy,
  Download,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Layers,
  Dice5
} from 'lucide-react';

interface FieldSurveyGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: DrainPoint[];
  onSelectPoint: (point: DrainPoint) => void;
  onApplyPhotoToPoint?: (pointId: string, photoUrl: string) => void;
  onOpenJpgRandomModal?: () => void;
}

export const FieldSurveyGalleryModal: React.FC<FieldSurveyGalleryModalProps> = ({
  isOpen,
  onClose,
  points,
  onSelectPoint,
  onApplyPhotoToPoint,
  onOpenJpgRandomModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('Tất cả');
  const [selectedType, setSelectedType] = useState<string>('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tất cả');
  const [activePhoto, setActivePhoto] = useState<SurveyPhotoItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic area list from the 26 photos
  const areaOptions = useMemo(() => {
    const list = Array.from(new Set(SURVEY_PHOTOS_26.map((p) => p.khuVuc)));
    return ['Tất cả', ...list];
  }, []);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    return SURVEY_PHOTOS_26.filter((photo) => {
      // Area match
      if (selectedArea !== 'Tất cả' && photo.khuVuc !== selectedArea) {
        return false;
      }
      // Type match
      if (selectedType !== 'Tất cả' && photo.loaiCong !== selectedType) {
        return false;
      }
      // Status match
      if (selectedStatus !== 'Tất cả' && photo.tinhTrang !== selectedStatus) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = photo.title.toLowerCase().includes(q);
        const matchArea = photo.khuVuc.toLowerCase().includes(q);
        const matchDesc = photo.moTa.toLowerCase().includes(q);
        const matchId = photo.id.toLowerCase().includes(q);
        if (!matchTitle && !matchArea && !matchDesc && !matchId) return false;
      }
      return true;
    });
  }, [searchQuery, selectedArea, selectedType, selectedStatus]);

  if (!isOpen) return null;

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGoToPoint = (pointId: string) => {
    const found = points.find((p) => p.id === pointId);
    if (found) {
      onSelectPoint(found);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Bộ sưu tập 26 Ảnh Khảo Sát Hiện Trường
                </h2>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  26 ảnh thực tế
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  TP. Vũng Tàu
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toàn bộ ảnh chụp thực tế hệ thống cống thoát nước tại các khu vực trọng điểm ngập úng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenJpgRandomModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenJpgRandomModal();
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-600/20 cursor-pointer"
                title="Tải ảnh JPG lên hoặc random vào các điểm cống"
              >
                <Dice5 className="w-3.5 h-3.5 text-amber-200" />
                <span className="hidden sm:inline">Random ảnh JPG vào cống</span>
                <span className="sm:hidden">Random JPG</span>
              </button>
            )}

            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              title="Mở thư mục Google Drive lưu trữ ảnh khảo sát gốc"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Drive ảnh gốc</span>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/60 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ảnh theo Phường Phước Thắng, Tam Thắng, mã ảnh, tình trạng..."
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Area select */}
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {areaOptions.map((area) => (
                  <option key={area} value={area}>
                    Khu vực: {area}
                  </option>
                ))}
              </select>

              {/* Status select */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Tất cả">Tất cả tình trạng</option>
                <option value="Bình thường">🟢 Bình thường</option>
                <option value="Có rác">🟡 Có rác / lá</option>
                <option value="Bị lấp kín">🟠 Bị lấp kín</option>
                <option value="Tắc nghẽn">🔴 Tắc nghẽn</option>
              </select>

              {/* Type select */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Tất cả">Tất cả loại cống</option>
                <option value="Hàm ếch">🕳️ Hàm ếch</option>
                <option value="Mặt đường">▦ Mặt đường</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Hiển thị <strong className="text-sky-300">{filteredPhotos.length}</strong> / 26 ảnh khảo sát hiện trường
            </span>
            {(selectedArea !== 'Tất cả' || selectedStatus !== 'Tất cả' || selectedType !== 'Tất cả' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedArea('Tất cả');
                  setSelectedStatus('Tất cả');
                  setSelectedType('Tất cả');
                  setSearchQuery('');
                }}
                className="text-xs text-sky-400 hover:text-sky-300 underline font-medium"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 bg-slate-950/40">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-16">
              <Camera className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-300">Không tìm thấy ảnh phù hợp</div>
              <p className="text-xs text-slate-500 mt-1">
                Thử chọn khu vực khác hoặc bấm "Đặt lại bộ lọc"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPhotos.map((photo) => {
                const linkedPoint = points.find((p) => p.id === photo.pointId);

                let statusColor = '#22c55e';
                let statusBg = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                if (photo.tinhTrang === 'Có rác') {
                  statusColor = '#eab308';
                  statusBg = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                } else if (photo.tinhTrang === 'Bị lấp kín') {
                  statusColor = '#f97316';
                  statusBg = 'bg-orange-500/10 text-orange-300 border-orange-500/30';
                } else if (photo.tinhTrang === 'Tắc nghẽn') {
                  statusColor = '#ef4444';
                  statusBg = 'bg-rose-500/10 text-rose-300 border-rose-500/30';
                }

                return (
                  <div
                    key={photo.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all flex flex-col group"
                  >
                    {/* Image Thumbnail with Overlay */}
                    <div className="relative h-44 w-full bg-slate-950 overflow-hidden cursor-pointer">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onClick={() => setActivePhoto(photo)}
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${statusBg}`}>
                          {photo.tinhTrang}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-900/80 text-slate-300 border-slate-700 backdrop-blur-md">
                          {photo.loaiCong}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-mono bg-black/70 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {photo.id}
                        </span>
                      </div>

                      {/* Quick click zoom button */}
                      <button
                        onClick={() => setActivePhoto(photo)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-semibold text-xs backdrop-blur-[1px]"
                      >
                        <Eye className="w-4 h-4 text-sky-300" />
                        <span>Xem chi tiết ảnh</span>
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{photo.khuVuc}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white mt-1 line-clamp-1 group-hover:text-sky-300 transition-colors">
                          {photo.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {photo.moTa}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(photo.url, photo.id)}
                          className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1"
                          title="Sao chép liên kết ảnh"
                        >
                          {copiedId === photo.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>

                        {linkedPoint && (
                          <button
                            type="button"
                            onClick={() => handleGoToPoint(linkedPoint.id)}
                            className="text-[11px] bg-sky-600 hover:bg-sky-500 text-white font-medium px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            title={`Xem điểm cống ${linkedPoint.id} trên bản đồ`}
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Vị trí cống {linkedPoint.id}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>26 ảnh khảo sát hiện trường chuẩn hóa cho hệ thống Vũng Tàu DrainMap</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Thư mục Drive đầy đủ</span>
            </a>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Active Photo */}
      {activePhoto && (
        <div className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="relative max-w-4xl w-full flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="min-w-0 pr-3">
                <span className="text-[11px] text-sky-400 font-mono">{activePhoto.id} • {activePhoto.khuVuc}</span>
                <h3 className="text-sm font-bold text-white truncate">{activePhoto.title}</h3>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-[68vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">Tình trạng: {activePhoto.tinhTrang}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300">Loại cống: {activePhoto.loaiCong}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{activePhoto.moTa}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(activePhoto.url, activePhoto.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedId === activePhoto.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã copy link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy link ảnh</span>
                    </>
                  )}
                </button>

                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3.5 py-1.5 rounded-xl font-semibold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem ảnh gốc</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

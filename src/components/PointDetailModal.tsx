import React, { useState, useRef, useEffect } from 'react';
import { DrainPoint, TinhTrang, LoaiCong, SurveyPhotoItem } from '../types';
import {
  X,
  MapPin,
  ExternalLink,
  FolderOpen,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Compass,
  Trash2,
  Camera,
  Upload,
  Link,
  RotateCcw,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Smartphone,
  Edit3,
  Save,
  Building2,
  Eye,
  Layers,
  Plus
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL, SURVEY_PHOTOS_26 } from '../data/initialPoints';
import { processImageFile, isHeicFile } from '../utils/imageHelper';

interface PointDetailModalProps {
  point: DrainPoint | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: TinhTrang) => void;
  onUpdateImage: (id: string, newImageUrl: string) => void;
  onUpdatePoint?: (updatedPoint: DrainPoint) => void;
  onDeletePoint: (id: string) => void;
  onOpenGalleryModal?: () => void;
}

const KHU_VUC_OPTIONS = [
  'Phường Phước Thắng',
  'Phường Tam Thắng'
];

// Filter areas for the 26 field survey photos
const SURVEY_AREAS_FILTER = [
  'Tất cả',
  'Phường Phước Thắng',
  'Phường Tam Thắng'
];

export const PointDetailModal: React.FC<PointDetailModalProps> = ({
  point,
  onClose,
  onUpdateStatus,
  onUpdateImage,
  onUpdatePoint,
  onDeletePoint,
  onOpenGalleryModal
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string>('');
  const [selectedCatalogArea, setSelectedCatalogArea] = useState<string>('Tất cả');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Name and area editing state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTenViTri, setEditTenViTri] = useState(point?.TenViTri || '');
  const [editKhuVuc, setEditKhuVuc] = useState(point?.KhuVuc || 'Phường Phước Thắng');
  const [editLoaiCong, setEditLoaiCong] = useState<LoaiCong>(point?.LoaiCong || 'Hàm ếch');
  const [editViDo, setEditViDo] = useState(point ? String(point.ViDo) : '');
  const [editKinhDo, setEditKinhDo] = useState(point ? String(point.KinhDo) : '');
  const [editGhiChu, setEditGhiChu] = useState(point?.GhiChu || '');

  // Synchronize edit fields when point changes
  useEffect(() => {
    if (point) {
      setEditTenViTri(point.TenViTri);
      setEditKhuVuc(point.KhuVuc || 'Phường Phước Thắng');
      setEditLoaiCong(point.LoaiCong);
      setEditViDo(String(point.ViDo));
      setEditKinhDo(String(point.KinhDo));
      setEditGhiChu(point.GhiChu || '');
      setIsEditingDetails(false);
      setIsEditingImage(false);
      setPreviewImage(null);
      setUploadMessage(null);
    }
  }, [point?.id]);

  if (!point) return null;

  // Handle saving modified name, area, notes, coords
  const handleSaveDetails = () => {
    if (!editTenViTri.trim()) {
      alert('Vui lòng nhập tên điểm khảo sát cống.');
      return;
    }

    const lat = parseFloat(editViDo);
    const lng = parseFloat(editKinhDo);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Tọa độ Vĩ độ và Kinh độ không hợp lệ.');
      return;
    }

    const updated: DrainPoint = {
      ...point,
      TenViTri: editTenViTri.trim(),
      KhuVuc: editKhuVuc,
      LoaiCong: editLoaiCong,
      ViDo: lat,
      KinhDo: lng,
      GhiChu: editGhiChu.trim(),
      NgayCapNhat: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    if (onUpdatePoint) {
      onUpdatePoint(updated);
    }
    setIsEditingDetails(false);
  };

  // Convert Google Drive share link to direct image display URL
  const formatGoogleDriveUrl = (url: string): string => {
    const trimmed = url.trim();
    const driveMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    return trimmed;
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${point.ViDo}, ${point.KinhDo}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMapsDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.ViDo},${point.KinhDo}`;
    window.open(url, '_blank');
  };

  // Handle local image file upload (supporting batch multi-file upload, HEIC from iPhone, JPG, PNG, WebP)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsConverting(true);
      setConversionStatus(`Đang chuẩn bị xử lý ${files.length} ảnh khảo sát...`);

      const processedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isHeic = isHeicFile(file);
        setConversionStatus(
          `Đang xử lý ảnh ${i + 1}/${files.length}: ${file.name}${isHeic ? ' (chuyển đổi iPhone HEIC)' : ''}...`
        );
        const result = await processImageFile(file);
        processedUrls.push(result.dataUrl);
      }

      if (processedUrls.length > 0) {
        const primary = processedUrls[0];
        setPreviewImage(primary);
        setImageUrlInput(primary);

        const currentList = point.HinhAnhDanhSach || (point.HinhAnh ? [point.HinhAnh] : []);
        const updatedList = Array.from(new Set([...currentList, ...processedUrls]));

        const updated: DrainPoint = {
          ...point,
          HinhAnh: primary,
          HinhAnhDanhSach: updatedList,
          NgayCapNhat: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };

        if (onUpdatePoint) {
          onUpdatePoint(updated);
        } else {
          onUpdateImage(point.id, primary);
        }

        setUploadMessage(`✅ Đã lưu ${processedUrls.length} ảnh khảo sát mới vào thiết bị!`);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh:', err);
      alert(err.message || 'Lỗi khi xử lý hình ảnh');
      setUploadMessage(null);
    } finally {
      setIsConverting(false);
      setConversionStatus('');
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyNewImage = () => {
    const finalUrl = previewImage || formatGoogleDriveUrl(imageUrlInput);
    if (!finalUrl.trim()) {
      alert('Vui lòng tải ảnh lên hoặc nhập đường link hình ảnh.');
      return;
    }

    const currentList = point.HinhAnhDanhSach || (point.HinhAnh ? [point.HinhAnh] : []);
    const updatedList = Array.from(new Set([finalUrl.trim(), ...currentList]));

    const updated: DrainPoint = {
      ...point,
      HinhAnh: finalUrl.trim(),
      HinhAnhDanhSach: updatedList,
      NgayCapNhat: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    if (onUpdatePoint) {
      onUpdatePoint(updated);
    } else {
      onUpdateImage(point.id, finalUrl.trim());
    }

    setIsEditingImage(false);
    setUploadMessage(null);
  };

  const handleRemoveImage = () => {
    if (confirm('Bạn có chắc muốn xóa ảnh hiện tại của tuyến đường này?')) {
      onUpdateImage(point.id, '');
      setPreviewImage(null);
      setImageUrlInput('');
      setIsEditingImage(false);
    }
  };

  const statusBg =
    point.TinhTrang === 'Tắc nghẽn'
      ? 'bg-red-500/20 text-red-300 border-red-500/40'
      : point.TinhTrang === 'Bị lấp kín'
      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
      : point.TinhTrang === 'Có rác'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  const allPointPhotos = point.HinhAnhDanhSach && point.HinhAnhDanhSach.length > 0
    ? point.HinhAnhDanhSach
    : (point.HinhAnh ? [point.HinhAnh] : []);

  const catalogFilteredPhotos = selectedCatalogArea === 'Tất cả'
    ? SURVEY_PHOTOS_26
    : SURVEY_PHOTOS_26.filter((p) => p.khuVuc === selectedCatalogArea);

  const currentDisplayImage = isEditingImage
    ? previewImage || point.HinhAnh
    : previewImage || point.HinhAnh;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBg}`}>
                {point.TinhTrang}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                {point.LoaiCong === 'Hàm ếch' ? '🕳️ Cống hàm ếch (Cửa thu vỉa hè)' : '▦ Cống mặt đường (Song chắn rác)'}
              </span>
              {point.KhuVuc && (
                <span className="text-xs text-blue-400 font-medium">
                  {point.KhuVuc}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white leading-tight">
                {point.TenViTri}
              </h2>
              <button
                id="btn-edit-point-address"
                onClick={() => setIsEditingDetails(!isEditingDetails)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Bấm để chỉnh sửa tên điểm cống hoặc khu vực"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEditingDetails ? 'Đóng bộ sửa' : '✏️ Đổi thông tin, tên'}</span>
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* EDIT DETAILS PANEL */}
          {isEditingDetails && (
            <div className="bg-slate-950 border border-amber-500/60 rounded-xl p-3.5 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  Chỉnh sửa tên điểm khảo sát cống:
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {point.id}</span>
              </div>

              {/* Input TenViTri */}
              <div>
                <label className="text-[11px] font-semibold text-slate-200 block mb-1">
                  Tên Vị Trí / Điểm Khảo Sát <span className="text-rose-400">*</span>:
                </label>
                <input
                  id="input-edit-ten-vi-tri"
                  type="text"
                  value={editTenViTri}
                  onChange={(e) => setEditTenViTri(e.target.value)}
                  placeholder="VD: Điểm cống số 01 - Phường Phước Thắng..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Select KhuVuc */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-200 block mb-1">
                    Khu vực phường:
                  </label>
                  <select
                    id="select-edit-khu-vuc"
                    value={editKhuVuc}
                    onChange={(e) => setEditKhuVuc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    {KHU_VUC_OPTIONS.map((kv) => (
                      <option key={kv} value={kv}>{kv}</option>
                    ))}
                  </select>
                </div>

                {/* LoaiCong */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-200 block mb-1">
                    Loại cống:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Hàm ếch', 'Mặt đường'] as const).map((lc) => (
                      <button
                        key={lc}
                        type="button"
                        onClick={() => setEditLoaiCong(lc)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          editLoaiCong === lc
                            ? 'bg-amber-600 border-amber-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {lc === 'Hàm ếch' ? '🕳️ Hàm ếch' : '▦ Mặt đường'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Vĩ độ (ViDo):</label>
                  <input
                    type="number"
                    step="any"
                    value={editViDo}
                    onChange={(e) => setEditViDo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Kinh độ (KinhDo):</label>
                  <input
                    type="number"
                    step="any"
                    value={editKinhDo}
                    onChange={(e) => setEditKinhDo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* GhiChu */}
              <div>
                <label className="text-[11px] font-semibold text-slate-200 block mb-1">
                  Ghi chú hiện trường:
                </label>
                <input
                  type="text"
                  value={editGhiChu}
                  onChange={(e) => setEditGhiChu(e.target.value)}
                  placeholder="Ghi chú về nắp cống, rác thải, bùn đọng..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingDetails(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  id="btn-save-address-changes"
                  type="button"
                  onClick={handleSaveDetails}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu thay đổi thông tin</span>
                </button>
              </div>
            </div>
          )}
          {/* Photo Section with 26-Photo Catalog & Multi-Upload Action */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  Ảnh khảo sát hiện trường
                </span>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">
                  {allPointPhotos.length} ảnh vị trí này
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenGalleryModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenGalleryModal();
                    }}
                    className="bg-sky-950/90 hover:bg-sky-900 text-sky-300 border border-sky-600/40 text-[11px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Mở thư viện 26 ảnh khảo sát hiện trường toàn thành phố"
                  >
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    <span>Xem 26 ảnh khảo sát</span>
                  </button>
                )}

                <button
                  id="toggle-edit-image-btn"
                  onClick={() => {
                    setIsEditingImage(!isEditingImage);
                    setPreviewImage(point.HinhAnh || null);
                    setImageUrlInput(point.HinhAnh || '');
                  }}
                  className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEditingImage ? 'Đóng bộ sửa ảnh' : 'Đổi ảnh / Thêm ảnh'}</span>
                </button>
              </div>
            </div>

            {/* Photo Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
              {currentDisplayImage ? (
                <div className="relative cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                  <img
                    src={currentDisplayImage}
                    alt={`Ảnh chụp cống tại ${point.TenViTri}`}
                    className="w-full h-56 object-cover transition-transform group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs backdrop-blur-[1px]">
                    <Eye className="w-4 h-4 text-sky-300" />
                    <span>Bấm để phóng to toàn màn hình</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-44 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                  <FolderOpen className="w-10 h-10 mb-2 opacity-50" />
                  <span className="text-xs">Chưa có ảnh khảo sát trực tiếp</span>
                  <button
                    onClick={() => {
                      setIsEditingImage(true);
                      fileInputRef.current?.click();
                    }}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    Bấm vào đây để tải ảnh lên ngay
                  </button>
                </div>
              )}

              {/* Google Drive Link button */}
              <div className="absolute bottom-2 right-2 flex items-center gap-2 pointer-events-auto">
                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-900/90 hover:bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 shadow-lg flex items-center gap-1.5 backdrop-blur-sm"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Drive ảnh khảo sát</span>
                </a>
              </div>
            </div>

            {/* Multi-Photo Thumbnail Bar for this point */}
            {allPointPhotos.length > 1 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    Các góc ảnh khảo sát tại vị trí này ({allPointPhotos.length} ảnh):
                  </span>
                  <span className="text-[10px] text-slate-500">Bấm ảnh để chuyển góc nhìn</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allPointPhotos.map((url, idx) => {
                    const isMain = point.HinhAnh === url;
                    const isSelected = currentDisplayImage === url;
                    return (
                      <div key={`${url}-${idx}`} className="relative shrink-0 group/item">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(url);
                          }}
                          className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all block ${
                            isSelected
                              ? 'border-sky-400 ring-2 ring-sky-500/50 scale-105'
                              : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Ảnh ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        {isMain ? (
                          <span className="absolute -top-1.5 -left-1 bg-emerald-600 text-white text-[9px] px-1 rounded-full font-bold shadow">
                            Chính
                          </span>
                        ) : (
                          <button
                            type="button"
                            title="Đặt làm ảnh chính"
                            onClick={() => {
                              const updated: DrainPoint = {
                                ...point,
                                HinhAnh: url,
                                NgayCapNhat: new Date().toISOString().slice(0, 16).replace('T', ' ')
                              };
                              if (onUpdatePoint) onUpdatePoint(updated);
                              else onUpdateImage(point.id, url);
                            }}
                            className="absolute bottom-0 right-0 bg-slate-900/90 text-amber-300 hover:text-white text-[9px] px-1 rounded font-bold opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            ⭐
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* EXPANDABLE IMAGE EDITOR PANEL */}
            {isEditingImage && (
              <div className="bg-slate-950/90 border border-blue-500/40 rounded-xl p-3.5 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-blue-400" />
                    Cập nhật hình ảnh mới cho con đường / khu vực này:
                  </span>
                  {uploadMessage && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {uploadMessage}
                    </span>
                  )}
                </div>

                {/* Method A: Upload File / Camera / iPhone HEIC (Multi-Upload Support) */}
                <div className="space-y-2">
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif,.HEIC,.HEIF"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      id="btn-upload-device-photo"
                      type="button"
                      disabled={isConverting}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      {isConverting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isConverting ? 'Đang chuyển đổi...' : 'Tải ảnh từ máy / Chụp ảnh (hỗ trợ chọn nhiều ảnh)'}</span>
                    </button>

                    {/* HEIC iPhone format badge */}
                    <span className="text-[10px] bg-slate-900 border border-slate-700 text-sky-300 px-2 py-1 rounded-md flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-sky-400" />
                      Hỗ trợ ảnh iPhone (HEIC/HEIF), JPG, PNG
                    </span>

                    {point.HinhAnh && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 rounded-lg hover:bg-rose-950/40 transition-colors ml-auto"
                      >
                        Xóa ảnh hiện tại
                      </button>
                    )}
                  </div>

                  {/* Processing / Converting Indicator Banner */}
                  {isConverting && (
                    <div className="bg-blue-950/70 border border-blue-500/40 rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-blue-200 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-white">Đang xử lý ảnh...</div>
                        <div className="text-[11px] text-blue-300">{conversionStatus || 'Đang giải mã định dạng HEIC sang JPG...'}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Method B: URL input or Google Drive Link */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-medium block">
                    Hoặc dán đường link ảnh (URL web / link Google Drive):
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-point-image-url"
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => {
                        setImageUrlInput(e.target.value);
                        setPreviewImage(formatGoogleDriveUrl(e.target.value));
                      }}
                      placeholder="https://... hoặc https://drive.google.com/file/d/..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button
                      onClick={() => {
                        const formatted = formatGoogleDriveUrl(imageUrlInput);
                        setPreviewImage(formatted);
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      Xem thử
                    </button>
                  </div>
                </div>

                {/* Method C: Preset 26 Field Survey Photos */}
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-400" />
                      Chọn từ Bộ sưu tập 26 ảnh khảo sát hiện trường Vũng Tàu:
                    </span>
                    {onOpenGalleryModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingImage(false);
                          onOpenGalleryModal();
                        }}
                        className="text-[11px] text-sky-400 hover:text-sky-300 underline font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Mở toàn bộ 26 ảnh</span>
                      </button>
                    )}
                  </div>

                  {/* Area filter tabs for 26 photos */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                    {SURVEY_AREAS_FILTER.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => setSelectedCatalogArea(area)}
                        className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                          selectedCatalogArea === area
                            ? 'bg-sky-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>

                  {/* 26 photos grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {catalogFilteredPhotos.map((p) => {
                      const isSelected = previewImage === p.url || (point.HinhAnh === p.url && !previewImage);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPreviewImage(p.url);
                            setImageUrlInput(p.url);
                            setUploadMessage(`Đã chọn: ${p.title}`);
                          }}
                          className={`p-1.5 rounded-lg text-left text-[11px] border transition-all flex flex-col gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-sky-950/80 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="relative w-full h-16 rounded overflow-hidden bg-slate-950">
                            <img
                              src={p.url}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-black/80 text-sky-300 px-1 rounded font-mono">
                              {p.id}
                            </span>
                          </div>
                          <div className="truncate font-medium text-slate-200">{p.title}</div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-between">
                            <span className="truncate">{p.khuVuc}</span>
                            <span className="text-[9px] text-amber-300 font-semibold shrink-0">{p.tinhTrang}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsEditingImage(false);
                      setPreviewImage(null);
                      setUploadMessage(null);
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    id="btn-save-point-image"
                    onClick={handleApplyNewImage}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu ảnh vào cống này</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Coordinates & Location info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Tọa độ GPS (Vĩ độ, Kinh độ)
              </div>
              <div className="text-xs font-mono text-white flex items-center justify-between">
                <span>{point.ViDo}, {point.KinhDo}</span>
                <button
                  onClick={handleCopyCoords}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700"
                  title="Sao chép tọa độ"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Thời gian khảo sát gần nhất
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {point.NgayCapNhat}
              </div>
            </div>
          </div>

          {/* Hydrological & Drainage Stats */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Đánh giá thoát nước & Nguy cơ ngập úng
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Khả năng thoát</div>
                <div className="font-bold text-blue-400 text-sm mt-0.5">
                  {point.KhaNangThoatNuoc || '65%'}
                </div>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Nước/bùn đọng</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">
                  {point.ChieuSauNuocCm ?? 0} cm
                </div>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400">Mức độ cảnh báo</div>
                <div className={`font-bold text-sm mt-0.5 ${
                  point.TinhTrang === 'Tắc nghẽn' ? 'text-red-400' :
                  point.TinhTrang === 'Bị lấp kín' ? 'text-orange-400' :
                  point.TinhTrang === 'Có rác' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {point.MucDoNguyCo || 'Trung bình'}
                </div>
              </div>
            </div>

            {/* Field Notes */}
            <div className="mt-3 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-semibold text-slate-200">Ghi chú hiện trường: </span>
              {point.GhiChu || 'Cống cần kiểm tra định kỳ trước mùa mưa bão.'}
            </div>
          </div>

          {/* Change Status Fast Actions */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3">
            <div className="text-xs font-bold text-slate-300 mb-2">
              Cập nhật nhanh tình trạng cống:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Bình thường', 'Có rác', 'Bị lấp kín', 'Tắc nghẽn'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(point.id, st)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    point.TinhTrang === st
                      ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xóa điểm cống "${point.TenViTri}"?`)) {
                onDeletePoint(point.id);
                onClose();
              }
            }}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa điểm</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={openGoogleMapsDirections}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Chỉ đường</span>
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox full-size view */}
      {isLightboxOpen && currentDisplayImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[92vh] flex flex-col items-center">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2 text-xs font-bold flex items-center gap-1 bg-slate-900/80 rounded-lg px-2"
            >
              <X className="w-4 h-4" />
              <span>Đóng phóng to</span>
            </button>
            <img
              src={currentDisplayImage}
              alt={point.TenViTri}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl border border-slate-800"
            />
            <div className="mt-3 text-center bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-white block">📍 {point.TenViTri}</span>
              <span className="text-[11px] text-sky-400 font-medium">{point.KhuVuc} • {point.TinhTrang} • {point.LoaiCong}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

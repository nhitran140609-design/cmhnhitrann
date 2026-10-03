import React, { useState, useRef } from 'react';
import { DrainPoint } from '../types';
import { SURVEY_PHOTOS_26 } from '../data/initialPoints';
import { optimizeImageDataUrl, blobToDataURL } from '../utils/imageHelper';
import {
  X,
  Upload,
  Dice5,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  MapPin,
  RefreshCw,
  FolderOpen,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface BatchJpgRandomUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: DrainPoint[];
  onApplyRandomJpg: (updatedPoints: DrainPoint[], message: string) => void;
  onSelectPoint?: (point: DrainPoint) => void;
}

interface JpgItem {
  id: string;
  name: string;
  url: string;
  size?: number;
  source: 'upload' | 'survey_preset';
}

// 26 chuẩn ảnh JPG khảo sát hiện trường Vũng Tàu (buộc định dạng đuôi .jpg)
const DEFAULT_JPG_PRESETS: JpgItem[] = SURVEY_PHOTOS_26.map((p, idx) => ({
  id: `preset-jpg-${idx + 1}`,
  name: `anh_khao_sat_${(idx + 1).toString().padStart(2, '0')}.jpg`,
  // Thêm &fm=jpg để bảo đảm máy chủ trả về chuẩn JPG
  url: p.url.includes('&fm=jpg') ? p.url : `${p.url}&fm=jpg`,
  source: 'survey_preset'
}));

export const BatchJpgRandomUploadModal: React.FC<BatchJpgRandomUploadModalProps> = ({
  isOpen,
  onClose,
  points,
  onApplyRandomJpg,
  onSelectPoint
}) => {
  const [jpgList, setJpgList] = useState<JpgItem[]>(DEFAULT_JPG_PRESETS);
  const [targetScope, setTargetScope] = useState<'all' | 'phuoc_thang' | 'tam_thang'>('all');
  const [assignMode, setAssignMode] = useState<'replace_primary' | 'append_only'>('replace_primary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [distributionResult, setDistributionResult] = useState<{
    pointId: string;
    pointName: string;
    ward: string;
    photoUrl: string;
    photoName: string;
  }[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  // Xử lý nạp các file JPG từ thiết bị
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingStatus(`Đang đọc ${files.length} ảnh JPG từ thiết bị...`);

    const newItems: JpgItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const lowerName = file.name.toLowerCase();

      // Kiểm tra định dạng JPG / JPEG
      if (!lowerName.endsWith('.jpg') && !lowerName.endsWith('.jpeg') && file.type !== 'image/jpeg') {
        continue;
      }

      setProcessingStatus(`Đang tối ưu ảnh ${i + 1}/${files.length}: ${file.name}...`);

      try {
        const rawDataUrl = await blobToDataURL(file);
        // Tối ưu để kích thước vừa vặn cho lưu trữ IndexedDB không bị tràn bộ nhớ
        const optimizedUrl = await optimizeImageDataUrl(rawDataUrl, 1600, 0.85);

        newItems.push({
          id: `upload-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') ? file.name : `${file.name}.jpg`,
          url: optimizedUrl,
          size: file.size,
          source: 'upload'
        });
      } catch (err) {
        console.error('Lỗi nén ảnh JPG:', err);
      }
    }

    if (newItems.length > 0) {
      setJpgList((prev) => [...newItems, ...prev]);
    }

    setIsProcessing(false);
    setProcessingStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Khôi phục bộ 26 ảnh JPG hiện trường mẫu
  const handleResetToPresets = () => {
    setJpgList(DEFAULT_JPG_PRESETS);
    setDistributionResult(null);
  };

  // Xóa 1 ảnh khỏi danh sách chờ random
  const handleRemovePhoto = (id: string) => {
    setJpgList((prev) => prev.filter((item) => item.id !== id));
  };

  // Xóa toàn bộ ảnh trong danh sách
  const handleClearAll = () => {
    setJpgList([]);
    setDistributionResult(null);
  };

  // Thuật toán xáo trộn Fisher-Yates
  const shuffleArray = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Tiến hành Random và gán ảnh JPG vào các điểm cống
  const handleExecuteRandomize = () => {
    if (jpgList.length === 0) {
      alert('Vui lòng chọn hoặc nạp ít nhất một ảnh có đuôi .jpg để random!');
      return;
    }

    // Lọc danh sách điểm cống mục tiêu theo khu vực
    let targetPoints = points;
    if (targetScope === 'phuoc_thang') {
      targetPoints = points.filter((p) => p.KhuVuc === 'Phường Phước Thắng');
    } else if (targetScope === 'tam_thang') {
      targetPoints = points.filter((p) => p.KhuVuc === 'Phường Tam Thắng');
    }

    if (targetPoints.length === 0) {
      alert('Không tìm thấy điểm cống nào phù hợp với phạm vi đã chọn!');
      return;
    }

    // Xáo trộn ngẫu nhiên danh sách ảnh JPG
    const shuffledPhotos = shuffleArray(jpgList);

    const results: {
      pointId: string;
      pointName: string;
      ward: string;
      photoUrl: string;
      photoName: string;
    }[] = [];

    // Tạo bản đồ gán ngẫu nhiên
    const targetIds = new Set(targetPoints.map((p) => p.id));
    const nowTime = new Date().toISOString().slice(0, 16).replace('T', ' ');

    let photoIndex = 0;

    const updatedPoints = points.map((p) => {
      if (!targetIds.has(p.id)) {
        return p;
      }

      // Lấy ảnh ngẫu nhiên từ danh sách xáo trộn (quay vòng nếu ảnh ít hơn số điểm)
      const assignedPhoto = shuffledPhotos[photoIndex % shuffledPhotos.length];
      photoIndex++;

      results.push({
        pointId: p.id,
        pointName: p.TenViTri,
        ward: p.KhuVuc || 'Phường Phước Thắng',
        photoUrl: assignedPhoto.url,
        photoName: assignedPhoto.name
      });

      if (assignMode === 'replace_primary') {
        const existingList: string[] = Array.isArray(p.HinhAnhDanhSach)
          ? p.HinhAnhDanhSach.filter((u): u is string => typeof u === 'string')
          : [];
        const updatedList: string[] = [
          assignedPhoto.url,
          ...existingList.filter((u) => u !== assignedPhoto.url)
        ];
        const updatedItem: DrainPoint = {
          ...p,
          HinhAnh: assignedPhoto.url,
          HinhAnhDanhSach: updatedList,
          NgayCapNhat: nowTime
        };
        return updatedItem;
      } else {
        const existingList: string[] = Array.isArray(p.HinhAnhDanhSach)
          ? p.HinhAnhDanhSach.filter((u): u is string => typeof u === 'string')
          : (p.HinhAnh ? [p.HinhAnh] : []);
        const updatedList: string[] = existingList.includes(assignedPhoto.url)
          ? existingList
          : [...existingList, assignedPhoto.url];
        const updatedItem: DrainPoint = {
          ...p,
          HinhAnhDanhSach: updatedList,
          NgayCapNhat: nowTime
        };
        return updatedItem;
      }
    });

    setDistributionResult(results);

    const scopeName =
      targetScope === 'all'
        ? 'toàn bộ 26 điểm cống (Phường Phước Thắng & Phường Tam Thắng)'
        : targetScope === 'phuoc_thang'
        ? '13 điểm cống thuộc Phường Phước Thắng'
        : '13 điểm cống thuộc Phường Tam Thắng';

    const message = `🎉 Đã tải lên và random ngẫu nhiên ${results.length} ảnh JPG vào ${scopeName}!`;

    onApplyRandomJpg(updatedPoints, message);
  };

  const handleInspectPoint = (pointId: string) => {
    const found = points.find((p) => p.id === pointId);
    if (found && onSelectPoint) {
      onSelectPoint(found);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <Dice5 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Tải Ảnh Đuôi JPG Lên & Random Vào Các Điểm Cống
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Định dạng .JPG / .JPEG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tải lên nhiều ảnh JPG từ máy hoặc dùng bộ ảnh khảo sát để phân bổ ngẫu nhiên vào các điểm cống
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Section 1: Upload / Import JPG Files */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>1. Tải ảnh đuôi JPG từ máy tính hoặc dùng mẫu khảo sát</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToPresets}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  title="Nạp lại bộ 26 ảnh khảo sát hiện trường chuẩn JPG"
                >
                  <RefreshCw className="w-3 h-3 text-sky-400" />
                  <span>Dùng 26 ảnh khảo sát JPG mẫu</span>
                </button>
                {jpgList.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded-lg transition-colors"
                  >
                    Xóa hết ảnh ({jpgList.length})
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop Dropzone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                  : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/50 hover:bg-slate-900'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,image/jpeg"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />

              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Bấm để chọn nhiều ảnh đuôi <span className="text-amber-400 font-bold">.JPG / .JPEG</span> từ máy
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hoặc kéo thả hàng loạt file ảnh JPG vào đây (Hỗ trợ nén chất lượng cao tự động lưu vĩnh viễn)
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                    .JPG
                  </span>
                  <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                    .JPEG
                  </span>
                  <span className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                    Đang có {jpgList.length} ảnh trong hàng đợi
                  </span>
                </div>
              </div>
            </div>

            {isProcessing && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center gap-2 text-xs text-amber-200 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                <span>{processingStatus}</span>
              </div>
            )}

            {/* Preview Thumbnails */}
            {jpgList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Danh sách ảnh JPG sẵn sàng random ({jpgList.length} ảnh):</span>
                  <span>Cuộn để xem thêm</span>
                </div>
                <div className="max-h-36 overflow-y-auto grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
                  {jpgList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="group relative aspect-video sm:aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-amber-400 transition-all shadow-sm"
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(item.id);
                          }}
                          className="self-end text-rose-400 hover:text-white bg-black/60 rounded p-1"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] text-white truncate font-mono">
                          {item.name}
                        </span>
                      </div>
                      <span className="absolute bottom-0.5 left-0.5 text-[8px] font-mono bg-black/70 text-amber-300 px-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Distribution Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Scope */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>2. Phạm vi điểm cống nhận ảnh</span>
              </label>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="scope"
                    checked={targetScope === 'all'}
                    onChange={() => setTargetScope('all')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Tất cả điểm cống (Phước Thắng & Tam Thắng)</div>
                    <div className="text-[11px] text-slate-400">
                      Tổng số: {points.length} điểm cống được gán ngẫu nhiên
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="scope"
                    checked={targetScope === 'phuoc_thang'}
                    onChange={() => setTargetScope('phuoc_thang')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Chỉ Phường Phước Thắng</div>
                    <div className="text-[11px] text-slate-400">
                      {points.filter((p) => p.KhuVuc === 'Phường Phước Thắng').length} điểm cống
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="scope"
                    checked={targetScope === 'tam_thang'}
                    onChange={() => setTargetScope('tam_thang')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Chỉ Phường Tam Thắng</div>
                    <div className="text-[11px] text-slate-400">
                      {points.filter((p) => p.KhuVuc === 'Phường Tam Thắng').length} điểm cống
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Assign Mode */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>3. Phương thức gán ảnh</span>
              </label>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="assignMode"
                    checked={assignMode === 'replace_primary'}
                    onChange={() => setAssignMode('replace_primary')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Thay thế ảnh đại diện chính (HinhAnh)</div>
                    <div className="text-[11px] text-slate-400">
                      Hiển thị trực tiếp ảnh JPG mới trên bản đồ & danh sách điểm
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="assignMode"
                    checked={assignMode === 'append_only'}
                    onChange={() => setAssignMode('append_only')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-semibold text-white">Bổ sung vào album ảnh (HinhAnhDanhSach)</div>
                    <div className="text-[11px] text-slate-400">
                      Giữ nguyên ảnh cũ, bổ sung thêm ảnh JPG vào bộ sưu tập của cống
                    </div>
                  </div>
                </label>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-[11px] text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Dữ liệu ảnh tự động lưu vĩnh viễn vào IndexedDB & LocalStorage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              Hệ thống sẽ dùng thuật toán xáo trộn ngẫu nhiên để phân bố đồng đều các ảnh JPG.
            </div>

            <button
              id="btn-execute-random-jpg"
              type="button"
              onClick={handleExecuteRandomize}
              disabled={jpgList.length === 0 || isProcessing}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Dice5 className="w-5 h-5" />
              <span>🎲 Bắt đầu Random & Phân bổ {jpgList.length} ảnh JPG</span>
            </button>
          </div>

          {/* Section 4: Distribution Result Details */}
          {distributionResult && distributionResult.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-700/60 rounded-xl p-4 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Đã phân bổ ngẫu nhiên thành công vào {distributionResult.length} điểm cống:</span>
                </div>
                <span className="text-[11px] text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded-full border border-emerald-700/40">
                  Đã tự động lưu 💾
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/80">
                {distributionResult.map((res) => (
                  <div
                    key={res.pointId}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={res.photoUrl}
                        alt={res.photoName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {res.pointName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 truncate">
                          <span className="text-sky-300 font-mono">{res.pointId}</span>
                          <span>•</span>
                          <span>{res.ward}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-mono">{res.photoName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInspectPoint(res.pointId)}
                      className="shrink-0 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
                    >
                      <span>Xem điểm</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Chỉ áp dụng cho Phường Phước Thắng & Phường Tam Thắng
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

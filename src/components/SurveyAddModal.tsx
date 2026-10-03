import React, { useState } from 'react';
import { DrainPoint, LoaiCong, TinhTrang } from '../types';
import {
  X,
  MapPin,
  Camera,
  Navigation,
  FolderOpen,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Loader2,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { GOOGLE_DRIVE_FOLDER_URL, SURVEY_PHOTOS_26 } from '../data/initialPoints';
import { processImageFile, isHeicFile } from '../utils/imageHelper';

interface SurveyAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPoint: (point: DrainPoint) => void;
  onPickLocationOnMap: () => void;
  initialCoords?: { lat: number; lng: number } | null;
}

export const SurveyAddModal: React.FC<SurveyAddModalProps> = ({
  isOpen,
  onClose,
  onAddPoint,
  onPickLocationOnMap,
  initialCoords
}) => {
  const [tenViTri, setTenViTri] = useState('');
  const [viDo, setViDo] = useState(initialCoords?.lat ? String(initialCoords.lat) : '10.418500');
  const [kinhDo, setKinhDo] = useState(initialCoords?.lng ? String(initialCoords.lng) : '107.139500');
  const [loaiCong, setLoaiCong] = useState<LoaiCong>('Hàm ếch');
  const [tinhTrang, setTinhTrang] = useState<TinhTrang>('Có rác');
  const [hinhAnh, setHinhAnh] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [khuVuc, setKhuVuc] = useState('Phường Phước Thắng');
  const [ghiChu, setGhiChu] = useState('');
  const [ngayCapNhat, setNgayCapNhat] = useState(
    new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string>('');
  const [imageBadge, setImageBadge] = useState<string | null>(null);

  // Sync initialCoords if passed from map click
  React.useEffect(() => {
    if (initialCoords) {
      setViDo(String(initialCoords.lat));
      setKinhDo(String(initialCoords.lng));
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setViDo(pos.coords.latitude.toFixed(6));
        setKinhDo(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Không thể lấy tọa độ GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setIsConvertingImage(true);
      setConversionStatus(`Đang chuẩn bị xử lý ${files.length} ảnh khảo sát...`);

      const results: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isHeic = isHeicFile(file);
        setConversionStatus(
          `Đang xử lý ảnh ${i + 1}/${files.length}: ${file.name}${isHeic ? ' (chuyển đổi HEIC iPhone)' : ''}...`
        );
        const res = await processImageFile(file);
        results.push(res.dataUrl);
      }

      if (results.length > 0) {
        setHinhAnh(results[0]);
        setUploadedPhotos((prev) => Array.from(new Set([...prev, ...results])));
        setImageBadge(`Đã lưu ${results.length} ảnh khảo sát`);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh:', err);
      alert(err.message || 'Lỗi xử lý file ảnh');
      setImageBadge(null);
    } finally {
      setIsConvertingImage(false);
      setConversionStatus('');
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenViTri.trim()) {
      alert('Vui lòng nhập Tên đường / Vị trí cống.');
      return;
    }

    const lat = parseFloat(viDo);
    const lng = parseFloat(kinhDo);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Tọa độ Vĩ độ và Kinh độ không hợp lệ.');
      return;
    }

    let mucDoNguyCo: 'Thấp' | 'Trung bình' | 'Cao' | 'Báo động' = 'Thấp';
    if (tinhTrang === 'Tắc nghẽn') mucDoNguyCo = 'Báo động';
    else if (tinhTrang === 'Bị lấp kín') mucDoNguyCo = 'Cao';
    else if (tinhTrang === 'Có rác') mucDoNguyCo = 'Trung bình';

    const finalPhotoList = uploadedPhotos.length > 0
      ? (hinhAnh ? Array.from(new Set([hinhAnh, ...uploadedPhotos])) : uploadedPhotos)
      : (hinhAnh ? [hinhAnh] : []);

    const newPoint: DrainPoint = {
      id: `SURVEY-${Date.now().toString(36)}`,
      TenViTri: tenViTri.trim(),
      ViDo: lat,
      KinhDo: lng,
      LoaiCong: loaiCong,
      TinhTrang: tinhTrang,
      HinhAnh: hinhAnh.trim() || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      HinhAnhDanhSach: finalPhotoList,
      NgayCapNhat: ngayCapNhat,
      KhuVuc: khuVuc,
      GhiChu: ghiChu.trim() || `Khảo sát thực địa tại ${khuVuc}`,
      MucDoNguyCo: mucDoNguyCo,
      ChieuSauNuocCm: tinhTrang === 'Tắc nghẽn' ? 25 : tinhTrang === 'Bị lấp kín' ? 15 : tinhTrang === 'Có rác' ? 8 : 0,
      KhaNangThoatNuoc: tinhTrang === 'Tắc nghẽn' ? '10%' : tinhTrang === 'Bị lấp kín' ? '25%' : tinhTrang === 'Có rác' ? '60%' : '95%'
    };

    onAddPoint(newPoint);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Thêm Điểm Khảo Sát Cống Thoát Nước
              </h2>
              <p className="text-xs text-slate-400">
                Ghi nhận dữ liệu thực địa theo cấu trúc chuẩn Google Sheets
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* TenViTri */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tên Vị Trí / Điểm Khảo Sát <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={tenViTri}
              onChange={(e) => setTenViTri(e.target.value)}
              placeholder="VD: Điểm cống số 01 - Phường Phước Thắng"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Area Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Khu vực phường
            </label>
            <select
              value={khuVuc}
              onChange={(e) => setKhuVuc(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Phường Phước Thắng">Phường Phước Thắng</option>
              <option value="Phường Tam Thắng">Phường Tam Thắng</option>
            </select>
          </div>

          {/* Coordinates (ViDo & KinhDo) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Tọa độ địa lý (Vĩ độ - Kinh độ)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isLocating}
                  className="bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/50 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Đang lấy GPS...' : 'GPS hiện tại'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPickLocationOnMap();
                    onClose();
                  }}
                  className="bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-500/50 px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Chọn trên bản đồ</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Vĩ độ (ViDo)</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={viDo}
                  onChange={(e) => setViDo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Kinh độ (KinhDo)</span>
                <input
                  type="number"
                  step="any"
                  required
                  value={kinhDo}
                  onChange={(e) => setKinhDo(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* LoaiCong & TinhTrang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Loại cống (LoaiCong)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Hàm ếch', 'Mặt đường'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLoaiCong(type)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      loaiCong === type
                        ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {type === 'Hàm ếch' ? '🕳️ Hàm ếch' : '▦ Mặt đường'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tình trạng (TinhTrang)
              </label>
              <select
                value={tinhTrang}
                onChange={(e) => setTinhTrang(e.target.value as TinhTrang)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Bình thường">Bình thường</option>
                <option value="Có rác">Có rác</option>
                <option value="Bị lấp kín">Bị lấp kín</option>
                <option value="Tắc nghẽn">Tắc nghẽn</option>
              </select>
            </div>
          </div>

          {/* HinhAnh (Ảnh chụp cống) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Hình ảnh thực tế (HinhAnh)
              </label>
              <a
                href={GOOGLE_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3" />
                <span>Mở thư mục ảnh Drive</span>
              </a>
            </div>
            <input
              type="url"
              value={hinhAnh}
              onChange={(e) => setHinhAnh(e.target.value)}
              placeholder="Dán link ảnh chụp hoặc link Google Drive ảnh cống"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500 mb-2"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <label className={`cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${isConvertingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isConvertingImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  ) : (
                    <Camera className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span>{isConvertingImage ? 'Đang chuyển đổi HEIC...' : 'Tải ảnh từ máy / Chụp ảnh'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif,.HEIC,.HEIF"
                    onChange={handleImageFile}
                    disabled={isConvertingImage}
                    className="hidden"
                  />
                </label>

                {/* iPhone HEIC badge */}
                <span className="text-[10px] bg-slate-950 border border-slate-800 text-sky-300 px-2 py-1 rounded-md flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-sky-400" />
                  Hỗ trợ ảnh iPhone (HEIC), JPG, PNG
                </span>

                {hinhAnh && (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {imageBadge || 'Đã có ảnh'}
                  </span>
                )}
              </div>

              {/* Conversion notification */}
              {isConvertingImage && (
                <div className="bg-blue-950/70 border border-blue-500/40 rounded-lg p-2.5 flex items-center gap-2 text-xs text-blue-200 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                  <span>{conversionStatus || 'Đang giải mã và chuyển đổi ảnh HEIC sang JPG...'}</span>
                </div>
              )}

              {/* Small preview if image exists */}
              {hinhAnh && (
                <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 mt-1">
                  <img src={hinhAnh} alt="Xem trước" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setHinhAnh('');
                      setImageBadge(null);
                    }}
                    className="absolute top-1 right-1 bg-black/70 hover:bg-black text-rose-300 p-0.5 rounded text-[10px]"
                    title="Xóa ảnh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Quick Pick from 26 Field Survey Photos */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 block mb-1">
                  Hoặc chọn nhanh từ 26 ảnh khảo sát hiện trường Vũng Tàu:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
                  {SURVEY_PHOTOS_26.map((sp) => {
                    const isChosen = hinhAnh === sp.url;
                    return (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => {
                          setHinhAnh(sp.url);
                          setImageBadge(`Đã chọn: ${sp.title}`);
                        }}
                        className={`relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border transition-all text-left ${
                          isChosen
                            ? 'border-sky-400 ring-2 ring-sky-500/60 scale-105'
                            : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'
                        }`}
                        title={`${sp.title} (${sp.khuVuc})`}
                      >
                        <img src={sp.url} alt={sp.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-sky-200 px-1 truncate font-mono">
                          {sp.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* GhiChu & NgayCapNhat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Thời gian khảo sát (NgayCapNhat)
              </label>
              <input
                type="text"
                value={ngayCapNhat}
                onChange={(e) => setNgayCapNhat(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghi chú tình trạng hiện trường
              </label>
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Rác thải, nắp nứt, bùn đất đọng..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tự động lưu an toàn vào bộ nhớ máy</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Lưu & Ghi nhận điểm cống</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

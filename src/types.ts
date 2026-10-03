export type LoaiCong = 'Hàm ếch' | 'Mặt đường';

export type TinhTrang = 'Bình thường' | 'Có rác' | 'Bị lấp kín' | 'Tắc nghẽn';

export type MucDoNguyCo = 'Thấp' | 'Trung bình' | 'Cao' | 'Báo động';

export interface DrainPoint {
  id: string;
  TenViTri: string; // Tên điểm khảo sát cống (VD: Điểm cống số 01 - Phường Phước Thắng)
  ViDo: number; // Tọa độ Vĩ độ
  KinhDo: number; // Tọa độ Kinh độ
  LoaiCong: LoaiCong; // Hàm ếch hoặc Mặt đường
  TinhTrang: TinhTrang; // Bình thường, Có rác, Bị lấp kín, hoặc Tắc nghẽn
  HinhAnh?: string; // Link ảnh chụp thực tế cống chính
  HinhAnhDanhSach?: string[]; // Danh sách các ảnh chụp khảo sát hiện trường (đa ảnh)
  NgayCapNhat: string; // Thời gian ghi nhận dữ liệu gần nhất
  KhuVuc?: string; // Phường Phước Thắng hoặc Phường Tam Thắng
  GhiChu?: string;
  MucDoNguyCo?: MucDoNguyCo;
  ChieuSauNuocCm?: number;
  KhaNangThoatNuoc?: string;
  SoNhaTuyenDuong?: string;
}

export interface SurveyPhotoItem {
  id: string;
  pointId: string;
  title: string;
  khuVuc: string;
  url: string;
  loaiCong: LoaiCong;
  tinhTrang: TinhTrang;
  moTa: string;
}

export interface FilterState {
  searchQuery: string;
  tinhTrang: TinhTrang | 'Tất cả';
  loaiCong: LoaiCong | 'Tất cả';
  khuVuc: string;
  mucDoNguyCo: MucDoNguyCo | 'Tất cả';
}

export interface FloodSimulationParams {
  rainIntensityMm: number; // mm/h (0 - 150)
  tideLevelM: number; // mét (0 - 4.5m)
  simulationActive: boolean;
}

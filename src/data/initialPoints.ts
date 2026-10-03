import { DrainPoint, SurveyPhotoItem } from '../types';

export const INITIAL_DRAIN_POINTS: DrainPoint[] = [
  // ==================== PHƯỜNG PHƯỚC THẮNG (13 ĐIỂM) ====================
  {
    id: 'PT-01',
    TenViTri: 'Điểm cống số 01 - Phường Phước Thắng',
    ViDo: 10.4185,
    KinhDo: 107.1395,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Tắc nghẽn',
    HinhAnh: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 11:20',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Khu vực thấp trũng, bùn phù sa lắng dày hơn 35cm trong lòng cống thu nước.',
    MucDoNguyCo: 'Báo động',
    ChieuSauNuocCm: 28,
    KhaNangThoatNuoc: '10%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-02',
    TenViTri: 'Điểm cống số 02 - Phường Phước Thắng',
    ViDo: 10.4225,
    KinhDo: 107.1438,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-20 09:30',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Cống mặt đường có rác bao bì nilong vướng lưới thép chắn rác.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 7,
    KhaNangThoatNuoc: '60%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-03',
    TenViTri: 'Điểm cống số 03 - Phường Phước Thắng',
    ViDo: 10.4285,
    KinhDo: 107.1485,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Bình thường',
    HinhAnh: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 07:15',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Cống hộp đôi xả lũ vận hành trơn tru, đáy cống sạch, dòng chảy thông thoáng.',
    MucDoNguyCo: 'Thấp',
    ChieuSauNuocCm: 0,
    KhaNangThoatNuoc: '100%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-04',
    TenViTri: 'Điểm cống số 04 - Phường Phước Thắng',
    ViDo: 10.4150,
    KinhDo: 107.1360,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Bị lấp kín',
    HinhAnh: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-18 15:45',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Miệng cống bị đất cát san lấp mặt bằng tràn qua lấp kín miệng hố ga.',
    MucDoNguyCo: 'Cao',
    ChieuSauNuocCm: 16,
    KhaNangThoatNuoc: '25%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-05',
    TenViTri: 'Điểm cống số 05 - Phường Phước Thắng',
    ViDo: 10.4085,
    KinhDo: 107.1310,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 10:30',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Cống thoát nước khu đông dân cư có nhiều túi nilon và bùn đọng cục bộ.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 11,
    KhaNangThoatNuoc: '50%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-06',
    TenViTri: 'Điểm cống số 06 - Phường Phước Thắng',
    ViDo: 10.4120,
    KinhDo: 107.1345,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Tắc nghẽn',
    HinhAnh: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-20 08:30',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Khu vực tụ nước, rác bọc nilong và bùn đất bít kín 90% cửa thu nước hàm ếch.',
    MucDoNguyCo: 'Báo động',
    ChieuSauNuocCm: 25,
    KhaNangThoatNuoc: '10%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-07',
    TenViTri: 'Điểm cống số 07 - Phường Phước Thắng',
    ViDo: 10.4250,
    KinhDo: 107.1460,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-19 14:15',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Nắp cống song chắn rác bằng gang bị rác và bao bì đọng quanh mép lưới, cần nạo vét định kỳ.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 8,
    KhaNangThoatNuoc: '60%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-08',
    TenViTri: 'Điểm cống số 08 - Phường Phước Thắng',
    ViDo: 10.4198,
    KinhDo: 107.1415,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Bình thường',
    HinhAnh: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 10:00',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Cửa xả ra kênh rạch đã được nạo vét thông thoáng, nước rút nhanh khi có mưa rào.',
    MucDoNguyCo: 'Thấp',
    ChieuSauNuocCm: 0,
    KhaNangThoatNuoc: '95%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-09',
    TenViTri: 'Điểm cống số 09 - Phường Phước Thắng',
    ViDo: 10.4165,
    KinhDo: 107.1380,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Bị lấp kín',
    HinhAnh: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-18 16:20',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Bê tông xây gờ dốc lấn chiếm lấp một nửa miệng thu nước cống.',
    MucDoNguyCo: 'Cao',
    ChieuSauNuocCm: 15,
    KhaNangThoatNuoc: '25%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-10',
    TenViTri: 'Điểm cống số 10 - Phường Phước Thắng',
    ViDo: 10.4210,
    KinhDo: 107.1420,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Tắc nghẽn',
    HinhAnh: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 07:45',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Nắp cống đan bê tông bị nứt, rác sinh hoạt chèn đầy hố ga làm ứ đọng nước.',
    MucDoNguyCo: 'Báo động',
    ChieuSauNuocCm: 22,
    KhaNangThoatNuoc: '15%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-11',
    TenViTri: 'Điểm cống số 11 - Phường Phước Thắng',
    ViDo: 10.4270,
    KinhDo: 107.1472,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1508873696983-2df570464756?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1508873696983-2df570464756?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-20 15:10',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Cửa hàm ếch gom nước mưa đọng nhiều lá cây và bọc xốp sau trận mưa lớn.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 6,
    KhaNangThoatNuoc: '55%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-12',
    TenViTri: 'Điểm cống số 12 - Phường Phước Thắng',
    ViDo: 10.4105,
    KinhDo: 107.1330,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Bình thường',
    HinhAnh: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 09:15',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Vừa được đơn vị thoát nước nạo vét định kỳ, bùn cát đã dọn sạch.',
    MucDoNguyCo: 'Thấp',
    ChieuSauNuocCm: 0,
    KhaNangThoatNuoc: '90%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },
  {
    id: 'PT-13',
    TenViTri: 'Điểm cống số 13 - Phường Phước Thắng',
    ViDo: 10.4238,
    KinhDo: 107.1448,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Bị lấp kín',
    HinhAnh: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-17 11:30',
    KhuVuc: 'Phường Phước Thắng',
    GhiChu: 'Cát công trình xây dựng lân cận chảy vào lấp kín hoàn toàn miệng cống.',
    MucDoNguyCo: 'Cao',
    ChieuSauNuocCm: 18,
    KhaNangThoatNuoc: '20%',
    SoNhaTuyenDuong: 'Phường Phước Thắng'
  },

  // ==================== PHƯỜNG TAM THẮNG (13 ĐIỂM) ====================
  {
    id: 'TT-01',
    TenViTri: 'Điểm cống số 01 - Phường Tam Thắng',
    ViDo: 10.3475,
    KinhDo: 107.0862,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Tắc nghẽn',
    HinhAnh: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 14:10',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Khu vực mật độ đông, dầu mỡ vón cục gây tắc cống thu nước.',
    MucDoNguyCo: 'Báo động',
    ChieuSauNuocCm: 26,
    KhaNangThoatNuoc: '10%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-02',
    TenViTri: 'Điểm cống số 02 - Phường Tam Thắng',
    ViDo: 10.3425,
    KinhDo: 107.0895,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 06:30',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Cát mịn theo gió tấp vào miệng rãnh thu nước mặt đường.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 8,
    KhaNangThoatNuoc: '65%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-03',
    TenViTri: 'Điểm cống số 03 - Phường Tam Thắng',
    ViDo: 10.3512,
    KinhDo: 107.0845,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Bình thường',
    HinhAnh: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 16:00',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Hệ thống cống hộp thoát nước ra hồ điều hòa thông thoáng, nước chảy tốt.',
    MucDoNguyCo: 'Thấp',
    ChieuSauNuocCm: 0,
    KhaNangThoatNuoc: '95%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-04',
    TenViTri: 'Điểm cống số 04 - Phường Tam Thắng',
    ViDo: 10.3458,
    KinhDo: 107.0835,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Bị lấp kín',
    HinhAnh: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-19 10:25',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Tấm che bịt kín nắp cống để ngăn mùi bốc lên làm nước mưa không thoát được.',
    MucDoNguyCo: 'Cao',
    ChieuSauNuocCm: 14,
    KhaNangThoatNuoc: '20%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-05',
    TenViTri: 'Điểm cống số 05 - Phường Tam Thắng',
    ViDo: 10.3495,
    KinhDo: 107.0815,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 11:15',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Bùn và lá cây lấp hố ga gom nước mưa, lưu lượng tiêu thoát chậm.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 9,
    KhaNangThoatNuoc: '55%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-06',
    TenViTri: 'Điểm cống số 06 - Phường Tam Thắng',
    ViDo: 10.3530,
    KinhDo: 107.0870,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Tắc nghẽn',
    HinhAnh: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 16:30',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Điểm trũng ngập úng nghiêm trọng khi triều cường hoặc mưa trên 45 phút, rác dồn ứ ngẹt kín.',
    MucDoNguyCo: 'Báo động',
    ChieuSauNuocCm: 30,
    KhaNangThoatNuoc: '5%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-07',
    TenViTri: 'Điểm cống số 07 - Phường Tam Thắng',
    ViDo: 10.3440,
    KinhDo: 107.0880,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-19 13:40',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Miệng cống hàm ếch thu nước có nhiều cành cây khô và rác nhựa vương vãi.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 10,
    KhaNangThoatNuoc: '50%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-08',
    TenViTri: 'Điểm cống số 08 - Phường Tam Thắng',
    ViDo: 10.3555,
    KinhDo: 107.0830,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Bình thường',
    HinhAnh: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 08:20',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Hệ thống hố ga mới nâng cấp, khả năng tiêu thoát nước tốt.',
    MucDoNguyCo: 'Thấp',
    ChieuSauNuocCm: 0,
    KhaNangThoatNuoc: '90%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-09',
    TenViTri: 'Điểm cống số 09 - Phường Tam Thắng',
    ViDo: 10.3468,
    KinhDo: 107.0850,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Bị lấp kín',
    HinhAnh: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-20 11:05',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Tấm đan chắn rác bị đất đá bồi đắp sau mưa lớn, làm hẹp tiết diện dòng chảy.',
    MucDoNguyCo: 'Cao',
    ChieuSauNuocCm: 12,
    KhaNangThoatNuoc: '30%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-10',
    TenViTri: 'Điểm cống số 10 - Phường Tam Thắng',
    ViDo: 10.3502,
    KinhDo: 107.0890,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Có rác',
    HinhAnh: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-21 15:50',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Lá cây rụng nhiều bám vào vỉ sắt miệng cống hàm ếch gom nước mưa.',
    MucDoNguyCo: 'Trung bình',
    ChieuSauNuocCm: 5,
    KhaNangThoatNuoc: '65%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-11',
    TenViTri: 'Điểm cống số 11 - Phường Tam Thắng',
    ViDo: 10.3415,
    KinhDo: 107.0910,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Bình thường',
    HinhAnh: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-22 09:40',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Cửa xả trực tiếp có van ngăn triều một chiều hoạt động hiệu quả.',
    MucDoNguyCo: 'Thấp',
    ChieuSauNuocCm: 0,
    KhaNangThoatNuoc: '95%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-12',
    TenViTri: 'Điểm cống số 12 - Phường Tam Thắng',
    ViDo: 10.3540,
    KinhDo: 107.0855,
    LoaiCong: 'Hàm ếch',
    TinhTrang: 'Bị lấp kín',
    HinhAnh: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-19 17:00',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Vật dụng sinh hoạt lấn chiếm che miệng thu nước hàm ếch.',
    MucDoNguyCo: 'Cao',
    ChieuSauNuocCm: 14,
    KhaNangThoatNuoc: '35%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  },
  {
    id: 'TT-13',
    TenViTri: 'Điểm cống số 13 - Phường Tam Thắng',
    ViDo: 10.3482,
    KinhDo: 107.0825,
    LoaiCong: 'Mặt đường',
    TinhTrang: 'Tắc nghẽn',
    HinhAnh: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    HinhAnhDanhSach: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
    ],
    NgayCapNhat: '2026-09-20 14:00',
    KhuVuc: 'Phường Tam Thắng',
    GhiChu: 'Đường ống chính phía dưới hố ga bị tắc nghẽn, nước ứ đọng dồn ngược lên bề mặt.',
    MucDoNguyCo: 'Báo động',
    ChieuSauNuocCm: 20,
    KhaNangThoatNuoc: '10%',
    SoNhaTuyenDuong: 'Phường Tam Thắng'
  }
];

// --- 26 ẢNH KHẢO SÁT HIỆN TRƯỜNG VŨNG TÀU (CHỈ PHƯỜNG PHƯỚC THẮNG & TAM THẮNG) ---
export const SURVEY_PHOTOS_26: SurveyPhotoItem[] = [
  // --- PHƯỜNG PHƯỚC THẮNG (13 ẢNH) ---
  {
    id: 'PHOTO-01',
    pointId: 'PT-01',
    title: 'Ảnh 01: Điểm cống số 01 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Tắc nghẽn',
    moTa: 'Bùn phù sa bồi lắng dày trên 35cm, làm nước mưa không thoát kịp.'
  },
  {
    id: 'PHOTO-02',
    pointId: 'PT-02',
    title: 'Ảnh 02: Điểm cống số 02 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Có rác',
    moTa: 'Túi nilon rác vướng kín mặt lưới sắt, giảm đáng kể lưu lượng nước rút.'
  },
  {
    id: 'PHOTO-03',
    pointId: 'PT-03',
    title: 'Ảnh 03: Điểm cống số 03 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Bình thường',
    moTa: 'Cống hộp đôi bê tông xả lũ lớn, van điều tiết và cửa ngăn triều hoạt động trơn tru.'
  },
  {
    id: 'PHOTO-04',
    pointId: 'PT-04',
    title: 'Ảnh 04: Điểm cống số 04 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Bị lấp kín',
    moTa: 'Đất cát san lấp mặt bằng chảy tràn che lấp miệng hố ga.'
  },
  {
    id: 'PHOTO-05',
    pointId: 'PT-05',
    title: 'Ảnh 05: Điểm cống số 05 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Có rác',
    moTa: 'Cống thu nước mưa khu dân cư đọng nhiều rác màng bọc nilong.'
  },
  {
    id: 'PHOTO-06',
    pointId: 'PT-06',
    title: 'Ảnh 06: Điểm cống số 06 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Tắc nghẽn',
    moTa: 'Tắc nghẽn do rác hữu cơ, túi ni lông và bùn đất bít cửa thu nước hàm ếch.'
  },
  {
    id: 'PHOTO-07',
    pointId: 'PT-07',
    title: 'Ảnh 07: Điểm cống số 07 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Có rác',
    moTa: 'Nắp cống gang mặt đường bị rác sinh hoạt và lá cây cuốn vào song chắn.'
  },
  {
    id: 'PHOTO-08',
    pointId: 'PT-08',
    title: 'Ảnh 08: Điểm cống số 08 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Bình thường',
    moTa: 'Cửa xả cống thông suốt, đã được nạo vét định kỳ bảo đảm thoát nước tốt.'
  },
  {
    id: 'PHOTO-09',
    pointId: 'PT-09',
    title: 'Ảnh 09: Điểm cống số 09 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Bị lấp kín',
    moTa: 'Gờ bê tông lấn chiếm, che lấp gần như toàn bộ miệng cống thoát nước.'
  },
  {
    id: 'PHOTO-10',
    pointId: 'PT-10',
    title: 'Ảnh 10: Điểm cống số 10 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Tắc nghẽn',
    moTa: 'Hố ga cống vỡ đan nắp, rác dồn ứ làm nước thải bốc mùi khi trời nắng nóng.'
  },
  {
    id: 'PHOTO-11',
    pointId: 'PT-11',
    title: 'Ảnh 11: Điểm cống số 11 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1508873696983-2df570464756?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Có rác',
    moTa: 'Rác lá cây và túi xốp đọng miệng cống hàm ếch gom nước mưa.'
  },
  {
    id: 'PHOTO-12',
    pointId: 'PT-12',
    title: 'Ảnh 12: Điểm cống số 12 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Bình thường',
    moTa: 'Lòng cống bê tông sâu sạch sẽ, đã nạo vét bùn đất sẵn sàng mùa mưa.'
  },
  {
    id: 'PHOTO-13',
    pointId: 'PT-13',
    title: 'Ảnh 13: Điểm cống số 13 - Phường Phước Thắng',
    khuVuc: 'Phường Phước Thắng',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Bị lấp kín',
    moTa: 'Cát xây dựng san lấp mặt bằng chảy tràn lấp toàn bộ miệng thu cống hộp.'
  },

  // --- PHƯỜNG TAM THẮNG (13 ẢNH) ---
  {
    id: 'PHOTO-14',
    pointId: 'TT-01',
    title: 'Ảnh 14: Điểm cống số 01 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Tắc nghẽn',
    moTa: 'Khu vực mật độ cao, dầu mỡ vón tảng trong lòng cống hàm ếch gây ách tắc.'
  },
  {
    id: 'PHOTO-15',
    pointId: 'TT-02',
    title: 'Ảnh 15: Điểm cống số 02 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Có rác',
    moTa: 'Cát biển mịn và lá cây rụng tấp dày vào rãnh thu nước.'
  },
  {
    id: 'PHOTO-16',
    pointId: 'TT-03',
    title: 'Ảnh 16: Điểm cống số 03 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Bình thường',
    moTa: 'Hệ thống cống hộp trục chính kết nối hồ điều hòa lưu thông ổn định.'
  },
  {
    id: 'PHOTO-17',
    pointId: 'TT-04',
    title: 'Ảnh 17: Điểm cống số 04 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Bị lấp kín',
    moTa: 'Tấm che chắn kín nắp cống do mùi hôi, làm nước mưa không thoát được.'
  },
  {
    id: 'PHOTO-18',
    pointId: 'TT-05',
    title: 'Ảnh 18: Điểm cống số 05 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Có rác',
    moTa: 'Tuyến cống gom nước mưa khu dân cư có bùn và lá cây đọng quanh miệng thu.'
  },
  {
    id: 'PHOTO-19',
    pointId: 'TT-06',
    title: 'Ảnh 19: Điểm cống số 06 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Tắc nghẽn',
    moTa: 'Đoạn trũng sâu ngập nước tới 30cm khi triều cường, rác thải dồn ứ cục bộ.'
  },
  {
    id: 'PHOTO-20',
    pointId: 'TT-07',
    title: 'Ảnh 20: Điểm cống số 07 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Có rác',
    moTa: 'Miệng cống có nhiều cành cây gãy mục và chai nhựa kẹt tại song chắn.'
  },
  {
    id: 'PHOTO-21',
    pointId: 'TT-08',
    title: 'Ảnh 21: Điểm cống số 08 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Bình thường',
    moTa: 'Hố ga kiên cố mới nâng cấp, khả năng tiêu thoát nước đạt 90%.'
  },
  {
    id: 'PHOTO-22',
    pointId: 'TT-09',
    title: 'Ảnh 22: Điểm cống số 09 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Bị lấp kín',
    moTa: 'Đất đá bồi tụ sau trận mưa giông lớn làm hẹp đáng kể dòng chảy vào cống.'
  },
  {
    id: 'PHOTO-23',
    pointId: 'TT-10',
    title: 'Ảnh 23: Điểm cống số 10 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Có rác',
    moTa: 'Lá cây rụng dày đặc che kín các khe song chắn rác hàm ếch.'
  },
  {
    id: 'PHOTO-24',
    pointId: 'TT-11',
    title: 'Ảnh 24: Điểm cống số 11 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Bình thường',
    moTa: 'Cửa xả bờ kè có van ngăn triều tự động hoạt động rất tốt, không trào ngược.'
  },
  {
    id: 'PHOTO-25',
    pointId: 'TT-12',
    title: 'Ảnh 25: Điểm cống số 12 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Hàm ếch',
    tinhTrang: 'Bị lấp kín',
    moTa: 'Vật cản che lấp đè lên miệng cống thoát nước.'
  },
  {
    id: 'PHOTO-26',
    pointId: 'TT-13',
    title: 'Ảnh 26: Điểm cống số 13 - Phường Tam Thắng',
    khuVuc: 'Phường Tam Thắng',
    url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    loaiCong: 'Mặt đường',
    tinhTrang: 'Tắc nghẽn',
    moTa: 'Đáy hố ga bị nứt vỡ chèn đường ống, nước tràn ngược bề mặt khi mưa.'
  }
];

export const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/14wzZzmc9RbYJZfl7M222amU9xu8XKsxI';

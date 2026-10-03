import React from 'react';
import { DrainPoint, FilterState, LoaiCong, TinhTrang } from '../types';
import {
  Search,
  Filter,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface FilterSidebarProps {
  points: DrainPoint[];
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  selectedPoint: DrainPoint | null;
  onSelectPoint: (point: DrainPoint) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const KHU_VUC_LIST = [
  'Tất cả',
  'Phường Phước Thắng',
  'Phường Tam Thắng'
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  points,
  filters,
  onFilterChange,
  selectedPoint,
  onSelectPoint,
  isOpen,
  onToggleOpen
}) => {
  const [statusKeyword, setStatusKeyword] = React.useState<string>('all');

  // Area list with Phường Phước Thắng and Phường Tam Thắng
  const dynamicKhuVucList = React.useMemo(() => {
    return ['Tất cả', 'Phường Phước Thắng', 'Phường Tam Thắng'];
  }, []);

  const handleApplyFilter = () => {
    if (statusKeyword === 'all') {
      onFilterChange({ ...filters, tinhTrang: 'Tất cả' });
    } else if (statusKeyword === 'bình thường') {
      onFilterChange({ ...filters, tinhTrang: 'Bình thường' });
    } else if (statusKeyword === 'có rác') {
      onFilterChange({ ...filters, tinhTrang: 'Có rác' });
    } else if (statusKeyword === 'tắc nghẽn') {
      onFilterChange({ ...filters, tinhTrang: 'Tắc nghẽn' });
    }
  };

  // Filter logic
  const filteredPoints = points.filter((p) => {
    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = p.TenViTri.toLowerCase().includes(q);
      const matchArea = (p.KhuVuc || '').toLowerCase().includes(q);
      const matchNote = (p.GhiChu || '').toLowerCase().includes(q);
      if (!matchName && !matchArea && !matchNote) return false;
    }

    // Status matching
    const pStatus = (p.TinhTrang || '').toLowerCase();
    if (statusKeyword !== 'all') {
      if (statusKeyword === 'bình thường' && !pStatus.includes('bình thường')) return false;
      if (statusKeyword === 'có rác' && !(pStatus.includes('rác') || pStatus.includes('lá'))) return false;
      if (statusKeyword === 'tắc nghẽn' && !(pStatus.includes('tắc') || pStatus.includes('lấp') || pStatus.includes('nghẽn'))) return false;
    } else if (filters.tinhTrang !== 'Tất cả' && p.TinhTrang !== filters.tinhTrang) {
      return false;
    }

    // LoaiCong
    if (filters.loaiCong !== 'Tất cả' && p.LoaiCong !== filters.loaiCong) {
      return false;
    }

    // KhuVuc
    if (filters.khuVuc !== 'Tất cả') {
      const pKv = (p.KhuVuc || '').toLowerCase();
      const fKv = filters.khuVuc.toLowerCase();
      if (!pKv.includes(fKv)) return false;
    }

    return true;
  });

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        id="toggle-sidebar-mobile-btn"
        onClick={onToggleOpen}
        className="md:hidden fixed bottom-5 left-5 z-30 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full shadow-2xl flex items-center justify-center border-2 border-slate-900"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-20 w-80 sm:w-96 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 shadow-2xl md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Search & Filter Header */}
        <div className="p-3.5 border-b border-slate-800 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Filter className="w-4 h-4 text-blue-400" />
              <span>Khảo sát cống</span>
              <span id="drainCount" className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold">
                {filteredPoints.length}
              </span>
            </div>
            <button
              onClick={onToggleOpen}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User's exact filter controls: statusFilter & btnFilter */}
          <div className="flex gap-2 items-center">
            <select
              id="statusFilter"
              value={statusKeyword}
              onChange={(e) => {
                setStatusKeyword(e.target.value);
              }}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">Tất cả (all)</option>
              <option value="bình thường">🟢 Bình thường</option>
              <option value="có rác">🟡 Có rác / lá</option>
              <option value="tắc nghẽn">🔴 Tắc nghẽn / Lấp</option>
            </select>
            <button
              id="btnFilter"
              onClick={handleApplyFilter}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
            >
              Lọc
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="drain-search-input"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Tìm kiếm điểm cống, khu vực, ghi chú..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Khu vực filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Khu vực:</span>
            <select
              id="area-select-filter"
              value={filters.khuVuc}
              onChange={(e) => onFilterChange({ ...filters, khuVuc: e.target.value })}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
            >
              {dynamicKhuVucList.map((kv) => (
                <option key={kv} value={kv}>
                  {kv}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drain Points Checklist matching user's checklist & quest-item */}
        <ul id="checklist" className="flex-1 overflow-y-auto p-2.5 space-y-2 list-none m-0">
          {filteredPoints.length === 0 ? (
            <li className="text-center py-12 px-4 list-none">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-400">Không tìm thấy điểm cống nào</div>
              <p className="text-xs text-slate-500 mt-1">
                Thử chọn "Tất cả (all)" hoặc nhập từ khóa khác
              </p>
            </li>
          ) : (
            filteredPoints.map((point) => {
              const pStatus = (point.TinhTrang || '').toLowerCase();
              let color = '#22c55e';
              let iconCode = '🟢';
              let statusClass = '';

              if (pStatus.includes('rác') || pStatus.includes('lá')) {
                color = '#eab308';
                iconCode = '🟡';
                statusClass = 'warning';
              } else if (pStatus.includes('tắc') || pStatus.includes('lấp') || pStatus.includes('nghẽn')) {
                color = '#ef4444';
                iconCode = '🔴';
                statusClass = 'danger';
              }

              const isSelected = selectedPoint?.id === point.id;

              return (
                <li
                  key={point.id}
                  id={`quest-item-${point.id}`}
                  className={`quest-item ${statusClass} ${isSelected ? 'ring-2 ring-blue-500 bg-slate-800 shadow-lg' : ''}`}
                  onClick={() => onSelectPoint(point)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <b className="text-xs text-white block leading-snug line-clamp-2">
                        {point.TenViTri}
                      </b>
                      <small className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-1">
                        <span>{iconCode}</span>
                        <span style={{ color, fontWeight: 'bold' }}>{point.TinhTrang}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{point.LoaiCong}</span>
                      </small>
                      {point.KhuVuc && (
                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                          📍 {point.KhuVuc}
                        </div>
                      )}
                    </div>

                    {point.HinhAnh ? (
                      <div className="relative group/thumb shrink-0" title="Ảnh khảo sát con đường / vị trí này">
                        <img
                          src={point.HinhAnh}
                          alt="Ảnh cống"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700 bg-slate-800"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-0 right-0 bg-slate-900/90 text-[9px] text-sky-300 px-1 rounded-tl rounded-br font-mono">
                          📷
                        </span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg border border-dashed border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center text-slate-500 shrink-0 text-[10px]" title="Chưa có ảnh - Nhấn để thêm ảnh">
                        <span>📷</span>
                        <span className="text-[8px] text-slate-400">+ ảnh</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </aside>
    </>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { DrainPoint, FilterState, FloodSimulationParams, TinhTrang } from './types';
import { INITIAL_DRAIN_POINTS } from './data/initialPoints';
import { exportPointsToCSV, downloadCSVFile } from './utils/csvHelper';
import {
  getInitialPointsSync,
  loadPointsFromStorage,
  savePointsToStorage,
  resetStorageToDefaults
} from './utils/storageHelper';
import { Header } from './components/Header';
import { FilterSidebar } from './components/FilterSidebar';
import { MapViewer } from './components/MapViewer';
import { PointDetailModal } from './components/PointDetailModal';
import { SurveyAddModal } from './components/SurveyAddModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { FloodSimulatorModal } from './components/FloodSimulatorModal';
import { StorageBackupModal } from './components/StorageBackupModal';
import { FieldSurveyGalleryModal } from './components/FieldSurveyGalleryModal';
import { BatchJpgRandomUploadModal } from './components/BatchJpgRandomUploadModal';

export default function App() {
  // Fast initial synchronous read from cache
  const [points, setPoints] = useState<DrainPoint[]>(() => getInitialPointsSync());
  const [lastSavedTime, setLastSavedTime] = useState<string>('Vừa xong');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const isHydratedRef = useRef(false);

  // Hydrate from IndexedDB on startup (handles large datasets & high-res/HEIC photos without quota limit)
  useEffect(() => {
    let isMounted = true;
    loadPointsFromStorage()
      .then((loaded) => {
        if (isMounted) {
          if (Array.isArray(loaded) && loaded.length > 0) {
            setPoints(loaded);
          }
          isHydratedRef.current = true;
        }
      })
      .catch((err) => {
        console.warn('Lỗi đọc cơ sở dữ liệu IndexedDB:', err);
        if (isMounted) {
          isHydratedRef.current = true;
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Save to persistent storage (IndexedDB + LocalStorage) whenever points change
  // CRITICAL: Must NOT execute on initial mount before hydration, to preserve stored images & points!
  useEffect(() => {
    if (!isHydratedRef.current) {
      return;
    }

    savePointsToStorage(points)
      .then((res) => {
        setLastSavedTime(res.timestamp);
      })
      .catch((err) => {
        console.warn('Lỗi lưu trữ tự động:', err);
      });
  }, [points]);

  // Selected point for detailed inspection
  const [selectedPoint, setSelectedPoint] = useState<DrainPoint | null>(null);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    tinhTrang: 'Tất cả',
    loaiCong: 'Tất cả',
    khuVuc: 'Tất cả',
    mucDoNguyCo: 'Tất cả'
  });

  // Sidebar toggle for mobile/desktop
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isFloodModalOpen, setIsFloodModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isJpgRandomModalOpen, setIsJpgRandomModalOpen] = useState(false);

  // Location picking on map
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Flood simulation state
  const [floodSimulation, setFloodSimulation] = useState<FloodSimulationParams>({
    rainIntensityMm: 65,
    tideLevelM: 2.8,
    simulationActive: false
  });

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Handlers: every modification triggers automatic persistence
  const handleAddPoint = (newPoint: DrainPoint) => {
    setPoints((prev) => {
      const updated = [newPoint, ...prev];
      // Force immediate persistence for new survey point
      savePointsToStorage(updated).then((res) => setLastSavedTime(res.timestamp));
      return updated;
    });
    setSelectedPoint(newPoint);
    setIsPickingLocation(false);
    setPickedCoords(null);
    showToast(`✅ Đã thêm & tự động lưu điểm cống "${newPoint.TenViTri}" vào bộ nhớ máy!`);
  };

  const handleUpdateStatus = (id: string, newStatus: TinhTrang) => {
    setPoints((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const item: DrainPoint = {
            ...p,
            TinhTrang: newStatus,
            NgayCapNhat: new Date().toISOString().slice(0, 16).replace('T', ' '),
            MucDoNguyCo:
              newStatus === 'Tắc nghẽn' ? 'Báo động' :
              newStatus === 'Bị lấp kín' ? 'Cao' :
              newStatus === 'Có rác' ? 'Trung bình' : 'Thấp',
            KhaNangThoatNuoc:
              newStatus === 'Tắc nghẽn' ? '10%' :
              newStatus === 'Bị lấp kín' ? '25%' :
              newStatus === 'Có rác' ? '60%' : '95%'
          };
          if (selectedPoint?.id === id) {
            setSelectedPoint(item);
          }
          return item;
        }
        return p;
      });
      savePointsToStorage(updated).then((res) => setLastSavedTime(res.timestamp));
      return updated;
    });
    showToast(`✅ Đã lưu cập nhật tình trạng cống thành "${newStatus}"`);
  };

  const handleUpdateImage = (id: string, newImageUrl: string) => {
    setPoints((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const item: DrainPoint = {
            ...p,
            HinhAnh: newImageUrl,
            NgayCapNhat: new Date().toISOString().slice(0, 16).replace('T', ' ')
          };
          if (selectedPoint?.id === id) {
            setSelectedPoint(item);
          }
          return item;
        }
        return p;
      });
      savePointsToStorage(updated).then((res) => setLastSavedTime(res.timestamp));
      return updated;
    });
    showToast('✅ Đã lưu hình ảnh mới của điểm cống vào bộ nhớ thiết bị');
  };

  const handleUpdatePoint = (updatedPoint: DrainPoint) => {
    setPoints((prev) => {
      const updated = prev.map((p) => (p.id === updatedPoint.id ? updatedPoint : p));
      savePointsToStorage(updated).then((res) => setLastSavedTime(res.timestamp));
      return updated;
    });
    setSelectedPoint(updatedPoint);
    showToast(`✅ Đã lưu cập nhật điểm cống: "${updatedPoint.TenViTri}"`);
  };

  const handleDeletePoint = (id: string) => {
    setPoints((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePointsToStorage(updated).then((res) => setLastSavedTime(res.timestamp));
      return updated;
    });
    if (selectedPoint?.id === id) {
      setSelectedPoint(null);
    }
    showToast('Đã xóa điểm khảo sát và cập nhật lưu trữ');
  };

  const handleImportPoints = (newPoints: DrainPoint[], mode: 'replace' | 'append') => {
    setPoints((prev) => {
      const updated = mode === 'replace' ? newPoints : [...newPoints, ...prev];
      savePointsToStorage(updated).then((res) => setLastSavedTime(res.timestamp));
      return updated;
    });
    showToast(`✅ Đã đồng bộ & lưu an toàn ${newPoints.length} điểm khảo sát`);
  };

  const handleRestoreFromBackup = (restoredPoints: DrainPoint[]) => {
    setPoints(restoredPoints);
    savePointsToStorage(restoredPoints).then((res) => setLastSavedTime(res.timestamp));
    showToast(`✅ Đã khôi phục và lưu ${restoredPoints.length} điểm từ file sao lưu!`);
  };

  const handleResetToDefaults = async () => {
    const defaults = await resetStorageToDefaults();
    setPoints(defaults);
    setLastSavedTime('Vừa xong');
    showToast('Đã đặt lại dữ liệu mẫu khảo sát ban đầu của TP. Vũng Tàu');
  };

  const handleApplyRandomJpg = (updatedPoints: DrainPoint[], message: string) => {
    setPoints(updatedPoints);
    savePointsToStorage(updatedPoints).then((res) => setLastSavedTime(res.timestamp));
    showToast(message);
    if (selectedPoint) {
      const refreshed = updatedPoints.find((p) => p.id === selectedPoint.id);
      if (refreshed) {
        setSelectedPoint(refreshed);
      }
    }
  };

  const handleExportCSV = () => {
    const csvData = exportPointsToCSV(points);
    downloadCSVFile(
      `DrainMap_VungTau_${new Date().toISOString().slice(0, 10)}.csv`,
      csvData
    );
    showToast('Đã xuất file CSV chuẩn Google Sheets');
  };

  const handleMapClickForNewPoint = (lat: number, lng: number) => {
    setPickedCoords({ lat, lng });
    setIsPickingLocation(false);
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Navigation & KPI Header */}
      <Header
        points={points}
        onOpenAddModal={() => {
          setPickedCoords(null);
          setIsAddModalOpen(true);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenFloodModal={() => setIsFloodModalOpen(true)}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
        onOpenGalleryModal={() => setIsGalleryModalOpen(true)}
        onOpenJpgRandomModal={() => setIsJpgRandomModalOpen(true)}
        onExportCSV={handleExportCSV}
        floodSimulation={floodSimulation}
        lastSavedTime={lastSavedTime}
      />

      {/* Main Workspace: Left Filter Sidebar + Interactive Map */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Filter & Point List Sidebar */}
        <FilterSidebar
          points={points}
          filters={filters}
          onFilterChange={setFilters}
          selectedPoint={selectedPoint}
          onSelectPoint={(point) => {
            setSelectedPoint(point);
            if (window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Center/Right Map Canvas */}
        <main className="flex-1 relative h-full">
          <MapViewer
            points={points}
            selectedPoint={selectedPoint}
            onSelectPoint={(point) => setSelectedPoint(point)}
            onMapClickForNewPoint={handleMapClickForNewPoint}
            isPickingLocation={isPickingLocation}
            onTogglePickingLocation={() => setIsPickingLocation((prev) => !prev)}
            floodSimulation={floodSimulation}
          />
        </main>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <PointDetailModal
        point={selectedPoint}
        onClose={() => setSelectedPoint(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateImage={handleUpdateImage}
        onUpdatePoint={handleUpdatePoint}
        onDeletePoint={handleDeletePoint}
        onOpenGalleryModal={() => setIsGalleryModalOpen(true)}
      />

      <SurveyAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPoint={handleAddPoint}
        onPickLocationOnMap={() => {
          setIsPickingLocation(true);
          showToast('Nhấp vào bất kỳ vị trí nào trên bản đồ để chọn tọa độ cống');
        }}
        initialCoords={pickedCoords}
      />

      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        points={points}
        onImportPoints={handleImportPoints}
      />

      <FloodSimulatorModal
        isOpen={isFloodModalOpen}
        onClose={() => setIsFloodModalOpen(false)}
        simulation={floodSimulation}
        onUpdateSimulation={setFloodSimulation}
        points={points}
      />

      <StorageBackupModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        points={points}
        lastSavedTime={lastSavedTime}
        onRestorePoints={handleRestoreFromBackup}
        onResetToDefaults={handleResetToDefaults}
      />

      <FieldSurveyGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        points={points}
        onSelectPoint={(p) => {
          setSelectedPoint(p);
        }}
        onOpenJpgRandomModal={() => setIsJpgRandomModalOpen(true)}
      />

      <BatchJpgRandomUploadModal
        isOpen={isJpgRandomModalOpen}
        onClose={() => setIsJpgRandomModalOpen(false)}
        points={points}
        onApplyRandomJpg={handleApplyRandomJpg}
        onSelectPoint={(p) => {
          setSelectedPoint(p);
        }}
      />
    </div>
  );
}

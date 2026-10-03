import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DrainPoint, FloodSimulationParams } from '../types';
import { Layers, Navigation2, PlusCircle, AlertTriangle } from 'lucide-react';

interface MapViewerProps {
  points: DrainPoint[];
  selectedPoint: DrainPoint | null;
  onSelectPoint: (point: DrainPoint) => void;
  onMapClickForNewPoint?: (lat: number, lng: number) => void;
  isPickingLocation: boolean;
  onTogglePickingLocation?: () => void;
  floodSimulation: FloodSimulationParams;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
  onMapClickForNewPoint,
  isPickingLocation,
  onTogglePickingLocation,
  floodSimulation
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const floodRiskLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [currentBaseMap, setCurrentBaseMap] = React.useState<'osmfr' | 'streets' | 'satellite' | 'dark'>('osmfr');
  const [showFloodOverlay, setShowFloodOverlay] = React.useState<boolean>(true);
  const isPickingRef = useRef<boolean>(isPickingLocation);

  useEffect(() => {
    isPickingRef.current = isPickingLocation;
    const btn = document.getElementById('btnPick');
    if (btn) {
      if (isPickingLocation) {
        btn.style.background = '#22c55e';
        btn.style.color = '#ffffff';
        btn.innerHTML = '✅ Đang click...';
      } else {
        btn.style.background = '#0f172a';
        btn.style.color = '#f8fafc';
        btn.innerHTML = '📍 Lấy Tọa Độ';
      }
    }
  }, [isPickingLocation]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center in Vũng Tàu covering Phường Phước Thắng & Phường Tam Thắng
    const map = L.map(mapContainerRef.current, {
      center: [10.3800, 107.1100],
      zoom: 13,
      minZoom: 10,
      maxZoom: 20,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap France Tile Layer
    const osmFrTile = L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap France'
    });

    osmFrTile.addTo(map);

    // CÔNG CỤ LẤY TỌA ĐỘ (TopLeft control)
    const btnPickControl = new L.Control({ position: 'topleft' });
    btnPickControl.onAdd = function () {
      const div = L.DomUtil.create('div');
      div.innerHTML = `<button id="btnPick" style="padding: 8px 14px; font-weight: bold; cursor: pointer; border-radius: 10px; border: 1px solid #334155; background: #0f172a; color: #f8fafc; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 6px;">📍 Lấy Tọa Độ</button>`;
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    btnPickControl.addTo(map);

    // Add click handler for the Pick button
    const btnPickEl = document.getElementById('btnPick');
    if (btnPickEl) {
      btnPickEl.onclick = function (e) {
        e.stopPropagation();
        if (onTogglePickingLocation) {
          onTogglePickingLocation();
        } else {
          isPickingRef.current = !isPickingRef.current;
          btnPickEl.style.background = isPickingRef.current ? '#22c55e' : '#0f172a';
          btnPickEl.style.color = '#ffffff';
          btnPickEl.innerText = isPickingRef.current ? '✅ Đang click...' : '📍 Lấy Tọa Độ';
        }
      };
    }

    const markersGroup = L.layerGroup().addTo(map);
    const floodGroup = L.layerGroup().addTo(map);

    markersLayerGroupRef.current = markersGroup;
    floodRiskLayerGroupRef.current = floodGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Base Map Switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let newTileLayer: L.TileLayer;
    if (currentBaseMap === 'osmfr') {
      newTileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap France',
          maxZoom: 20
        }
      );
    } else if (currentBaseMap === 'satellite') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
          maxZoom: 19
        }
      );
    } else if (currentBaseMap === 'dark') {
      newTileLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; CARTO',
          maxZoom: 19
        }
      );
    } else {
      newTileLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }
      );
    }

    newTileLayer.addTo(map);
  }, [currentBaseMap]);

  // Handle Map Click (Coordinate Picker and New Point)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isPickingRef.current) return;

      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));
      const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      // Popup content with selectable input matching user's spec
      const container = document.createElement('div');
      container.style.fontFamily = 'system-ui, sans-serif';
      container.style.minWidth = '230px';
      container.style.padding = '4px';

      container.innerHTML = `
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px; color: #f8fafc;">📍 Tọa độ điểm nhấp:</div>
        <div style="margin-bottom: 8px;">
          <input id="coord-pick-input" value="${text}" readonly style="width: 100%; background: #1e293b; color: #38bdf8; border: 1px solid #475569; padding: 6px 8px; border-radius: 6px; font-size: 13px; font-family: monospace; font-weight: bold; cursor: pointer; text-align: center;"/>
        </div>
        <div style="display: flex; gap: 6px;">
          <button id="copy-coord-btn" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">📋 Sao chép</button>
          <button id="add-at-coord-btn" style="flex: 1; background: #22c55e; color: white; border: none; padding: 6px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">➕ Thêm cống</button>
        </div>
      `;

      const input = container.querySelector('#coord-pick-input') as HTMLInputElement;
      if (input) {
        input.onclick = () => input.select();
      }

      const copyBtn = container.querySelector('#copy-coord-btn') as HTMLButtonElement;
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(text);
          copyBtn.innerText = '✅ Đã sao chép';
          setTimeout(() => {
            if (copyBtn) copyBtn.innerText = '📋 Sao chép';
          }, 1500);
        };
      }

      const addBtn = container.querySelector('#add-at-coord-btn') as HTMLButtonElement;
      if (addBtn) {
        addBtn.onclick = () => {
          if (onMapClickForNewPoint) {
            onMapClickForNewPoint(lat, lng);
          }
          map.closePopup();
        };
      }

      L.popup().setLatLng(e.latlng).setContent(container).openOn(map);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [onMapClickForNewPoint]);

  // Render Drain Markers matching user's customIcon & popup layout
  useEffect(() => {
    const markersGroup = markersLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!markersGroup || !map) return;

    markersGroup.clearLayers();
    markersMapRef.current = {};

    points.forEach((point) => {
      const tinhTrang = (point.TinhTrang || '').toLowerCase();
      let color = '#22c55e'; // Xanh lá (Bình thường)
      let iconCode = '🟢';
      let statusClass = 'normal';

      if (tinhTrang.includes('rác') || tinhTrang.includes('lá')) {
        color = '#eab308'; // Vàng
        iconCode = '🟡';
        statusClass = 'warning';
      } else if (tinhTrang.includes('tắc') || tinhTrang.includes('lấp') || tinhTrang.includes('nghẽn')) {
        color = '#ef4444'; // Đỏ
        iconCode = '🔴';
        statusClass = 'danger';
      }

      const isDanger = statusClass === 'danger';

      const customIcon = L.divIcon({
        className: 'custom-drain-marker',
        html: `
          <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
            ${isDanger ? `<div class="animate-ping" style="position: absolute; inset: -4px; border-radius: 50%; background: ${color}; opacity: 0.6;"></div>` : ''}
            <div style="background: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.6); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -12]
      });

      const marker = L.marker([point.ViDo, point.KinhDo], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; max-width: 270px; padding: 2px;">
          <h3 style="margin-bottom: 5px; font-weight: bold; font-size: 14px; color: #f8fafc; line-height: 1.3;">📍 ${point.TenViTri}</h3>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><b>Kiểu cống:</b> ${point.LoaiCong}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><b>Tình trạng:</b> ${iconCode} <span style="color: ${color}; font-weight: bold;">${point.TinhTrang}</span></p>
          ${point.HinhAnh ? `
            <div id="popup-img-${point.id}" style="position: relative; margin: 8px 0; border-radius: 8px; overflow: hidden; cursor: pointer; border: 1px solid #334155;" title="Bấm vào để đổi hình ảnh">
              <img src="${point.HinhAnh}" alt="Ảnh thực tế cống" style="width: 100%; height: 115px; object-fit: cover; display: block;" onerror="this.style.display='none'"/>
              <div style="position: absolute; bottom: 4px; right: 4px; background: rgba(15,23,42,0.88); color: #38bdf8; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #334155; display: flex; align-items: center; gap: 3px;">
                📷 Đổi ảnh
              </div>
            </div>
          ` : `
            <div id="popup-no-img-${point.id}" style="margin: 8px 0; padding: 12px 8px; background: #1e293b; border: 1px dashed #475569; border-radius: 8px; text-align: center; font-size: 11px; color: #93c5fd; cursor: pointer; font-weight: 500;">
              📷 Chưa có ảnh • Bấm để thêm ảnh
            </div>
          `}
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <button id="view-detail-btn-${point.id}" style="flex: 1; background: #2563eb; color: white; border: none; padding: 7px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: background 0.2s;">
              ✏️ Xem chi tiết & đổi ảnh cống
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-detail-btn-${point.id}`);
        if (btn) {
          btn.onclick = () => onSelectPoint(point);
        }
        const imgBox = document.getElementById(`popup-img-${point.id}`);
        if (imgBox) {
          imgBox.onclick = () => onSelectPoint(point);
        }
        const noImgBox = document.getElementById(`popup-no-img-${point.id}`);
        if (noImgBox) {
          noImgBox.onclick = () => onSelectPoint(point);
        }
      });

      marker.addTo(markersGroup);
      markersMapRef.current[point.id] = marker;
    });
  }, [points, onSelectPoint]);

  // Render Flood Risk & Inundation Overlay
  useEffect(() => {
    const floodGroup = floodRiskLayerGroupRef.current;
    if (!floodGroup) return;

    floodGroup.clearLayers();
    if (!showFloodOverlay) return;

    // Identified urban flood hotspot zones in Phường Phước Thắng & Phường Tam Thắng
    const floodHotspots = [
      { name: 'Khu vực trũng Phường Phước Thắng (Cụm 1)', lat: 10.4180, lng: 107.1390, baseRadius: 260, riskScore: 0.9 },
      { name: 'Khu vực trũng Phường Phước Thắng (Cụm 2)', lat: 10.4225, lng: 107.1438, baseRadius: 220, riskScore: 0.85 },
      { name: 'Khu vực trũng Phường Phước Thắng (Cụm 3)', lat: 10.4150, lng: 107.1360, baseRadius: 200, riskScore: 0.82 },
      { name: 'Khu vực trũng Phường Tam Thắng (Cụm 1)', lat: 10.3470, lng: 107.0860, baseRadius: 220, riskScore: 0.88 },
      { name: 'Khu vực trũng Phường Tam Thắng (Cụm 2)', lat: 10.3425, lng: 107.0895, baseRadius: 180, riskScore: 0.8 },
      { name: 'Khu vực trũng Phường Tam Thắng (Cụm 3)', lat: 10.3512, lng: 107.0845, baseRadius: 190, riskScore: 0.78 }
    ];

    // Multipliers when floodSimulation is active
    let floodMultiplier = 1.0;
    if (floodSimulation.simulationActive) {
      const rainFactor = floodSimulation.rainIntensityMm / 50; // 0 to 3
      const tideFactor = floodSimulation.tideLevelM / 2.5; // 0 to 2
      floodMultiplier = Math.max(0.6, (rainFactor * 0.7 + tideFactor * 0.5));
    }

    floodHotspots.forEach((spot) => {
      const dynamicRadius = spot.baseRadius * floodMultiplier;
      const isSevere = floodSimulation.simulationActive && (floodMultiplier > 1.3 || spot.riskScore > 0.85);

      // Outer ripple / warning zone
      const circle = L.circle([spot.lat, spot.lng], {
        radius: dynamicRadius,
        color: isSevere ? '#ef4444' : '#0284c7',
        fillColor: isSevere ? '#ef4444' : '#38bdf8',
        fillOpacity: isSevere ? 0.35 : 0.2,
        weight: 1.5,
        dashArray: isSevere ? '6, 6' : undefined
      });

      circle.bindTooltip(`
        <div style="font-weight: 600; font-size: 12px;">
          ⚠️ ${spot.name}<br/>
          <span style="color: ${isSevere ? '#b91c1c' : '#0369a1'}">
            ${isSevere ? 'CẢNH BÁO NGUY CƠ NGẬP CAO' : 'Vùng trũng thoát nước'}
          </span>
        </div>
      `);

      circle.addTo(floodGroup);
    });
  }, [showFloodOverlay, floodSimulation]);

  // Fly to selected point when changed and open popup (as in user snippet)
  useEffect(() => {
    if (!selectedPoint || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedPoint.ViDo, selectedPoint.KinhDo], 18, {
      duration: 1.0
    });
    const marker = markersMapRef.current[selectedPoint.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 500);
    }
  }, [selectedPoint]);

  // Handle Locate User GPS
  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-marker',
              html: `
                <div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          }
          map.flyTo([latitude, longitude], 16);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Default to Vũng Tàu center if denied or unavailable
          map.flyTo([10.375, 107.098], 14);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Element */}
      <div id="drain-map-canvas" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Picking Location Indicator banner */}
      {isPickingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-slate-900 px-4 py-2 rounded-full shadow-xl font-semibold flex items-center gap-2 border-2 border-white animate-bounce text-sm">
          <PlusCircle className="w-4 h-4" />
          <span>Nhấp trực tiếp lên bản đồ để chọn tọa độ cống mới</span>
        </div>
      )}

      {/* Top Right Floating Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Base Map Switcher */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl flex items-center gap-1">
          <button
            id="basemap-streets-btn"
            onClick={() => setCurrentBaseMap('streets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentBaseMap === 'streets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Đường phố
          </button>
          <button
            id="basemap-satellite-btn"
            onClick={() => setCurrentBaseMap('satellite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentBaseMap === 'satellite'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Vệ tinh
          </button>
          <button
            id="basemap-dark-btn"
            onClick={() => setCurrentBaseMap('dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentBaseMap === 'dark'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Bản đồ tối
          </button>
        </div>

        {/* Toggle Flood Risk Overlay */}
        <button
          id="toggle-flood-overlay-btn"
          onClick={() => setShowFloodOverlay(!showFloodOverlay)}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border shadow-xl backdrop-blur-md transition-all ${
            showFloodOverlay
              ? 'bg-sky-950/80 border-sky-500/50 text-sky-200'
              : 'bg-slate-900/80 border-slate-700 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className={`w-3.5 h-3.5 ${showFloodOverlay ? 'text-sky-400' : 'text-slate-400'}`} />
            Vùng cảnh báo ngập
          </span>
          <span className={`ml-2 w-2 h-2 rounded-full ${showFloodOverlay ? 'bg-sky-400 animate-pulse' : 'bg-slate-600'}`} />
        </button>

        {/* GPS Locate Me Button */}
        <button
          id="gps-locate-btn"
          onClick={handleLocateMe}
          title="Định vị vị trí hiện tại của tôi"
          className="bg-slate-900/90 hover:bg-blue-600 text-slate-200 hover:text-white p-2.5 rounded-xl border border-slate-700/80 shadow-xl backdrop-blur-md transition-all flex items-center justify-center self-end"
        >
          <Navigation2 className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs max-w-[280px]">
        <div className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          Chú giải tình trạng cống
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block border border-emerald-400"></span>
            <span>Bình thường</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block border border-amber-400"></span>
            <span>Có rác</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 inline-block border border-orange-400"></span>
            <span>Bị lấp kín</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block border border-red-400 animate-pulse"></span>
            <span>Tắc nghẽn</span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>🕳️ Cống hàm ếch</span>
          <span>▦ Cống mặt đường</span>
        </div>
      </div>
    </div>
  );
};

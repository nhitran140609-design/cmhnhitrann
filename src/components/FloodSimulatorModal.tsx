import React from 'react';
import { FloodSimulationParams, DrainPoint } from '../types';
import {
  X,
  CloudRain,
  Waves,
  AlertOctagon,
  ShieldAlert,
  Droplets,
  Truck,
  CheckCircle2,
  TrendingUp,
  Activity
} from 'lucide-react';

interface FloodSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: FloodSimulationParams;
  onUpdateSimulation: (params: FloodSimulationParams) => void;
  points: DrainPoint[];
}

export const FloodSimulatorModal: React.FC<FloodSimulatorModalProps> = ({
  isOpen,
  onClose,
  simulation,
  onUpdateSimulation,
  points
}) => {
  if (!isOpen) return null;

  const totalPoints = points.length || 1;
  const blockedPoints = points.filter(p => p.TinhTrang === 'Tắc nghẽn' || p.TinhTrang === 'Bị lấp kín').length;
  const blockageRatio = Math.round((blockedPoints / totalPoints) * 100);

  // Compute urban flood risk index
  const rainScore = (simulation.rainIntensityMm / 150) * 45; // max 45
  const tideScore = ((simulation.tideLevelM - 1.0) / 3.2) * 35; // max 35
  const blockageScore = (blockageRatio / 100) * 20; // max 20

  const totalRiskIndex = Math.min(100, Math.max(5, Math.round(rainScore + tideScore + blockageScore)));

  let alertLevel = 'Cấp 1 - An toàn / Nguy cơ thấp';
  let alertColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  if (totalRiskIndex > 75) {
    alertLevel = 'Cấp 4 - Báo động đỏ: Ngập lụt nghiêm trọng';
    alertColor = 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  } else if (totalRiskIndex > 50) {
    alertLevel = 'Cấp 3 - Cảnh báo ngập sâu diện rộng';
    alertColor = 'text-orange-400 border-orange-500/40 bg-orange-950/40';
  } else if (totalRiskIndex > 30) {
    alertLevel = 'Cấp 2 - Nguy cơ ứ đọng cục bộ';
    alertColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
  }

  // Hotspot predicted water depths
  const calculateInundationDepth = (baseFactor: number) => {
    if (!simulation.simulationActive) return 0;
    const depth = Math.round((simulation.rainIntensityMm * 0.35 + (simulation.tideLevelM - 1.5) * 12) * baseFactor);
    return Math.max(0, depth);
  };

  const hotspots = [
    {
      name: 'Khu vực trọng điểm 01 - Phường Phước Thắng',
      zone: 'Phường Phước Thắng',
      depth: calculateInundationDepth(1.3),
      critical: totalRiskIndex > 45,
      cause: 'Địa hình trũng thấp, cống thu nước bồi lắng phù sa và bùn đất'
    },
    {
      name: 'Khu vực trọng điểm 02 - Phường Phước Thắng',
      zone: 'Phường Phước Thắng',
      depth: calculateInundationDepth(1.25),
      critical: totalRiskIndex > 40,
      cause: 'Đáy cống bồi lắng cát đá sau mưa, rác bao bì vướng lưới chắn'
    },
    {
      name: 'Khu vực trọng điểm 03 - Phường Phước Thắng',
      zone: 'Phường Phước Thắng',
      depth: calculateInundationDepth(1.4),
      critical: totalRiskIndex > 50,
      cause: 'Cửa xả ra sông chịu ảnh hưởng triều cường dâng ép ngược vào lòng cống'
    },
    {
      name: 'Khu vực trọng điểm 01 - Phường Tam Thắng',
      zone: 'Phường Tam Thắng',
      depth: calculateInundationDepth(1.15),
      critical: totalRiskIndex > 50,
      cause: 'Dầu mỡ kết tủa và rác sinh hoạt đọng ở hố ga thu nước'
    },
    {
      name: 'Khu vực trọng điểm 02 - Phường Tam Thắng',
      zone: 'Phường Tam Thắng',
      depth: calculateInundationDepth(1.05),
      critical: totalRiskIndex > 55,
      cause: 'Cát mịn tấp dày vào rãnh thu nước, thoát chậm khi mưa lớn'
    },
    {
      name: 'Khu vực trọng điểm 03 - Phường Tam Thắng',
      zone: 'Phường Tam Thắng',
      depth: calculateInundationDepth(1.2),
      critical: totalRiskIndex > 45,
      cause: 'Lá cây và vật cản che miệng thu nước hàm ếch gom nước mưa'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-600/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Quản Lý & Cảnh Báo Ngập Lụt Đô Thị
                </h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${alertColor}`}>
                  Chỉ số rủi ro: {totalRiskIndex}/100
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mô phỏng tương tác thủy văn giữa mưa rào, triều cường và trạng thái cống nghẹt
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

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Main Simulation Switch */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${simulation.simulationActive ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              <div>
                <div className="text-xs font-bold text-white">
                  Chế độ Mô Phỏng Cảnh Báo Ngập Trực Quan
                </div>
                <div className="text-[11px] text-slate-400">
                  {simulation.simulationActive
                    ? 'Đang kích hoạt: Hiển thị các bán kính ngập nguy hiểm trên bản đồ số'
                    : 'Đang tắt: Hiển thị chế độ khảo sát cống tiêu chuẩn'}
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onUpdateSimulation({
                  ...simulation,
                  simulationActive: !simulation.simulationActive
                })
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                simulation.simulationActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
              }`}
            >
              {simulation.simulationActive ? 'Tắt mô phỏng' : 'Bật mô phỏng ngập'}
            </button>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Rain Intensity */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  Cường độ mưa dự báo:
                </span>
                <span className="text-xs font-bold font-mono text-sky-400">
                  {simulation.rainIntensityMm} mm/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={simulation.rainIntensityMm}
                onChange={(e) =>
                  onUpdateSimulation({
                    ...simulation,
                    rainIntensityMm: Number(e.target.value)
                  })
                }
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Tạnh ráo (0)</span>
                <span>Mưa vừa (30)</span>
                <span>Mưa to (70)</span>
                <span>Cực đoan (150)</span>
              </div>
            </div>

            {/* Tide Level */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  Mực nước triều cường Vũng Tàu:
                </span>
                <span className="text-xs font-bold font-mono text-cyan-400">
                  {simulation.tideLevelM.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.1"
                value={simulation.tideLevelM}
                onChange={(e) =>
                  onUpdateSimulation({
                    ...simulation,
                    tideLevelM: Number(e.target.value)
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Triều kiệt (1.0m)</span>
                <span>Bình thường (2.2m)</span>
                <span>Đỉnh triều (4.5m)</span>
              </div>
            </div>
          </div>

          {/* Current Alert Level Banner */}
          <div className={`p-3.5 rounded-xl border ${alertColor} flex items-start gap-3`}>
            <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider">
                {alertLevel}
              </div>
              <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                Tỷ lệ cống có nguy cơ tắc/bị lấp tại địa bàn: <b>{blockageRatio}%</b> ({blockedPoints}/{totalPoints} vị trí khảo sát).
                {totalRiskIndex > 50
                  ? ' Khuyến cáo đóng van ngăn triều cửa xả biển, thông báo người dân khu vực trũng thấp tại Phường Phước Thắng và Phường Tam Thắng kê cao tài sản.'
                  : ' Hệ thống tiêu thoát nước đô thị tại Phường Phước Thắng và Phường Tam Thắng hiện duy trì khả năng lưu thông tương đối ổn định.'}
              </p>
            </div>
          </div>

          {/* Forecasted Inundation Table by Local Areas */}
          <div>
            <div className="text-xs font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Dự báo độ sâu ngập tại các khu vực trọng điểm:</span>
              <span className="text-[10px] text-slate-400">Dựa trên địa hình & trạng thái cống</span>
            </div>

            <div className="space-y-2">
              {hotspots.map((h, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                    h.depth > 20
                      ? 'bg-rose-950/30 border-rose-800/60'
                      : h.depth > 10
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white truncate">{h.name}</span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                        {h.zone}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      Nguyên nhân: {h.cause}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold font-mono ${
                      h.depth > 20 ? 'text-rose-400' : h.depth > 10 ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      {simulation.simulationActive ? `${h.depth} cm` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {h.depth > 25 ? 'Ngập sâu xe máy' : h.depth > 10 ? 'Ứ nước chậm' : 'Khô ráo'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Dispatch Recommendations */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-400" />
              Phương án điều động xử lý thoát nước khẩn cấp:
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>Ưu tiên điều <b>xe hút bùn chuyên dụng</b> tới các điểm cống tắc nghẽn tại Phường Phước Thắng và Phường Tam Thắng.</li>
              <li>Yêu cầu tổ tuần tra tháo dỡ nắp chắn rác bị bịt kín tại các vị trí nguy cơ ngập cao.</li>
              <li>Kiểm tra cửa xả van một chiều tại Phường Phước Thắng và Phường Tam Thắng trước khi triều đạt đỉnh.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
          >
            Áp dụng & Xem trên bản đồ
          </button>
        </div>
      </div>
    </div>
  );
};

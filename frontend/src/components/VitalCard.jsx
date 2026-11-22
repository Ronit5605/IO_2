import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Heart, Thermometer, Wind } from 'lucide-react';

export default function VitalCard({
  title,
  value,
  unit,
  type = 'heart', // 'heart' | 'spo2' | 'temp'
  isAbnormal = false,
  thresholdNote = 'Demonstration limit',
  subText = 'Telemetry streaming',
}) {
  const getIcon = () => {
    switch (type) {
      case 'heart':
        return <Heart className={`w-6 h-6 text-red-500 ${isAbnormal ? 'animate-ping-slow' : 'animate-pulse'}`} />;
      case 'spo2':
        return <Wind className={`w-6 h-6 text-sky-400 ${isAbnormal ? 'animate-bounce' : ''}`} />;
      case 'temp':
        return <Thermometer className="w-6 h-6 text-amber-500" />;
      default:
        return <Activity className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    if (isAbnormal) {
      return 'border-red-500/80 bg-red-950/20 ring-2 ring-red-500/30';
    }
    return 'border-slate-800 bg-slate-900/90';
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 shadow-xl ${getBorderColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80">
            {getIcon()}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
            <div className="text-[11px] text-slate-500">{subText}</div>
          </div>
        </div>

        <div>
          {isAbnormal ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              ABNORMAL
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              NORMAL
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={`text-4xl sm:text-5xl font-black tracking-tight font-mono ${
            isAbnormal ? 'text-red-400' : 'text-white'
          }`}
        >
          {value != null ? value : '--'}
        </span>
        <span className="text-sm font-bold text-slate-400 uppercase">{unit}</span>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-[11px]">{thresholdNote}</span>
        <span className="font-mono text-[10px] text-slate-500">Live IoT telemetry</span>
      </div>
    </div>
  );
}

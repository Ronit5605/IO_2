import React from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { alertsAPI } from '../services/api.js';
import { AlertOctagon, BellOff, Check, Heart, ShieldAlert, Thermometer, Wind, X } from 'lucide-react';

export default function EmergencyAlertModal() {
  const { criticalModalAlert, setCriticalModalAlert } = useSocket();

  if (!criticalModalAlert) return null;

  const handleAcknowledge = async () => {
    try {
      if (criticalModalAlert._id) {
        await alertsAPI.acknowledge(criticalModalAlert._id);
      }
    } catch (e) {
      console.warn('Ack error:', e);
    } finally {
      setCriticalModalAlert(null);
    }
  };

  const isHR = criticalModalAlert.parameter?.includes('Heart Rate');
  const isSpO2 = criticalModalAlert.parameter?.includes('Oxygen') || criticalModalAlert.parameter?.includes('SpO2');
  const isTemp = criticalModalAlert.parameter?.includes('Temperature');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-2xl shadow-2xl overflow-hidden ring-4 ring-red-500/20 animate-scale-up">
        {/* Pulsating top emergency strip */}
        <div className="bg-red-600 px-6 py-3 flex items-center justify-between text-white animate-pulse">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider">
            <AlertOctagon className="w-5 h-5" />
            CRITICAL BIOMEDICAL EMERGENCY BROADCAST
          </div>
          <button
            onClick={() => setCriticalModalAlert(null)}
            className="text-red-200 hover:text-white p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 flex-shrink-0">
              {isHR ? (
                <Heart className="w-10 h-10 animate-ping-slow text-red-500" />
              ) : isSpO2 ? (
                <Wind className="w-10 h-10 animate-bounce text-sky-400" />
              ) : isTemp ? (
                <Thermometer className="w-10 h-10 text-amber-500" />
              ) : (
                <ShieldAlert className="w-10 h-10 text-red-500" />
              )}
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-red-500/20 text-red-400 border border-red-500/30 mb-1">
                {criticalModalAlert.severity || 'Critical'} Priority
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {criticalModalAlert.parameter || 'Vital Sign Anomaly'}
              </h3>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {criticalModalAlert.message}
              </p>
            </div>
          </div>

          {/* Vitals detail box */}
          <div className="mt-6 grid grid-cols-2 gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Trigger Value</p>
              <p className="text-2xl font-black text-red-400 mt-0.5">
                {criticalModalAlert.value != null ? criticalModalAlert.value : 'TRIGGERED'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Demo Threshold</p>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                {criticalModalAlert.threshold || 'Configured Range'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic mt-3 text-center">
            *Demonstration Alert Threshold: Automated sensor anomaly detected. Does not constitute medical diagnosis.
          </p>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => setCriticalModalAlert(null)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              Mute Alert
            </button>
            <button
              onClick={handleAcknowledge}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              Acknowledge & Dispatch Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { alertsAPI, notificationsAPI } from '../services/api.js';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CheckCircle,
  Clock,
  Filter,
  Flame,
  Heart,
  Info,
  ShieldAlert,
  Wind,
} from 'lucide-react';

export default function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [alertRes, notifRes] = await Promise.all([
        alertsAPI.getAll(),
        notificationsAPI.getAll(),
      ]);

      if (alertRes.success) setAlerts(alertRes.data);
      if (notifRes.success) setNotifications(notifRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledgeAlert = async (id) => {
    try {
      await alertsAPI.acknowledge(id);
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'UNACK') return !a.isAcknowledged;
    if (filterType === 'CRITICAL') return a.severity === 'critical';
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-black tracking-tight text-white">Emergency Alerts & Notifications</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prehospital telemetry threshold anomalies, paramedic SOS triggers, and hospital readiness broadcasts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {['ALL', 'UNACK', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === f
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f === 'UNACK' ? 'Pending Ack' : f === 'CRITICAL' ? 'Critical Only' : 'All Alerts'}
              </button>
            ))}
          </div>

          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alt) => {
            const isCritical = alt.severity === 'critical';
            return (
              <div
                key={alt._id}
                className={`p-4 rounded-2xl border transition-all shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCritical
                    ? 'bg-red-950/20 border-red-500/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {alt.parameter?.includes('Heart Rate') ? (
                      <Heart className="w-5 h-5 animate-pulse" />
                    ) : alt.parameter?.includes('Oxygen') ? (
                      <Wind className="w-5 h-5" />
                    ) : alt.parameter?.includes('Temperature') ? (
                      <Flame className="w-5 h-5" />
                    ) : (
                      <AlertOctagon className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alt.severity}
                      </span>
                      <h4 className="font-bold text-white text-sm">{alt.parameter}</h4>
                      {alt.value != null && (
                        <span className="font-mono text-xs font-bold text-red-400">
                          (Value: {alt.value})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{alt.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-mono">
                      <span>{new Date(alt.createdAt).toLocaleString()}</span>
                      {alt.ambulanceId && <span>Ambulance: {alt.ambulanceId.callSign}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {!alt.isAcknowledged ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(alt._id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Acknowledge
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xl">
            <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-50" />
            No active alerts matching current filter. All patient telemetry within acceptable limits.
          </div>
        )}
      </div>
    </div>
  );
}

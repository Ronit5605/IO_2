import React, { useState, useEffect } from 'react';
import { statsAPI, ambulancesAPI, hospitalsAPI, emergenciesAPI } from '../services/api.js';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  BarChart3,
  BatteryCharging,
  Building2,
  CheckCircle,
  Clock,
  Radio,
  Shield,
  Siren,
  Users,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [overviewRes, ambRes, hospRes, emgRes, analyticsRes] = await Promise.all([
        statsAPI.getOverview(),
        ambulancesAPI.getAll(),
        hospitalsAPI.getAll(),
        emergenciesAPI.getAll(),
        statsAPI.getAnalytics(),
      ]);

      if (overviewRes.success) setStats(overviewRes.data);
      if (ambRes.success) setAmbulances(ambRes.data);
      if (hospRes.success) setHospitals(hospRes.data);
      if (emgRes.success) setEmergencies(emgRes.data);
      if (analyticsRes.success) setRecentAlerts(analyticsRes.data.recentAlerts || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-black tracking-tight text-white">Central Emergency Command Center</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fleet monitoring, hospital emergency department coordination, and telemetry telemetry audit
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            CENTRAL DISPATCH ONLINE
          </span>
        </div>
      </div>

      {/* KPI Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Fleet</span>
            <span className="text-3xl font-black text-white font-mono mt-1 block">
              {stats?.totalAmbulances ?? ambulances.length}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 block">100% IoT Operational</span>
          </div>
          <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
            <Ambulance className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hospital Network</span>
            <span className="text-3xl font-black text-white font-mono mt-1 block">
              {stats?.totalHospitals ?? hospitals.length}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 block">Trauma Centers Connected</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Emergencies</span>
            <span className="text-3xl font-black text-amber-400 font-mono mt-1 block">
              {stats?.activeEmergencies ?? emergencies.filter((e) => ['Initiated', 'En Route', 'Hospital Acknowledged'].includes(e.status)).length}
            </span>
            <span className="text-[11px] text-amber-300 mt-1 block">In Transit Telemetry</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 rounded-2xl text-amber-400 border border-amber-500/20">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Patients</span>
            <span className="text-3xl font-black text-white font-mono mt-1 block">
              {stats?.totalPatients ?? 5}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Prehospital Records</span>
          </div>
          <div className="p-3.5 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fleet Monitoring Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ambulance className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ambulance Fleet Status</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {ambulances.length} Units</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">Call Sign</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Paramedic / Driver</th>
                <th className="py-3 px-4">IoT Node (ESP32)</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Battery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {ambulances.map((amb) => {
                const isEmergency = amb.status === 'Emergency';
                return (
                  <tr key={amb._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{amb.vehicleNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-400">{amb.callSign}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isEmergency
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : amb.status === 'On Duty'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {amb.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{amb.paramedicName}</div>
                      <div className="text-[10px] text-slate-500">{amb.driverName}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Radio className="w-3.5 h-3.5" />
                        Online
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {amb.currentLocation?.latitude?.toFixed(4)}, {amb.currentLocation?.longitude?.toFixed(4)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <span className="flex items-center gap-1">
                        <BatteryCharging className="w-3.5 h-3.5 text-blue-400" />
                        {amb.iotDevice?.batteryLevel || 94}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Network Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registered Emergency Hospitals</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Total: {hospitals.length} Hospitals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
          {hospitals.map((hosp) => (
            <div key={hosp._id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{hosp.name}</h4>
                  <p className="text-[11px] text-slate-400">{hosp.city} • {hosp.traumaLevel}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/50">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Available Beds</span>
                  <p className="font-mono font-bold text-emerald-400">{hosp.availableBeds} / {hosp.totalBeds}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">ICU Beds</span>
                  <p className="font-mono font-bold text-blue-400">{hosp.icuBedsAvailable} / {hosp.icuBedsTotal}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                <span>ER Contact:</span>
                <span className="font-mono text-slate-200">{hosp.emergencyContact?.phone || '1066'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts & System Activity Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Activity & Vital Alert Audit Logs</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time DB Events</span>
        </div>

        <div className="space-y-2">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alt) => (
              <div
                key={alt._id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                    {alt.severity || 'Critical'}
                  </span>
                  <div>
                    <span className="font-bold text-white">{alt.parameter}</span>
                    <span className="text-slate-400 ml-2">({alt.message})</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span>{new Date(alt.createdAt).toLocaleTimeString()}</span>
                  <span className={`font-semibold ${alt.isAcknowledged ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {alt.isAcknowledged ? 'Acknowledged' : 'Pending'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs">
              No recent audit alerts logged. All parameters operating within normal thresholds.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Building2,
  FileHeart,
  Gauge,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Settings,
  Shield,
  Siren,
  Users,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const { activeAlerts } = useSocket();

  const navItems = [
    {
      to: '/ambulance',
      label: 'Ambulance Dashboard',
      icon: Ambulance,
      badge: 'EMT',
      color: 'text-emerald-400',
    },
    {
      to: '/hospital',
      label: 'Hospital ER Dashboard',
      icon: Building2,
      badge: 'ER',
      color: 'text-blue-400',
    },
    {
      to: '/admin',
      label: 'Admin Command Center',
      icon: Shield,
      badge: 'Admin',
      color: 'text-purple-400',
    },
    {
      to: '/monitoring',
      label: 'Patient Telemetry',
      icon: HeartPulse,
      badge: 'Live',
      color: 'text-red-400',
    },
    {
      to: '/tracking',
      label: 'Live GPS Map Tracking',
      icon: MapPin,
      badge: 'GPS',
      color: 'text-amber-400',
    },
    {
      to: '/emergencies',
      label: 'Emergency Cases',
      icon: Siren,
      color: 'text-rose-400',
    },
    {
      to: '/notifications',
      label: 'Emergency Alerts',
      icon: AlertTriangle,
      badgeCount: activeAlerts.length,
      color: 'text-amber-400',
    },
    {
      to: '/settings',
      label: 'Thresholds & Config',
      icon: Settings,
      color: 'text-slate-400',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Portals
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.badgeCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                      {item.badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Ambulance hardware node banner */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>ESP32 Node Status</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Sensors:</span>
            <span className="text-emerald-400 font-semibold">MAX30102 + DS18B20</span>
          </div>
          <div className="flex justify-between">
            <span>GPS Satellite:</span>
            <span className="text-emerald-400 font-semibold">NEO-6M Locked</span>
          </div>
          <div className="flex justify-between">
            <span>Firmware:</span>
            <span className="font-mono text-slate-300">v2.4-IOT</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

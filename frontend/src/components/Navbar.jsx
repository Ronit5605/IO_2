import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import {
  Activity,
  Ambulance,
  Bell,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Radio,
  Shield,
  User,
  Wifi,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, quickLogin } = useAuth();
  const { isConnected, activeAlerts } = useSocket();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickSwitch = async (demo) => {
    setDemoSwitchOpen(false);
    await quickLogin(demo.email, demo.password);
    if (demo.email.includes('paramedic')) navigate('/ambulance');
    else if (demo.email.includes('admin')) navigate('/admin');
    else navigate('/hospital');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 p-0.5 shadow-md shadow-blue-900/40 flex items-center justify-center group-hover:scale-105 transition">
              <Ambulance className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  SmartPulse
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider bg-red-600/90 text-white">
                  IoT
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Smart Ambulance & Emergency System</p>
            </div>
          </Link>
        </div>

        {/* Live Network & Telemetry Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-slate-400 font-medium">Socket Gateway:</span>
              <span className={`font-semibold ${isConnected ? 'text-emerald-300' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Connecting'}
              </span>
            </div>

            <div className="h-3 w-px bg-slate-700 mx-1" />

            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse-fast" />
              <span className="text-slate-400 font-medium">MQTT Broker:</span>
              <span className="font-semibold text-blue-300">Port 1883</span>
            </div>

            <div className="h-3 w-px bg-slate-700 mx-1" />

            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400 font-medium">ESP32 Node:</span>
              <span className="font-semibold text-emerald-300">Online</span>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition"
              title="Switch user role instantly"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-bold text-white capitalize">{user?.role?.replace('_', ' ') || 'Demo'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {demoSwitchOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-scale-up">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => handleQuickSwitch(demo)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 text-slate-200 transition"
                  >
                    <div>
                      <div className="font-bold text-white">{demo.roleName}</div>
                      <div className="text-[10px] text-slate-400">{demo.badge}</div>
                    </div>
                    {user?.email === demo.email && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Link */}
          <Link
            to="/notifications"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="System Alerts & Notifications"
          >
            <Bell className="w-5 h-5" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
              </span>
            )}
          </Link>

          {/* User profile / Logout */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 hidden sm:block" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-scale-up">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Authorized Personnel'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-300 transition"
                >
                  <Activity className="w-4 h-4" />
                  Threshold Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-red-500/10 text-red-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

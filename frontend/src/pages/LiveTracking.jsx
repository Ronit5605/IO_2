import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { ambulancesAPI, hospitalsAPI, emergenciesAPI } from '../services/api.js';
import LiveMap from '../components/LiveMap.jsx';
import { Ambulance, Building2, Clock, Compass, MapPin, Navigation, Radio, Shield, Siren } from 'lucide-react';

export default function LiveTracking() {
  const { liveLocation } = useSocket();
  const [ambulances, setAmbulances] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTrackingData = async () => {
    try {
      const [ambRes, hospRes, emgRes] = await Promise.all([
        ambulancesAPI.getAll(),
        hospitalsAPI.getAll(),
        emergenciesAPI.getAll(),
      ]);

      if (ambRes.success) {
        setAmbulances(ambRes.data);
        const current = ambRes.data.find((a) => a.callSign === 'AMB-ALPHA-01') || ambRes.data[0];
        setSelectedAmbulance(current);
      }
      if (hospRes.success) setHospitals(hospRes.data);
      if (emgRes.success && emgRes.data.length > 0) {
        setActiveEmergency(emgRes.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const currentGPS = liveLocation?.location || selectedAmbulance?.currentLocation || {
    latitude: 21.1730,
    longitude: 72.8235,
    speed: 48,
  };

  const destHospital =
    activeEmergency?.destinationHospital ||
    hospitals[0]?.location || { latitude: 21.1895, longitude: 72.8258, name: 'Apollo Hospital' };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl font-black tracking-tight text-white">Live GPS Fleet Navigation & Tracking</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time satellite positioning via NEO-6M GPS modules with algorithmic transit ETA calculation
          </p>
        </div>

        {/* Selected Ambulance Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedAmbulance?._id || ''}
            onChange={(e) => {
              const amb = ambulances.find((a) => a._id === e.target.value);
              setSelectedAmbulance(amb || null);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ambulances.map((amb) => (
              <option key={amb._id} value={amb._id}>
                {amb.callSign} ({amb.vehicleNumber}) - {amb.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fullscreen Map Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <LiveMap
          ambulanceLocation={currentGPS}
          hospitalLocation={destHospital}
          ambulanceCallSign={selectedAmbulance?.callSign || 'AMB-ALPHA-01'}
          etaMinutes={activeEmergency?.etaMinutes || 8}
          distanceKm={activeEmergency?.distanceRemainingKm || 3.4}
          height="550px"
        />
      </div>

      {/* Active Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ambulances.map((amb) => {
          const isSelected = selectedAmbulance?._id === amb._id;
          const isEmergency = amb.status === 'Emergency';

          return (
            <div
              key={amb._id}
              onClick={() => setSelectedAmbulance(amb)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20'
                  : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{amb.callSign}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  isEmergency ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {amb.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{amb.model}</p>

              <div className="mt-3 pt-2 border-t border-slate-700/50 flex justify-between text-xs text-slate-300 font-mono">
                <span>Speed: {amb.currentLocation?.speed || 45} km/h</span>
                <span>Lat: {amb.currentLocation?.latitude?.toFixed(4)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

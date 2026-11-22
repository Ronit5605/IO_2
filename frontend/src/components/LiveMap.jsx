import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom SVG Icon for Ambulance Marker
const createAmbulanceIcon = (callSign = 'AMB-01', isEmergency = true) => {
  return L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: ${isEmergency ? '#dc2626' : '#2563eb'}; color: white; padding: 2px 6px; font-size: 10px; font-weight: 800; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap; margin-bottom: 2px;">
          ${callSign}
        </div>
        <div style="width: 34px; height: 34px; background: ${isEmergency ? '#dc2626' : '#2563eb'}; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.5);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 17h4V5H2v12h3m9 0h4l4-5h-3m-5 5v-7h4"/>
            <circle cx="7.5" cy="17.5" r="2.5"/>
            <circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 48],
  });
};

// Custom SVG Icon for Hospital Marker
const createHospitalIcon = (name = 'Hospital') => {
  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: #047857; color: white; padding: 2px 6px; font-size: 10px; font-weight: 800; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.4); white-space: nowrap; margin-bottom: 2px;">
          ${name}
        </div>
        <div style="width: 36px; height: 36px; background: #059669; border: 2px solid white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(5,150,105,0.5);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12m-6-6h12"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 50],
  });
};

// Component to smoothly pan the map when ambulance location changes
function RecenterAutomatically({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.panTo([lat, lng], { animate: true, duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LiveMap({
  ambulanceLocation = { latitude: 21.1730, longitude: 72.8235, speed: 45 },
  hospitalLocation = { latitude: 21.1895, longitude: 72.8258, name: 'Apollo Hospital' },
  ambulanceCallSign = 'AMB-ALPHA-01',
  etaMinutes = 8,
  distanceKm = 3.4,
  height = '420px',
}) {
  const ambPos = [ambulanceLocation.latitude || 21.1730, ambulanceLocation.longitude || 72.8235];
  const hospPos = [hospitalLocation.latitude || 21.1895, hospitalLocation.longitude || 72.8258];

  const routePolyline = [ambPos, hospPos];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl z-0" style={{ height }}>
      {/* ETA & Distance Floating HUD */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-white pointer-events-auto flex items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Transit</span>
          <span className="text-xl font-black text-amber-400 flex items-baseline gap-1">
            {etaMinutes || 8} <span className="text-xs font-bold text-slate-300">MINS (EST.)</span>
          </span>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance</span>
          <span className="text-sm font-bold text-white font-mono">
            {distanceKm || '3.4'} km
          </span>
        </div>
        <div className="h-8 w-px bg-slate-700" />
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Speed</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            {ambulanceLocation.speed || 45} km/h
          </span>
        </div>
      </div>

      <MapContainer
        center={ambPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0f172a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterAutomatically lat={ambPos[0]} lng={ambPos[1]} />

        {/* Route Connecting Ambulance to Destination Hospital */}
        <Polyline
          positions={routePolyline}
          pathOptions={{
            color: '#dc2626',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.8,
          }}
        />

        {/* Ambulance Marker */}
        <Marker position={ambPos} icon={createAmbulanceIcon(ambulanceCallSign, true)}>
          <Popup>
            <div className="text-xs text-slate-900 p-1 font-sans">
              <strong className="text-red-600 block text-sm font-bold">{ambulanceCallSign}</strong>
              <div>Status: In Transit (Emergency)</div>
              <div>Speed: {ambulanceLocation.speed || 45} km/h</div>
              <div>Coordinates: {ambPos[0].toFixed(4)}, {ambPos[1].toFixed(4)}</div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Hospital Marker */}
        <Marker position={hospPos} icon={createHospitalIcon(hospitalLocation.name)}>
          <Popup>
            <div className="text-xs text-slate-900 p-1 font-sans">
              <strong className="text-emerald-700 block text-sm font-bold">{hospitalLocation.name}</strong>
              <div>Destination Emergency Department</div>
              <div>Coordinates: {hospPos[0].toFixed(4)}, {hospPos[1].toFixed(4)}</div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ambulancesAPI, hospitalsAPI, emergenciesAPI } from '../services/api.js';
import VitalCard from '../components/VitalCard.jsx';
import LiveMap from '../components/LiveMap.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Activity,
  AlertOctagon,
  Ambulance,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Compass,
  FilePlus,
  Hospital,
  MapPin,
  Radio,
  Send,
  ShieldCheck,
  Signal,
  Siren,
  UserCheck,
  UserPlus,
  Wifi,
} from 'lucide-react';

export default function AmbulanceDashboard() {
  const { user } = useAuth();
  const { latestVital, vitalHistory, liveLocation, lastAck, addToast } = useSocket();

  const [ambulances, setAmbulances] = useState([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSOSLoading, setIsSOSLoading] = useState(false);

  // New Patient & Emergency Entry Form state
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Ramesh Patel',
    age: 58,
    gender: 'Male',
    bloodGroup: 'B+',
    chiefComplaint: 'Severe retrosternal chest pain with diaphoresis',
    emergencyType: 'Cardiac Arrest',
    severity: 'Critical',
    hospitalId: '',
    allergies: 'Penicillin',
    medicalHistory: 'Hypertension, Smoker',
  });

  const fetchData = async () => {
    try {
      const [ambRes, hospRes] = await Promise.all([
        ambulancesAPI.getAll(),
        hospitalsAPI.getAll(),
      ]);

      if (ambRes.success && ambRes.data.length > 0) {
        setAmbulances(ambRes.data);
        const current = ambRes.data.find((a) => a.callSign === 'AMB-ALPHA-01') || ambRes.data[0];
        setSelectedAmbulance(current);
        if (current.activeEmergencyId) {
          setActiveEmergency(current.activeEmergencyId);
        }
      }

      if (hospRes.success && hospRes.data.length > 0) {
        setHospitals(hospRes.data);
        if (!formData.hospitalId) {
          setFormData((prev) => ({ ...prev, hospitalId: hospRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load ambulance dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update active emergency acknowledgment when socket event arrives
  useEffect(() => {
    if (lastAck && activeEmergency && (lastAck._id === activeEmergency._id || lastAck._id === activeEmergency)) {
      setActiveEmergency(lastAck);
    }
  }, [lastAck]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedAmbulance) return;
    try {
      const res = await ambulancesAPI.update(selectedAmbulance._id, { status: newStatus });
      if (res.success) {
        setSelectedAmbulance(res.data);
        addToast({
          title: 'Status Updated',
          message: `Ambulance status changed to ${newStatus}`,
          type: 'success',
        });
      }
    } catch (e) {
      addToast({ title: 'Error', message: e.message, type: 'critical' });
    }
  };

  const handleEmergencySOS = async () => {
    if (!selectedAmbulance) return;
    setIsSOSLoading(true);
    try {
      await ambulancesAPI.triggerSOS(selectedAmbulance._id);
      handleStatusChange('Emergency');
      addToast({
        title: '🚨 EMERGENCY SOS BROADCASTED',
        message: 'Panic distress signal transmitted to all hospitals and dispatchers!',
        type: 'critical',
      });
    } catch (e) {
      addToast({ title: 'SOS Error', message: e.message, type: 'critical' });
    } finally {
      setIsSOSLoading(false);
    }
  };

  const handleCreateEmergency = async (e) => {
    e.preventDefault();
    if (!selectedAmbulance || !formData.hospitalId) return;

    try {
      const payload = {
        ambulanceId: selectedAmbulance._id,
        hospitalId: formData.hospitalId,
        emergencyType: formData.emergencyType,
        severity: formData.severity,
        patientData: {
          name: formData.name,
          age: Number(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          chiefComplaint: formData.chiefComplaint,
          allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
          medicalHistory: formData.medicalHistory ? formData.medicalHistory.split(',').map((s) => s.trim()) : [],
        },
      };

      const res = await emergenciesAPI.create(payload);
      if (res.success) {
        setActiveEmergency(res.data);
        setShowPatientForm(false);
        addToast({
          title: '🚨 EMERGENCY DISPATCHED',
          message: `Case ${res.data.caseNumber} initiated. Live telemetry & GPS stream activated.`,
          type: 'emergency',
        });
        await fetchData();
      }
    } catch (err) {
      addToast({ title: 'Creation Failed', message: err.message, type: 'critical' });
    }
  };

  const currentHR = latestVital?.heartRate ?? 82;
  const currentSpO2 = latestVital?.spo2 ?? 98;
  const currentTemp = latestVital?.temperature ?? 36.8;

  const currentGPS = liveLocation?.location || selectedAmbulance?.currentLocation || {
    latitude: 21.1730,
    longitude: 72.8235,
    speed: 48,
    heading: 42,
  };

  const destHospital =
    activeEmergency?.destinationHospital ||
    hospitals[0]?.location || { latitude: 21.1895, longitude: 72.8258, name: 'Apollo Hospital' };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-600/20 border border-blue-500/40 rounded-2xl text-blue-400">
            <Ambulance className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">
                {selectedAmbulance?.callSign || 'AMB-ALPHA-01'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {selectedAmbulance?.vehicleNumber || 'GJ-05-EM-1081'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Paramedic: <span className="text-slate-200 font-semibold">{selectedAmbulance?.paramedicName || 'Vikram Mehta (EMT-P)'}</span> | Driver: <span className="text-slate-200">{selectedAmbulance?.driverName || 'Rajesh Sharma'}</span>
            </p>
          </div>
        </div>

        {/* Status Mode Switcher & Emergency SOS */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            {['Available', 'On Duty', 'Emergency'].map((st) => {
              const isActive = selectedAmbulance?.status === st;
              return (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? st === 'Emergency'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse'
                        : 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleEmergencySOS}
            disabled={isSOSLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/40 transition active:scale-95"
            title="1-Click Emergency Beacon"
          >
            <AlertOctagon className="w-4 h-4 animate-bounce" />
            {isSOSLoading ? 'Broadcasting...' : 'Emergency SOS'}
          </button>
        </div>
      </div>

      {/* IoT Node Connectivity Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">ESP32 Firmware</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">ONLINE</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BatteryCharging className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-300 font-medium">IoT Node Battery</span>
          </div>
          <span className="text-xs font-bold font-mono text-white">94%</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Signal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Cellular / WiFi</span>
          </div>
          <span className="text-xs font-bold font-mono text-slate-200">-68 dBm</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">GPS Satellite Fix</span>
          </div>
          <span className="text-xs font-bold text-emerald-400">3D Locked</span>
        </div>
      </div>

      {/* Patient Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <VitalCard
          title="Heart Rate"
          value={currentHR}
          unit="BPM"
          type="heart"
          isAbnormal={currentHR > 100 || currentHR < 60}
          thresholdNote="Demo Alert: <60 or >100 BPM"
          subText="Sensor: MAX30102"
        />

        <VitalCard
          title="Oxygen Saturation"
          value={currentSpO2}
          unit="SpO2 %"
          type="spo2"
          isAbnormal={currentSpO2 < 94}
          thresholdNote="Demo Alert: <94% SpO2"
          subText="Sensor: MAX30102"
        />

        <VitalCard
          title="Core Temperature"
          value={currentTemp}
          unit="°C"
          type="temp"
          isAbnormal={currentTemp > 38.0}
          thresholdNote="Demo Alert: >38.0°C"
          subText="Sensor: DS18B20 OneWire"
        />
      </div>

      {/* Real-Time Vital-Sign Stream Chart & Patient Information Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Recharts Line Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Patient Biomedical Telemetry
                </h3>
                <p className="text-[11px] text-slate-400">Dynamic streaming via MQTT / Socket.IO</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● REAL-TIME STREAM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalHistory.length > 0 ? vitalHistory : [
                { time: '16:00', heartRate: 78, spo2: 98, temperature: 36.8 },
                { time: '16:01', heartRate: 82, spo2: 97, temperature: 36.8 },
                { time: '16:02', heartRate: 80, spo2: 98, temperature: 36.9 },
                { time: '16:03', heartRate: 85, spo2: 98, temperature: 36.8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2 (%)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temp (°C)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Heart Rate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> SpO2</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Temp</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Updated: just now</span>
          </div>
        </div>

        {/* Hospital Acknowledgment & Preparation Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hospital Reception Status</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                activeEmergency?.hospitalAcknowledgment?.isAcknowledged
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {activeEmergency?.hospitalAcknowledgment?.isAcknowledged ? 'ACKNOWLEDGED' : 'AWAITING ACK'}
              </span>
            </div>

            {activeEmergency?.hospitalAcknowledgment?.isAcknowledged ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Hospital Ready for Patient Reception</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {activeEmergency.hospitalAcknowledgment.responseNotes || 'ER trauma bay and resuscitation team stand ready.'}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Bay:</span>
                    <span className="font-bold text-white">{activeEmergency.hospitalAcknowledgment.assignedBay || 'Resus Bay 1'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Lead ER Doctor:</span>
                    <span className="font-bold text-white">{activeEmergency.hospitalAcknowledgment.assignedDoctor || 'Dr. On Duty'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Trauma Team:</span>
                    <span className="font-semibold text-emerald-400">Mobilized</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">ICU Bed:</span>
                    <span className="font-semibold text-emerald-400">Reserved</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center rounded-xl bg-slate-800/40 border border-slate-700/60 text-slate-400 text-xs">
                <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2 animate-spin" />
                <p className="font-semibold text-slate-200">Awaiting Hospital Confirmation</p>
                <p className="text-[11px] mt-1 text-slate-400">
                  Emergency alert broadcasted. The receiving hospital ER staff will acknowledge and reserve trauma beds.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => setShowPatientForm(!showPatientForm)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
            >
              <FilePlus className="w-4 h-4" />
              {showPatientForm ? 'Close Entry Form' : 'New Emergency / Patient Intake'}
            </button>
          </div>
        </div>
      </div>

      {/* Patient Entry Form Drawer (When toggled) */}
      {showPatientForm && (
        <div className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl animate-scale-up">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Emergency Patient Intake & Dispatch</h3>
                <p className="text-xs text-slate-400">Transmits patient demographic and triage information directly to hospital</p>
              </div>
            </div>
            <button
              onClick={() => setShowPatientForm(false)}
              className="text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateEmergency} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase">Patient Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase">Age & Gender</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase">Emergency Category</label>
              <select
                value={formData.emergencyType}
                onChange={(e) => setFormData({ ...formData, emergencyType: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              >
                <option value="Cardiac Arrest">Cardiac Arrest</option>
                <option value="Respiratory Distress">Respiratory Distress</option>
                <option value="Road Accident / Trauma">Road Accident / Trauma</option>
                <option value="Stroke">Stroke</option>
                <option value="Severe Burn">Severe Burn</option>
                <option value="General Medical">General Medical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase">Destination Hospital</label>
              <select
                value={formData.hospitalId}
                onChange={(e) => setFormData({ ...formData, hospitalId: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              >
                {hospitals.map((h) => (
                  <option key={h._id} value={h._id}>{h.name} ({h.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase">Triage Severity</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              >
                <option value="Critical">Critical (Immediate Code Red)</option>
                <option value="High">High (Urgent)</option>
                <option value="Moderate">Moderate (Delayed)</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-300 uppercase">Chief Complaint & Clinical Presentation</label>
              <input
                type="text"
                required
                value={formData.chiefComplaint}
                onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                placeholder="Chief complaints observed by EMT on site"
                className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-3 pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                Dispatch & Stream Telemetry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Live GPS Map Component */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Transit Map & Navigation</h3>
              <p className="text-[11px] text-slate-400">Interactive OpenStreetMap navigation powered by Leaflet</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span>Lat: {currentGPS.latitude?.toFixed(4)}</span>
            <span>Lng: {currentGPS.longitude?.toFixed(4)}</span>
          </div>
        </div>

        <LiveMap
          ambulanceLocation={currentGPS}
          hospitalLocation={destHospital}
          ambulanceCallSign={selectedAmbulance?.callSign || 'AMB-ALPHA-01'}
          etaMinutes={activeEmergency?.etaMinutes || 8}
          distanceKm={activeEmergency?.distanceRemainingKm || 3.4}
          height="400px"
        />
      </div>
    </div>
  );
}

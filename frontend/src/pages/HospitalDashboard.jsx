import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { hospitalsAPI, emergenciesAPI } from '../services/api.js';
import VitalCard from '../components/VitalCard.jsx';
import LiveMap from '../components/LiveMap.jsx';
import {
  Activity,
  AlertTriangle,
  Ambulance,
  Bed,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  Hospital as HospitalIcon,
  MapPin,
  Phone,
  ShieldAlert,
  Siren,
  Stethoscope,
  Thermometer,
  User,
  Wind,
} from 'lucide-react';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const { latestVital, liveLocation, incomingEmergency, addToast } = useSocket();

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [incomingEmergencies, setIncomingEmergencies] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  // Acknowledgment Modal state
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackForm, setAckForm] = useState({
    assignedBay: 'Resuscitation Bay 1 (Trauma Wing)',
    assignedDoctor: 'Dr. Sarah Connor (ER Head)',
    responseNotes: 'Trauma team mobilized. Cath Lab on standby for immediate intervention.',
    traumaTeamAlerted: true,
    bedReserved: true,
    bloodUnitsPrepared: true,
    ventilatorReady: true,
    otStandby: false,
  });

  const fetchData = async () => {
    try {
      const res = await hospitalsAPI.getAll();
      if (res.success && res.data.length > 0) {
        setHospitals(res.data);
        // Match user's assigned hospital if set, or Apollo Hospital
        let current = res.data[0];
        if (user?.hospitalId) {
          const userHospId = user.hospitalId._id || user.hospitalId;
          const found = res.data.find((h) => h._id === userHospId);
          if (found) current = found;
        }
        setSelectedHospital(current);

        // Fetch detailed emergencies for this hospital
        const detailRes = await hospitalsAPI.getById(current._id);
        if (detailRes.success && detailRes.data.incomingEmergencies) {
          setIncomingEmergencies(detailRes.data.incomingEmergencies);
          if (detailRes.data.incomingEmergencies.length > 0) {
            setActiveEmergency(detailRes.data.incomingEmergencies[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load hospital dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // When incoming emergency arrives via Socket.IO
  useEffect(() => {
    if (incomingEmergency) {
      setIncomingEmergencies((prev) => {
        const exists = prev.some((e) => e._id === incomingEmergency._id);
        if (exists) {
          return prev.map((e) => (e._id === incomingEmergency._id ? incomingEmergency : e));
        }
        return [incomingEmergency, ...prev];
      });
      if (!activeEmergency) {
        setActiveEmergency(incomingEmergency);
      }
    }
  }, [incomingEmergency]);

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);
    try {
      const detailRes = await hospitalsAPI.getById(hospital._id);
      if (detailRes.success) {
        setIncomingEmergencies(detailRes.data.incomingEmergencies || []);
        setActiveEmergency(detailRes.data.incomingEmergencies?.[0] || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcknowledge = async () => {
    if (!activeEmergency) return;
    try {
      const payload = {
        assignedBay: ackForm.assignedBay,
        assignedDoctor: ackForm.assignedDoctor,
        responseNotes: ackForm.responseNotes,
        readinessChecklist: {
          traumaTeamAlerted: ackForm.traumaTeamAlerted,
          bedReserved: ackForm.bedReserved,
          bloodUnitsPrepared: ackForm.bloodUnitsPrepared,
          ventilatorReady: ackForm.ventilatorReady,
          otStandby: ackForm.otStandby,
        },
      };

      const res = await emergenciesAPI.acknowledge(activeEmergency._id, payload);
      if (res.success) {
        setActiveEmergency(res.data);
        setAckModalOpen(false);
        addToast({
          title: 'Emergency Acknowledged',
          message: 'Readiness status broadcasted to ambulance paramedic.',
          type: 'success',
        });
        await fetchData();
      }
    } catch (err) {
      addToast({ title: 'Acknowledgment Failed', message: err.message, type: 'critical' });
    }
  };

  const handleAdmitPatient = async () => {
    if (!activeEmergency) return;
    try {
      const res = await emergenciesAPI.updateStatus(activeEmergency._id, {
        status: 'Admitted',
        outcome: 'Patient received by ER trauma team and admitted to intensive care.',
        handoffSummary: 'Full electronic telemetry and paramedic handoff completed.',
      });
      if (res.success) {
        setActiveEmergency(null);
        addToast({
          title: 'Patient Admitted',
          message: `Case ${res.data.caseNumber} marked as Admitted. Emergency bay cleared.`,
          type: 'success',
        });
        await fetchData();
      }
    } catch (err) {
      addToast({ title: 'Action Failed', message: err.message, type: 'critical' });
    }
  };

  const currentHR = latestVital?.heartRate ?? 84;
  const currentSpO2 = latestVital?.spo2 ?? 97;
  const currentTemp = latestVital?.temperature ?? 36.9;

  const currentGPS = liveLocation?.location || activeEmergency?.currentLocation || {
    latitude: 21.1730,
    longitude: 72.8235,
    speed: 48,
  };

  const hospLocation = selectedHospital?.location || {
    latitude: 21.1895,
    longitude: 72.8258,
    name: selectedHospital?.name || 'Apollo Hospital',
  };

  const patient = activeEmergency?.patientId;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      {/* Hospital Overview Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-white">
                {selectedHospital?.name || 'Apollo Speciality Hospital'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                {selectedHospital?.traumaLevel || 'Level 1 Trauma'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Address: <span className="text-slate-300">{selectedHospital?.address}, {selectedHospital?.city}</span> | ER Hotline: <span className="text-slate-300 font-mono">{selectedHospital?.emergencyContact?.phone || '1066'}</span>
            </p>
          </div>
        </div>

        {/* Hospital Switcher for Presentation */}
        <div className="flex items-center gap-3">
          <select
            value={selectedHospital?._id || ''}
            onChange={(e) => {
              const h = hospitals.find((hosp) => hosp._id === e.target.value);
              if (h) handleSelectHospital(h);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {hospitals.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hospital Capacity & ER Standby Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Incoming Ambulances</span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block">
              {incomingEmergencies.length}
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Ambulance className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available ER Beds</span>
            <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
              {selectedHospital?.availableBeds || 18} <span className="text-xs text-slate-500 font-normal">/ {selectedHospital?.totalBeds || 120}</span>
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Bed className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ICU Beds Free</span>
            <span className="text-2xl font-black text-blue-400 font-mono mt-0.5 block">
              {selectedHospital?.icuBedsAvailable || 5} <span className="text-xs text-slate-500 font-normal">/ {selectedHospital?.icuBedsTotal || 30}</span>
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Trauma Team Standby</span>
            <span className="text-xs font-bold text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MOBILIZED & READY
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Section: Incoming Cases List + Active Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming Patients Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Siren className="w-5 h-5 text-red-500 animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Incoming En Route Ambulances</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-800 rounded text-slate-300">
                {incomingEmergencies.length} ACTIVE
              </span>
            </div>

            {incomingEmergencies.length > 0 ? (
              <div className="space-y-3">
                {incomingEmergencies.map((emg) => {
                  const isSelected = activeEmergency?._id === emg._id;
                  const isCritical = emg.severity === 'Critical';

                  return (
                    <div
                      key={emg._id}
                      onClick={() => setActiveEmergency(emg)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {emg.severity}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-300">
                            {emg.caseNumber}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ETA: {emg.etaMinutes || 8}m
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">
                        {emg.patientId?.name || 'Incoming Emergency Patient'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {emg.emergencyType} | {emg.ambulanceId?.callSign || 'AMB-ALPHA-01'}
                      </p>

                      <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/50">
                        <span className="text-slate-400">Status:</span>
                        <span className={`font-semibold ${
                          emg.hospitalAcknowledgment?.isAcknowledged ? 'text-emerald-400' : 'text-amber-400 animate-pulse'
                        }`}>
                          {emg.hospitalAcknowledgment?.isAcknowledged ? 'Acknowledged' : 'Needs Acknowledgment'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Ambulance className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No active ambulances currently en route to this facility.
              </div>
            )}
          </div>
        </div>

        {/* Selected Incoming Patient Medical Details & Live Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {activeEmergency ? (
            <>
              {/* Patient Profile Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Case: {activeEmergency.caseNumber}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                        {activeEmergency.severity} Priority
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-2">
                      {patient?.name || 'Emergency Patient'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {patient?.age || 58} Yrs • {patient?.gender || 'Male'} • Blood Group: <span className="font-bold text-red-400">{patient?.bloodGroup || 'B+'}</span>
                    </p>
                  </div>

                  {/* Accept / Acknowledge & Admit Controls */}
                  <div className="flex items-center gap-2">
                    {!activeEmergency.hospitalAcknowledgment?.isAcknowledged ? (
                      <button
                        onClick={() => setAckModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 transition active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Acknowledge & Prepare ER
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                          ✓ Bay Reserved ({activeEmergency.hospitalAcknowledgment.assignedBay})
                        </span>
                        <button
                          onClick={handleAdmitPatient}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                        >
                          Admit Patient
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Chief Complaint</span>
                    <span className="font-medium text-slate-200 mt-1 block">
                      {patient?.chiefComplaint || activeEmergency.emergencyType}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Reported Allergies</span>
                    <span className="font-medium text-amber-300 mt-1 block">
                      {patient?.allergies?.length > 0 ? patient.allergies.join(', ') : 'No known allergies'}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 font-semibold block uppercase text-[10px]">Medical History</span>
                    <span className="font-medium text-slate-200 mt-1 block">
                      {patient?.medicalHistory?.length > 0 ? patient.medicalHistory.join(', ') : 'None reported'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Streaming Vitals from Ambulance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VitalCard
                  title="Heart Rate"
                  value={currentHR}
                  unit="BPM"
                  type="heart"
                  isAbnormal={currentHR > 100 || currentHR < 60}
                  thresholdNote="Alert Threshold: 60-100 BPM"
                  subText="Live IoT Stream"
                />

                <VitalCard
                  title="Blood Oxygen"
                  value={currentSpO2}
                  unit="SpO2 %"
                  type="spo2"
                  isAbnormal={currentSpO2 < 94}
                  thresholdNote="Alert Threshold: <94%"
                  subText="Live IoT Stream"
                />

                <VitalCard
                  title="Core Temp"
                  value={currentTemp}
                  unit="°C"
                  type="temp"
                  isAbnormal={currentTemp > 38.0}
                  thresholdNote="Alert Threshold: >38.0°C"
                  subText="Live IoT Stream"
                />
              </div>

              {/* Live Interactive Map with ETA */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Ambulance Approach GPS Tracking & ETA
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    ETA: {activeEmergency.etaMinutes || 8} MINS (ESTIMATE)
                  </span>
                </div>

                <LiveMap
                  ambulanceLocation={currentGPS}
                  hospitalLocation={hospLocation}
                  ambulanceCallSign={activeEmergency.ambulanceId?.callSign || 'AMB-ALPHA-01'}
                  etaMinutes={activeEmergency.etaMinutes || 8}
                  distanceKm={activeEmergency.distanceRemainingKm || 3.4}
                  height="360px"
                />
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-xl">
              <HospitalIcon className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-white">No Emergency Case Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select an incoming ambulance from the queue on the left, or wait for an ambulance to initiate a case.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hospital Acknowledgment & Preparation Modal */}
      {ackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-w-lg w-full ring-2 ring-emerald-500/30 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Hospital Emergency Acknowledgment</h3>
              </div>
              <button onClick={() => setAckModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Acknowledge receiving incoming patient <strong className="text-white">{patient?.name}</strong>. This status transmits in real time to the ambulance dashboard.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase">Assigned ER Bay</label>
                <input
                  type="text"
                  value={ackForm.assignedBay}
                  onChange={(e) => setAckForm({ ...ackForm, assignedBay: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase">Lead Emergency Physician</label>
                <input
                  type="text"
                  value={ackForm.assignedDoctor}
                  onChange={(e) => setAckForm({ ...ackForm, assignedDoctor: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase">Emergency Preparation Checklist</label>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <label className="flex items-center gap-2 text-slate-200">
                    <input
                      type="checkbox"
                      checked={ackForm.traumaTeamAlerted}
                      onChange={(e) => setAckForm({ ...ackForm, traumaTeamAlerted: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600"
                    />
                    Trauma Team Alerted
                  </label>
                  <label className="flex items-center gap-2 text-slate-200">
                    <input
                      type="checkbox"
                      checked={ackForm.bedReserved}
                      onChange={(e) => setAckForm({ ...ackForm, bedReserved: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600"
                    />
                    Emergency Bed Reserved
                  </label>
                  <label className="flex items-center gap-2 text-slate-200">
                    <input
                      type="checkbox"
                      checked={ackForm.bloodUnitsPrepared}
                      onChange={(e) => setAckForm({ ...ackForm, bloodUnitsPrepared: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600"
                    />
                    Blood Bank Units Ready
                  </label>
                  <label className="flex items-center gap-2 text-slate-200">
                    <input
                      type="checkbox"
                      checked={ackForm.ventilatorReady}
                      onChange={(e) => setAckForm({ ...ackForm, ventilatorReady: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-blue-600"
                    />
                    Ventilator Ready
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase">Paramedic Response Instructions</label>
                <textarea
                  rows={2}
                  value={ackForm.responseNotes}
                  onChange={(e) => setAckForm({ ...ackForm, responseNotes: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleAcknowledge}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Broadcast Confirmation to Ambulance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

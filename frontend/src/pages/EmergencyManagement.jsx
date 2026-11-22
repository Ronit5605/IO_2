import React, { useState, useEffect } from 'react';
import { emergenciesAPI } from '../services/api.js';
import {
  AlertOctagon,
  Ambulance,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Hospital,
  MapPin,
  Search,
  ShieldAlert,
  Siren,
  User,
} from 'lucide-react';

export default function EmergencyManagement() {
  const [emergencies, setEmergencies] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmergencies = async () => {
    try {
      const res = await emergenciesAPI.getAll();
      if (res.success) {
        setEmergencies(res.data);
        if (res.data.length > 0 && !selectedCase) {
          setSelectedCase(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const filtered = emergencies.filter((emg) => {
    if (filterStatus === 'ALL') return true;
    return emg.status === filterStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Siren className="w-7 h-7 text-red-500 animate-pulse" />
            <h1 className="text-2xl font-black tracking-tight text-white">Emergency Incident Registry</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of prehospital dispatches, live transit timelines, and ER admissions
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {['ALL', 'En Route', 'Hospital Acknowledged', 'Completed', 'Admitted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Incident Cases List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Incident Queue</h3>
            <span className="text-xs font-mono text-slate-400">{filtered.length} Cases</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filtered.map((emg) => {
              const isSelected = selectedCase?._id === emg._id;
              const isCritical = emg.severity === 'Critical';

              return (
                <div
                  key={emg._id}
                  onClick={() => setSelectedCase(emg)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-blue-500 ring-2 ring-blue-500/20'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-400">{emg.caseNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {emg.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm">{emg.patientId?.name || 'Emergency Patient'}</h4>
                  <p className="text-xs text-slate-400">{emg.emergencyType}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex justify-between text-[11px] text-slate-400">
                    <span>{emg.ambulanceId?.callSign || 'AMB-ALPHA-01'}</span>
                    <span className="font-semibold text-slate-300">{emg.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Case Inspection & Audit Trail */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedCase ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-400">{selectedCase.caseNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                      {selectedCase.severity} Priority
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {selectedCase.emergencyType}
                  </h2>
                </div>
                <span className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-800 border border-slate-700 text-slate-200">
                  Status: {selectedCase.status}
                </span>
              </div>

              {/* Patient & Dispatcher Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <User className="w-4 h-4 text-blue-400" />
                    Patient Details
                  </div>
                  <div className="text-slate-300">Name: <strong className="text-white">{selectedCase.patientId?.name}</strong></div>
                  <div className="text-slate-300">Age / Gender: {selectedCase.patientId?.age} Yrs, {selectedCase.patientId?.gender}</div>
                  <div className="text-slate-300">Blood Group: <strong className="text-red-400">{selectedCase.patientId?.bloodGroup}</strong></div>
                  <div className="text-slate-300">Chief Complaint: {selectedCase.patientId?.chiefComplaint}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Hospital className="w-4 h-4 text-emerald-400" />
                    Hospital & Transport
                  </div>
                  <div className="text-slate-300">Hospital: <strong className="text-white">{selectedCase.destinationHospital?.name}</strong></div>
                  <div className="text-slate-300">Ambulance: {selectedCase.ambulanceId?.callSign} ({selectedCase.ambulanceId?.vehicleNumber})</div>
                  <div className="text-slate-300">Transit ETA: <strong className="text-amber-400">{selectedCase.etaMinutes || 8} Minutes</strong></div>
                  <div className="text-slate-300">Assigned Bay: {selectedCase.hospitalAcknowledgment?.assignedBay || 'Resus Bay 1'}</div>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Emergency Milestone Timeline</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Emergency Incident Dispatched & Telemetry Link Established</span>
                    <span className="ml-auto font-mono text-slate-500">{new Date(selectedCase.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {selectedCase.hospitalAcknowledgment?.isAcknowledged && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Receiving Hospital Acknowledged and Prepared Trauma Unit</span>
                      <span className="ml-auto font-mono text-slate-500">
                        {new Date(selectedCase.hospitalAcknowledgment.acknowledgedAt || selectedCase.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {selectedCase.completionDetails?.completedAt && (
                    <div className="flex items-center gap-3 text-slate-300">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                      <span>{selectedCase.completionDetails.outcome || 'Patient Admitted to Intensive Care'}</span>
                      <span className="ml-auto font-mono text-slate-500">
                        {new Date(selectedCase.completionDetails.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 text-xs">
              Select an incident from the queue to view full audit details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

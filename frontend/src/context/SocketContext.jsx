import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket.js';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [latestVital, setLatestVital] = useState(null);
  const [vitalHistory, setVitalHistory] = useState([]);
  const [liveLocation, setLiveLocation] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [criticalModalAlert, setCriticalModalAlert] = useState(null);
  const [incomingEmergency, setIncomingEmergency] = useState(null);
  const [lastAck, setLastAck] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      // Join relevant rooms based on user role
      if (user) {
        if (user.role === 'admin') socket.emit('join_admin');
        if (user.hospitalId) socket.emit('join_hospital', user.hospitalId?._id || user.hospitalId);
        if (user.ambulanceId) socket.emit('join_ambulance', user.ambulanceId?._id || user.ambulanceId);
      }
    };

    const onDisconnect = () => setIsConnected(false);

    const onVitalUpdate = (data) => {
      setLatestVital(data.vitals);
      setVitalHistory((prev) => {
        const item = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          heartRate: data.vitals.heartRate,
          spo2: data.vitals.spo2,
          temperature: data.vitals.temperature,
          isAbnormal: data.vitals.isAbnormal,
        };
        const updated = [...prev, item];
        return updated.slice(-30); // Keep last 30 readings
      });
    };

    const onLocationUpdate = (data) => {
      setLiveLocation(data);
    };

    const onCriticalVitalAlert = (alert) => {
      setActiveAlerts((prev) => [alert, ...prev.slice(0, 19)]);
      setCriticalModalAlert(alert);
      addToast({
        title: `🚨 EMERGENCY ALERT: ${alert.parameter}`,
        message: alert.message,
        type: 'critical',
      });
    };

    const onNewEmergencyAlert = (emergency) => {
      setIncomingEmergency(emergency);
      addToast({
        title: `🚑 INCOMING EMERGENCY (${emergency.severity})`,
        message: `${emergency.emergencyType} en route to ${emergency.destinationHospital?.name}. ETA: ${emergency.etaMinutes} mins.`,
        type: 'emergency',
      });
    };

    const onHospitalAck = (emergency) => {
      setLastAck(emergency);
      addToast({
        title: `✅ HOSPITAL ACKNOWLEDGMENT RECEIVED`,
        message: `${emergency.destinationHospital?.name} confirmed readiness! Assigned to ${emergency.hospitalAcknowledgment?.assignedBay || 'Trauma Bay'}.`,
        type: 'success',
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('vital_update', onVitalUpdate);
    socket.on('global_vital_stream', onVitalUpdate);
    socket.on('location_update', onLocationUpdate);
    socket.on('global_location_stream', onLocationUpdate);
    socket.on('critical_vital_alert', onCriticalVitalAlert);
    socket.on('new_emergency_alert', onNewEmergencyAlert);
    socket.on('emergency_created', onNewEmergencyAlert);
    socket.on('hospital_acknowledged', onHospitalAck);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('vital_update', onVitalUpdate);
      socket.off('global_vital_stream', onVitalUpdate);
      socket.off('location_update', onLocationUpdate);
      socket.off('global_location_stream', onLocationUpdate);
      socket.off('critical_vital_alert', onCriticalVitalAlert);
      socket.off('new_emergency_alert', onNewEmergencyAlert);
      socket.off('emergency_created', onNewEmergencyAlert);
      socket.off('hospital_acknowledged', onHospitalAck);
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        latestVital,
        vitalHistory,
        liveLocation,
        activeAlerts,
        criticalModalAlert,
        setCriticalModalAlert,
        incomingEmergency,
        lastAck,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

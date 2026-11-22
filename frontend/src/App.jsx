import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import SimulationBar from './components/SimulationBar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import EmergencyAlertModal from './components/EmergencyAlertModal.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AmbulanceDashboard from './pages/AmbulanceDashboard.jsx';
import HospitalDashboard from './pages/HospitalDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PatientMonitoring from './pages/PatientMonitoring.jsx';
import LiveTracking from './pages/LiveTracking.jsx';
import EmergencyManagement from './pages/EmergencyManagement.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';

// Protected App Layout
function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3" />
        Initializing SmartPulse Platform...
      </div>
    );
  }

  // If not authenticated, still allow accessing demo dashboards gracefully with fallback user, or redirect to login
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <SimulationBar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-slate-950 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <EmergencyAlertModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Dashboard Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/ambulance" replace />} />
              <Route path="/ambulance" element={<AmbulanceDashboard />} />
              <Route path="/hospital" element={<HospitalDashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/monitoring" element={<PatientMonitoring />} />
              <Route path="/tracking" element={<LiveTracking />} />
              <Route path="/emergencies" element={<EmergencyManagement />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/ambulance" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

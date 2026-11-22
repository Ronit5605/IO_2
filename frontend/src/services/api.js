const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const authAPI = {
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiFetch('/auth/me'),
};

export const ambulancesAPI = {
  getAll: (params = '') => apiFetch(`/ambulances${params}`),
  getById: (id) => apiFetch(`/ambulances/${id}`),
  update: (id, data) => apiFetch(`/ambulances/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  triggerSOS: (id) => apiFetch(`/ambulances/${id}/sos`, { method: 'POST' }),
};

export const hospitalsAPI = {
  getAll: () => apiFetch('/hospitals'),
  getById: (id) => apiFetch(`/hospitals/${id}`),
  updateReadiness: (id, data) => apiFetch(`/hospitals/${id}/readiness`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const emergenciesAPI = {
  getAll: (params = '') => apiFetch(`/emergencies${params}`),
  getById: (id) => apiFetch(`/emergencies/${id}`),
  create: (data) => apiFetch('/emergencies', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, data) => apiFetch(`/emergencies/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  acknowledge: (id, data) => apiFetch(`/emergencies/${id}/acknowledge`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const vitalsAPI = {
  create: (data) => apiFetch('/vitals', { method: 'POST', body: JSON.stringify(data) }),
  getByPatient: (patientId, limit = 50) => apiFetch(`/vitals/${patientId}?limit=${limit}`),
};

export const alertsAPI = {
  getAll: (params = '') => apiFetch(`/alerts${params}`),
  acknowledge: (id) => apiFetch(`/alerts/${id}/acknowledge`, { method: 'PUT' }),
};

export const locationsAPI = {
  getHistory: (ambulanceId, limit = 100) => apiFetch(`/locations/${ambulanceId}?limit=${limit}`),
  sendLocation: (data) => apiFetch('/locations', { method: 'POST', body: JSON.stringify(data) }),
};

export const notificationsAPI = {
  getAll: (params = '') => apiFetch(`/notifications${params}`),
  markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' }),
};

export const simulationAPI = {
  getStatus: () => apiFetch('/simulation/status'),
  start: (interval = 3000) => apiFetch('/simulation/start', { method: 'POST', body: JSON.stringify({ interval }) }),
  stop: () => apiFetch('/simulation/stop', { method: 'POST' }),
  setPreset: (preset) => apiFetch('/simulation/preset', { method: 'POST', body: JSON.stringify({ preset }) }),
  step: () => apiFetch('/simulation/step', { method: 'POST' }),
};

export const statsAPI = {
  getOverview: () => apiFetch('/stats/overview'),
  getAnalytics: () => apiFetch('/stats/analytics'),
};

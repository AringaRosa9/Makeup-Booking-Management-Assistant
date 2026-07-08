const BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

export const api = {
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),

  getNotice: () => request('/notices'),
  updateNotice: (content) => request('/notices', { method: 'PUT', body: JSON.stringify({ content }) }),

  getTypes: () => request('/makeup/types'),
  addType: (body) => request('/makeup/types', { method: 'POST', body: JSON.stringify(body) }),
  updateType: (id, body) => request(`/makeup/types/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteType: (id) => request(`/makeup/types/${id}`, { method: 'DELETE' }),

  getExtras: () => request('/makeup/extras'),
  addExtra: (body) => request('/makeup/extras', { method: 'POST', body: JSON.stringify(body) }),
  updateExtra: (id, body) => request(`/makeup/extras/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteExtra: (id) => request(`/makeup/extras/${id}`, { method: 'DELETE' }),

  getAvailableDates: (month) => request(`/appointments/available-dates${month ? `?month=${month}` : ''}`),
  setAvailableDate: (body) => request('/appointments/available-dates', { method: 'POST', body: JSON.stringify(body) }),
  deleteAvailableDate: (date) => request(`/appointments/available-dates/${date}`, { method: 'DELETE' }),

  createAppointment: (formData) => request('/appointments', { method: 'POST', body: formData, headers: {} }),
  getAppointments: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/appointments?${qs}`);
  },
  updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  cancelAppointment: (id) => request(`/appointments/${id}/cancel`, { method: 'PUT' }),

  getIncomeSummary: (month) => request(`/income/summary?month=${month}`),
  getIncomeDetails: (month) => request(`/income/details?month=${month}`),
  getIncomeStats: () => request('/income/stats'),
  addManualIncome: (body) => request('/income/manual', { method: 'POST', body: JSON.stringify(body) }),
  deleteManualIncome: (id) => request(`/income/manual/${id}`, { method: 'DELETE' }),
};

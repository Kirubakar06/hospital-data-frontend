import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let accessToken = null;
let refreshRequest = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

export function refreshSession() {
  refreshRequest ||= api.post('/auth/refresh').then((response) => {
    const session = response.data.data;
    accessToken = session.accessToken;
    return session;
  }).finally(() => { refreshRequest = null; });
  return refreshRequest;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {
  const original = error.config;
  if (error.response?.status !== 401 || !original || original._retried
    || original.url?.includes('/auth/login') || original.url?.includes('/auth/setup')
    || original.url?.includes('/auth/refresh') || original.url?.includes('/auth/setup-status')) {
    return Promise.reject(error);
  }
  original._retried = true;
  try {
    const session = await refreshSession();
    original.headers.Authorization = `Bearer ${session.accessToken}`;
    return api(original);
  } catch (refreshError) {
    accessToken = null;
    window.dispatchEvent(new CustomEvent('carepoint:session-expired'));
    return Promise.reject(refreshError);
  }
});

export async function listRecords(key) {
  const response = await api.get(`/${encodeURIComponent(key)}`, { params: { limit: 1000 } });
  return response.data.data.records;
}

export async function searchPatients(query) {
  const response = await api.get('/patients/search', { params: { q: query } });
  return response.data.data.records;
}

export async function createRecord(key, values) {
  const response = await api.post(`/${encodeURIComponent(key)}`, values);
  return response.data.data;
}

export async function updateRecord(key, id, values) {
  const response = await api.put(`/${encodeURIComponent(key)}/${encodeURIComponent(id)}`, values);
  return response.data.data;
}

export async function deleteRecord(key, id) {
  const response = await api.delete(`/${encodeURIComponent(key)}/${encodeURIComponent(id)}`);
  return response.data.data;
}

export function errorMessage(error, fallback = 'The request could not be completed.') {
  return error.response?.data?.message || error.message || fallback;
}

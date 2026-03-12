import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

export const importCSV = () => API.post('/import-csv');
export const rescanCSV = () => API.post('/rescan-csv');
export const startSending = (count) => API.post('/start-sending', { count });
export const stopSending = () => API.post('/stop-sending');
export const retryFailed = () => API.post('/retry-failed');
export const getStats = () => API.get('/stats');
export const getContacts = (params = {}) => API.get('/contacts', { params });
export const getProgress = () => API.get('/progress');

export default API;

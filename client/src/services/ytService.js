import axios from 'axios';

const YT_SECRET = import.meta.env.VITE_YT_SECRET || '';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// All YT API calls include the secret header
const ytApi = axios.create({
  baseURL: `${BASE}/yt`,
  headers: {
    'Content-Type': 'application/json',
    'x-yt-secret': YT_SECRET
  }
});

const ytService = {
  getAllConfig:    ()             => ytApi.get('/config'),
  getSectionConfig: (section)    => ytApi.get(`/config/${section}`),
  updateSection:  (section, cfg) => ytApi.put(`/config/${section}`, { config: cfg }),
  resetSection:   (section)      => ytApi.post(`/config/reset/${section}`),
  getStats:       ()             => ytApi.get('/stats'),
  getLogs:        ()             => ytApi.get('/logs'),
  promoteAll:     ()             => ytApi.post('/promote-all'),
  clearCache:     ()             => ytApi.delete('/clear-cache'),
  exportAll:      ()             => ytApi.get('/export-all')
};

export default ytService;

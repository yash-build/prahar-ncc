/**
 * godApi.js — Axios instance for God Mode endpoints
 * Uses x-yt-secret header instead of JWT
 */
import axios from 'axios';

let _secret = '';

const godApi = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/yt',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

godApi.interceptors.request.use((config) => {
  if (_secret) config.headers['x-yt-secret'] = _secret;
  return config;
});

export const setGodSecret = (s) => { _secret = s; };
export default godApi;

import axios from 'axios';

// Production builds talk to "/api" on the SAME domain; client/vercel.json proxies it to the backend.
// That keeps login cookies first-party. To bypass the proxy, set VITE_API_DIRECT_URL at build time.
// Development uses VITE_API_URL (or http://localhost:5000/api).
const direct = (import.meta.env.VITE_API_DIRECT_URL || '').trim();
const dev = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
const raw = (import.meta.env.PROD ? direct || '/api' : dev).replace(/\/+$/, '');
const baseURL = raw.endsWith('/api') ? raw : `${raw}/api`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000, // serverless cold starts can take a few seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

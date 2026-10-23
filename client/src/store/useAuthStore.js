import { create } from 'zustand';
import { api } from '../config/axios.js';

const COOKIE_HINT =
  'Your account worked, but the browser did not keep the sign-in cookie. Allow cookies for this site (turn off "block third-party cookies") or try another browser.';

const describeError = (error, fallback) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (!error.response) return 'Cannot reach the server. Check your connection and the API URL setting.';
  return fallback;
};

// After login/register, confirm the session cookie really works before treating the user as signed in.
const confirmSession = async (set) => {
  try {
    const me = await api.get('/users/me');
    set({ user: me.data, isAuthenticated: true, isLoading: false, error: null });
    return { success: true, user: me.data };
  } catch {
    set({ user: null, isAuthenticated: false, isLoading: false, error: COOKIE_HINT });
    return { success: false };
  }
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    try {
      const response = await api.get('/users/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/users/register', { email, password });
    } catch (error) {
      set({ error: describeError(error, 'Registration failed'), isLoading: false });
      return { success: false };
    }
    return confirmSession(set);
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/users/login', { email, password });
    } catch (error) {
      set({ error: describeError(error, 'Login failed'), isLoading: false });
      return { success: false };
    }
    return confirmSession(set);
  },

  logout: async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
    set({ user: null, isAuthenticated: false });
  },
}));

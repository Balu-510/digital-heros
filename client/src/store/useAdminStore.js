import { create } from 'zustand';
import { api } from '../config/axios.js';

export const useAdminStore = create((set) => ({
  users: [],
  draws: [],
  charities: [],
  analytics: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/analytics');
      set({ analytics: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to fetch analytics', isLoading: false });
    }
  },

  simulateDraw: async (month, drawType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/draws/simulate', { month, drawType });
      set((state) => ({ 
        draws: [response.data, ...state.draws],
        isLoading: false 
      }));
      return { success: true, data: response.data };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to simulate draw', isLoading: false });
      return { success: false };
    }
  },

  publishDraw: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/draws/${id}/publish`);
      set((state) => ({
        draws: state.draws.map(draw => draw._id === id ? response.data : draw),
        isLoading: false
      }));
      return { success: true };
    } catch {
      set({ error: 'Failed to publish draw', isLoading: false });
      return { success: false };
    }
  }
}));
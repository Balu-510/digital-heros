import { create } from 'zustand';
import { api } from '../config/axios.js';
import { useAuthStore } from './useAuthStore.js';

export const useCharityStore = create((set) => ({
  charities: [],
  isLoading: false,
  error: null,

  fetchCharities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/charities');
      set({ charities: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load charity directory', isLoading: false });
    }
  },

  updatePreference: async (charityId, contributionPercentage) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/users/charity-preference', {
        charityId,
        contributionPercentage
      });
      
      useAuthStore.setState({ user: response.data });
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update preferences', 
        isLoading: false 
      });
      return { success: false };
    }
  }
}));
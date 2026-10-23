import { create } from 'zustand';
import { api } from '../config/axios.js';

export const usePaymentStore = create((set) => ({
  isLoading: false,
  error: null,

  createCheckoutSession: async (plan) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/payments/create-checkout-session', { plan });
      window.location.href = response.data.url; 
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to initialize checkout session', 
        isLoading: false 
      });
      return { success: false };
    }
  }
}));
import { create } from 'zustand';
import { api } from '../config/axios.js';

export const useDrawStore = create((set) => ({
  userWinnings: [],
  pendingVerifications: [],
  isLoading: false,
  error: null,

  // For Subscribers: Fetch their specific winnings and draw history
  fetchUserWinnings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/draws/my-winnings');
      set({ userWinnings: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load winnings', isLoading: false });
    }
  },

  // For Subscribers: Upload screenshot proof[cite: 8]
  uploadVerificationProof: async (drawId, file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('proof', file);
      
      await api.post(`/draws/${drawId}/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const response = await api.get('/draws/my-winnings');
      set({ userWinnings: response.data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Upload failed', isLoading: false });
      return { success: false };
    }
  },

  // For Admins: Fetch all pending proofs
  fetchPendingVerifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/admin/verifications');
      set({ pendingVerifications: response.data, isLoading: false });
    } catch {
      set({ error: 'Failed to load verifications', isLoading: false });
    }
  },

  // For Admins: Approve or Reject proof[cite: 9]
  processVerification: async (drawId, userId, action) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/admin/verifications/${drawId}`, { userId, action });
      
      set((state) => ({
        pendingVerifications: state.pendingVerifications.filter(
          v => !(v.drawId === drawId && v.userId === userId)
        ),
        isLoading: false
      }));
      return { success: true };
    } catch {
      set({ error: 'Failed to process verification', isLoading: false });
      return { success: false };
    }
  }
}));
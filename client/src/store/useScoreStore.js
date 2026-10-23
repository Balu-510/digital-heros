import { create } from 'zustand';
import { api } from '../config/axios.js';

export const useScoreStore = create((set, get) => ({
  scores: [],
  isLoading: false,
  error: null,

  fetchScores: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/scores');
      set({ scores: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch scores', isLoading: false });
    }
  },

  addScore: async (points, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/scores', { points, date });
      set({ scores: response.data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to add score', isLoading: false });
      return { success: false, message: error.response?.data?.message };
    }
  },

  updateScore: async (id, points) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/scores/${id}`, { points });
      const currentScores = get().scores;
      const updatedScores = currentScores.map(score => 
        score._id === id ? { ...score, points: response.data.points } : score
      );
      set({ scores: updatedScores, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update score', isLoading: false });
      return { success: false };
    }
  }
}));
import { create } from 'zustand';

export const useStore = create((set) => ({
  lastPrediction: null,
  setLastPrediction: (prediction) => set({ lastPrediction: prediction }),
  isPredicting: false,
  setIsPredicting: (status) => set({ isPredicting: status })
}));

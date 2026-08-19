import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      lastPrediction: null,
      history: [],
      setLastPrediction: (prediction) => set((state) => ({ 
        lastPrediction: prediction,
        history: [{ ...prediction, id: Date.now() }, ...state.history]
      })),
      isPredicting: false,
      setIsPredicting: (status) => set({ isPredicting: status }),
      clearHistory: () => set({ history: [] })
    }),
    {
      name: 'flat-predict-storage',
    }
  )
);

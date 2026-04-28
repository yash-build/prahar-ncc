import { create } from 'zustand';

const useCadetStore = create((set) => ({
  cadets: [],
  setCadets: (cadets) => set({ cadets }),
}));

export default useCadetStore;

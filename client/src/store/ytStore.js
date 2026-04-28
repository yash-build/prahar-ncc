import { create } from 'zustand';

const useYTStore = create((set) => ({
  config: {},
  setConfig: (config) => set({ config }),
}));

export default useYTStore;

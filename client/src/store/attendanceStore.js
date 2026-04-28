import { create } from 'zustand';

const useAttendanceStore = create((set) => ({
  sessions: [],
  setSessions: (sessions) => set({ sessions }),
}));

export default useAttendanceStore;

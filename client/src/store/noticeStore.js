import { create } from 'zustand';

const useNoticeStore = create((set) => ({
  notices: [],
  setNotices: (notices) => set({ notices }),
}));

export default useNoticeStore;

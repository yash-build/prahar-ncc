import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,

      setAuth: (user, token) => {
        set({ user, token });
        console.log('[PRAHAR AUTH] Logged in as:', user.role, user.email);
      },

      logout: () => {
        set({ user: null, token: null });
        console.log('[PRAHAR AUTH] Logged out');
        window.location.href = '/login';
      },

      setHydrated: () => set({ isHydrated: true }),

      isANO:   () => get().user?.role === 'ANO',
      isSUO:   () => get().user?.role === 'SUO',
      isCadet: () => get().user?.role === 'cadet',
      isStaff: () => ['ANO', 'SUO'].includes(get().user?.role),
    }),
    {
      name: 'prahar-auth-v2',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        console.log('[PRAHAR AUTH] Rehydrated. User:', state?.user?.role || 'none');
      },
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;

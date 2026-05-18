import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:       null,
      token:      null,
      isHydrated: false,

      setAuth: (user, token) => {
        set({ user, token });
        console.log('[AUTH] Logged in as:', user.role, user.email);
      },
      logout: () => {
        set({ user: null, token: null });
        window.location.href = '/login';
      },
      setHydrated: () => set({ isHydrated: true }),

      // Convenience role checks
      isANO:    () => get().user?.role === 'ANO',
      isSUO:    () => get().user?.role === 'SUO',
      isCadet:  () => get().user?.role === 'cadet',
      isGodMode:() => get().user?.isGodMode === true,
    }),
    {
      name:    'prahar-auth-v2',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        console.log('[AUTH] Rehydrated:', state?.user?.role || 'none');
      },
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
);

export default useAuthStore;

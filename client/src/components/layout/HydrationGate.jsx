import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';

const HydrationGate = ({ children }) => {
  const isHydrated = useAuthStore(s => s.isHydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isHydrated) { setReady(true); return; }
    const timeout = setTimeout(() => setReady(true), 500);
    const unsub = useAuthStore.subscribe((state) => {
      if (state.isHydrated) { setReady(true); clearTimeout(timeout); }
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, [isHydrated]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#1a1d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#c8b98a] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#c8b98a] font-mono text-xs tracking-widest">INITIALIZING PRAHAR...</p>
        </div>
      </div>
    );
  }
  return children;
};

export default HydrationGate;

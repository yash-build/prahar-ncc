import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';

const HydrationGate = ({ children }) => {
  const isHydrated = useAuthStore(s => s.isHydrated);
  const [ready, setReady] = useState(isHydrated); // Skip delay if already hydrated

  useEffect(() => {
    if (isHydrated) { setReady(true); return; }

    // Fallback timeout — if zustand never fires onRehydrateStorage
    const t = setTimeout(() => setReady(true), 600);

    const unsub = useAuthStore.subscribe(s => {
      if (s.isHydrated) {
        clearTimeout(t);
        setReady(true);
      }
    });

    return () => { clearTimeout(t); unsub(); };
  }, [isHydrated]);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center bg-olive-dark">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Spinner */}
        <div className="w-10 h-10 border-2 border-khaki/20 border-t-khaki rounded-full animate-spin" />
        <div className="font-mono text-2xs text-khaki/50 tracking-widest uppercase">
          Initializing PRAHAR...
        </div>
      </motion.div>
    </div>
  );

  return children;
};

export default HydrationGate;

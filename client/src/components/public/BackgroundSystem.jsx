import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NCC_BACKGROUNDS = [
  { url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=80', caption: 'Republic Day Parade' },
  { url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=1920&q=80', caption: 'Physical Training' },
  { url: 'https://images.unsplash.com/photo-1552072092-7f9b8d63efcb?w=1920&q=80', caption: 'Drill Formation' },
  { url: 'https://images.unsplash.com/photo-1569163139500-a5a46aee87bc?w=1920&q=80', caption: 'Camp Training' },
  { url: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=1920&q=80', caption: 'Discipline and Service' },
];

const BackgroundSystem = ({ children, overlay = 0.75, blur = 0, autoRotate = true, rotateInterval = 6000, parallax = true, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!autoRotate) return;
    const timer = setInterval(() => setCurrentIndex(prev => (prev + 1) % NCC_BACKGROUNDS.length), rotateInterval);
    return () => clearInterval(timer);
  }, [autoRotate, rotateInterval]);

  useEffect(() => {
    if (!parallax) return;
    const handle = (e) => setMousePos({
      x: (e.clientX / window.innerWidth  - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    });
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [parallax]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="crossfade">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            style={{ transform: parallax ? `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.05)` : undefined, transition: parallax ? 'transform 0.1s ease-out' : undefined }}
            className="absolute inset-0"
          >
            <img src={NCC_BACKGROUNDS[currentIndex].url} alt={NCC_BACKGROUNDS[currentIndex].caption}
                 className="w-full h-full object-cover" style={{ filter: blur > 0 ? `blur(${blur}px)` : 'none' }} loading="lazy" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 z-10" style={{ backgroundColor: `rgba(26,29,22,${overlay})` }} />
      <div className="absolute inset-0 z-10 opacity-20 pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`, backgroundSize: '200px', mixBlendMode: 'overlay' }} />
      <div className="absolute bottom-4 left-6 z-20">
        <span className="font-mono text-[10px] text-white/30 tracking-widest uppercase">{NCC_BACKGROUNDS[currentIndex].caption}</span>
      </div>
      {autoRotate && (
        <div className="absolute bottom-4 right-6 z-20 flex gap-2">
          {NCC_BACKGROUNDS.map((_, i) => (
            <button key={i} onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#c8b98a] w-4' : 'bg-white/30 w-1.5'}`} />
          ))}
        </div>
      )}
      <div className="relative z-20">{children}</div>
    </div>
  );
};

export default BackgroundSystem;

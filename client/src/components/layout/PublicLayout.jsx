import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NCCBackground from '../ui/NCCBackground';

const NAV_LINKS = [
  { to: '/yearbook',     label: 'Yearbook' },
  { to: '/gallery',      label: 'Gallery' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/notices',      label: 'Notices' },
];

const PublicLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-smoke">
      <NCCBackground />

      {/* Subtle animated background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-olive-dark/5"
            style={{
              width:  `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left:   `${Math.random() * 100}%`,
              top:    `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 12 + 10}s`,
            }}
          />
        ))}
        {/* Large ambient blobs */}
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-olive/5 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full bg-khaki/5 blur-[100px]" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-20 bg-olive-dark/95 backdrop-blur-md border-b border-white/8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="w-8 h-8 bg-khaki/20 border border-khaki/40 flex items-center justify-center rounded-sm transition-colors group-hover:bg-khaki/30">
              <span className="font-display text-khaki text-lg">P</span>
            </div>
            <div>
              <div className="font-display text-2xl text-khaki tracking-[0.15em] leading-none group-hover:text-gold transition-colors">
                PRAHAR
              </div>
              <div className="font-mono text-2xs text-olive-faint/40 tracking-widest leading-none">
                LCIT NCC
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 font-heading text-sm font-medium uppercase tracking-wide transition-all duration-200
                    ${isActive ? 'text-khaki' : 'text-olive-faint/70 hover:text-parchment'}`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="pubNav"
                      className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-khaki to-transparent"
                    />
                  )}
                </Link>
              );
            })}
            <Link
              to="/login"
              className="ml-4 btn-gold text-xs px-5 py-2"
            >
              Portal Access
            </Link>
          </nav>

          {/* Mobile nav - simplified */}
          <div className="md:hidden flex items-center gap-2">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className="text-olive-faint/70 hover:text-parchment font-heading text-xs uppercase transition-colors">
                {label}
              </Link>
            ))}
            <Link to="/login" className="btn-gold text-xs px-3 py-1.5">Portal</Link>
          </div>
        </div>
      </header>

      {/* ── Page Content ── */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex-1 relative z-10"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="relative z-10 bg-olive-dark border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl text-khaki tracking-widest">PRAHAR</div>
          <div className="font-mono text-2xs text-olive-faint/35 text-center">
            LCIT COLLEGE NCC UNIT — BILASPUR, CHHATTISGARH
          </div>
          <div className="font-mono text-2xs text-olive-faint/35">
            &copy; 2024 · Developed by <span className="text-khaki/70">Yash Tiwari</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;

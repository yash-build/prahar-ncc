import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const PORTAL_NAV = [
  { to: '/portal',              label: 'Overview',       icon: '⬛' },
  { to: '/portal/attendance',   label: 'My Attendance',  icon: '📋' },
  { to: '/portal/notices',      label: 'Notices',        icon: '📢' },
  { to: '/portal/events',       label: 'Events',         icon: '🏕️' },
  { to: '/portal/achievements', label: 'Achievements',   icon: '🏆' },
  { to: '/portal/certificates', label: 'Certificates',   icon: '📜' },
  { to: '/portal/profile',      label: 'My Profile',     icon: '👤' },
];

const PortalShell = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); toast.success('Signed out'); navigate('/login'); };

  return (
    <div className="min-h-screen bg-smoke flex flex-col">
      {/* Top nav */}
      <header className="bg-olive-dark border-b border-white/8 h-14 flex items-center px-4 md:px-6 gap-4 shrink-0 z-20">
        <Link to="/" className="font-display text-xl text-khaki tracking-widest">PRAHAR</Link>
        <div className="font-mono text-2xs text-olive-faint/30 tracking-widest hidden md:block">CADET PORTAL</div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-olive-faint/60 hidden md:block">{user?.name}</span>
          <span className="badge font-mono text-2xs bg-khaki/20 text-khaki border border-khaki/30">{user?.role}</span>
          <button onClick={handleLogout} className="font-mono text-2xs text-red-400/60 hover:text-red-300 transition-colors ml-2">Sign Out</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-white border-r border-stone-200 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 border-b border-stone-100">
            <div className="w-10 h-10 rounded-sm bg-olive/8 border border-olive/15 flex items-center justify-center mb-2">
              <span className="font-display text-olive-dark text-xl">{user?.name?.[0]}</span>
            </div>
            <div className="font-heading font-semibold text-olive-dark text-sm truncate">{user?.name}</div>
            <div className="font-mono text-2xs text-olive-muted">{user?.role}</div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {PORTAL_NAV.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-heading font-medium uppercase tracking-wide transition-all duration-150
                    ${isActive ? 'bg-olive/8 text-olive-dark border-l-2 border-olive' : 'text-olive-muted hover:text-olive-dark hover:bg-stone-50 border-l-2 border-transparent'}`}
                >
                  <span className="text-sm w-4 text-center">{item.icon}</span>
                  <span className="truncate text-xs">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-stone-100">
            {(user?.role === 'ANO' || user?.role === 'SUO') && (
              <Link to="/dashboard" className="font-mono text-2xs text-khaki-dark hover:underline block mb-2">↗ Admin Dashboard</Link>
            )}
            <button onClick={handleLogout} className="font-mono text-2xs text-red-400/70 hover:text-red-500 transition-colors">⏏ Sign Out</button>
          </div>
        </aside>

        {/* Main */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default PortalShell;

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    group: 'Operations',
    items: [
      { name: 'Dashboard',      path: '/dashboard',              icon: '⬛', roles: ['ANO','SUO'] },
      { name: 'Cadet Registry', path: '/dashboard/cadets',       icon: '👤', roles: ['ANO','SUO'] },
      { name: 'Attendance',     path: '/dashboard/attendance',   icon: '📋', roles: ['ANO','SUO'] },
      { name: 'Events & Camps', path: '/dashboard/events',       icon: '🏕️', roles: ['ANO','SUO'] },
    ]
  },
  {
    group: 'Publications',
    items: [
      { name: 'Notice Board',   path: '/dashboard/notices',      icon: '📢', roles: ['ANO','SUO'] },
      { name: 'Honor Roll',     path: '/dashboard/honor-roll',   icon: '🎖️', roles: ['ANO','SUO'] },
      { name: 'Gallery',        path: '/dashboard/gallery',      icon: '🖼️', roles: ['ANO','SUO'] },
      { name: 'Achievements',   path: '/dashboard/achievements', icon: '🏆', roles: ['ANO','SUO'] },
    ]
  },
  {
    group: 'ANO Control',
    items: [
      { name: 'Reports',        path: '/dashboard/reports',      icon: '📊', roles: ['ANO', 'SUO'] },
      { name: 'Batch Promotion',path: '/dashboard/batch',        icon: '⬆️', roles: ['ANO'] },
      { name: 'Settings',       path: '/dashboard/settings',     icon: '⚙️', roles: ['ANO'] },
      { name: 'Audit Logs',     path: '/dashboard/audit',        icon: '🔍', roles: ['ANO'] },
    ]
  }
];

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="w-[260px] h-full bg-olive-dark flex flex-col shadow-2xl relative overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)' }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div>
          <div className="font-display text-2xl text-khaki tracking-[0.15em]">PRAHAR</div>
          <div className="font-mono text-2xs text-olive-faint/50 tracking-military mt-0.5">LCIT NCC COMMAND</div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden text-olive-faint/50 hover:text-parchment transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* User pill */}
      <div className="relative mx-4 mt-4 mb-2 px-4 py-3 rounded-sm bg-white/5 border border-white/8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-khaki/20 border border-khaki/40 flex items-center justify-center">
          <span className="font-display text-khaki text-lg">{user?.name?.[0] || 'U'}</span>
        </div>
        <div className="min-w-0">
          <div className="font-heading font-semibold text-parchment text-sm truncate">{user?.name}</div>
          <div className="font-mono text-2xs text-khaki tracking-wider">{user?.role}</div>
        </div>
        <div className="ml-auto">
          <span className="status-dot-active" />
        </div>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-hidden px-3 py-2 space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(i => i.roles.includes(user?.role));
          if (!visibleItems.length) return null;

          return (
            <div key={group.group}>
              <div className="font-mono text-2xs text-olive-faint/35 uppercase tracking-military px-3 mb-1.5">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-heading font-medium uppercase tracking-wide transition-all duration-200 group
                        ${isActive
                          ? 'text-khaki bg-white/10 border-l-2 border-khaki pl-2.5'
                          : 'text-olive-faint/60 hover:text-parchment hover:bg-white/6 border-l-2 border-transparent'
                        }`}
                    >
                      <span className="text-base w-5 text-center">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="ml-auto w-1 h-1 rounded-full bg-khaki"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative border-t border-white/8 p-4 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-olive-faint/50 hover:text-parchment text-xs font-mono uppercase tracking-wider transition-colors"
        >
          <span>↗</span> Public Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-red-400/70 hover:text-red-300 text-xs font-mono uppercase tracking-wider transition-colors"
        >
          <span>⏏</span> Sign Out
        </button>
        <div className="font-mono text-2xs text-olive-faint/25 text-center tracking-widest mt-2">
          v2.0 • PRAHAR
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

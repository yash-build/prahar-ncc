import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const PortalHome = () => {
  const { user } = useAuthStore();
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.get('/notices/public').then(r => { if (r.data?.success) setNotices(r.data.notices?.slice(0,3) || []); }).catch(()=>{});
  }, []);

  const PORTAL_LINKS = [
    { to: '/portal/attendance',   icon: '📋', label: 'Attendance',   sub: 'View your record' },
    { to: '/portal/notices',      icon: '📢', label: 'Notices',      sub: 'Latest updates' },
    { to: '/portal/events',       icon: '🏕️', label: 'Events',       sub: 'Upcoming camps' },
    { to: '/portal/achievements', icon: '🏆', label: 'Achievements', sub: 'Your honors' },
    { to: '/portal/certificates', icon: '📜', label: 'Certificates', sub: 'Download certificates' },
    { to: '/portal/profile',      icon: '👤', label: 'Profile',      sub: 'Manage your info' },
  ];

  return (
    <div className="page-shell">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">WELCOME BACK</div>
          <h1 className="section-title">{user?.name}</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">{user?.role} · LCIT NCC Unit</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-sm">
          <span className="status-dot-active" />
          <span className="font-mono text-xs text-emerald-700">Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {PORTAL_LINKS.map((link, i) => (
          <motion.div key={link.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={link.to}
              className="card p-5 flex items-center gap-4 group cursor-pointer hover:border-olive/20 block"
            >
              <div className="w-10 h-10 bg-olive/6 border border-olive/12 rounded-sm flex items-center justify-center text-xl shrink-0 group-hover:border-khaki/40 transition-colors">
                {link.icon}
              </div>
              <div>
                <div className="font-heading font-semibold text-olive-dark uppercase text-sm">{link.label}</div>
                <div className="font-mono text-2xs text-olive-muted">{link.sub}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {notices.length > 0 && (
        <div className="card p-5">
          <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide mb-4 text-sm">Latest Notices</h3>
          <div className="space-y-3">
            {notices.map((n,i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-stone-50 last:border-0">
                <span className={`badge shrink-0 mt-0.5 ${n.priority==='URGENT'?'badge-red':n.priority==='IMPORTANT'?'badge-amber':'badge-olive'}`}>{n.priority}</span>
                <div><div className="font-heading font-semibold text-olive-dark text-sm">{n.title}</div><div className="font-mono text-2xs text-olive-muted">{n.body?.slice(0,80)}...</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default PortalHome;

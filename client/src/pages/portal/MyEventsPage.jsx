import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events')
      .then(r => { if (r.data.success) setEvents(r.data.events); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS_BADGE = { UPCOMING: 'badge-blue', ONGOING: 'badge-green', COMPLETED: 'badge-olive', CANCELLED: 'badge-red' };

  return (
    <div className="page-shell">
      <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div>
      <h1 className="section-title mb-6">Events & Camps</h1>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="card skeleton h-24" />)}</div>
      ) : events.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏕️</div>
            <div className="empty-state-title">No events scheduled yet</div>
            <div className="empty-state-sub">Upcoming training camps and competitions will appear here.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev, i) => (
            <motion.div
              key={ev._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(`/events/${ev._id}`)}
              className="card p-5 cursor-pointer hover:border-olive/20 group flex items-center gap-5"
            >
              <div className="w-14 h-14 bg-olive/6 border border-olive/12 rounded-sm flex items-center justify-center text-2xl shrink-0 group-hover:border-khaki/40 transition-colors">
                🏕️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex gap-2 mb-1">
                  <span className={STATUS_BADGE[ev.status] || 'badge-olive'}>{ev.status}</span>
                  <span className="font-mono text-2xs text-olive-muted">{ev.type || 'EVENT'}</span>
                </div>
                <h3 className="font-heading font-bold text-olive-dark">{ev.title}</h3>
                <div className="font-mono text-2xs text-olive-muted mt-0.5">
                  {ev.startDate ? new Date(ev.startDate).toLocaleDateString('en-IN') : ''}{ev.location ? ` · ${ev.location}` : ''}
                </div>
              </div>
              <span className="text-olive-muted/30 group-hover:text-olive-muted transition-colors text-lg shrink-0">→</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyEventsPage;

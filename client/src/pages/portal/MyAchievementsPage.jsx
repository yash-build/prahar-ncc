import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const MyAchievementsPage = () => {
  const { user } = useAuthStore();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Filter achievements by logged-in cadet's service number or ID
    api.get('/achievements/public')
      .then(r => {
        if (r.data.success) {
          const mine = r.data.achievements.filter(a =>
            a.cadetId === user?._id || a.cadetServiceNumber === user?.serviceNumber
          );
          setAchievements(mine);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const LEVEL_BADGE = { NATIONAL: 'badge-gold', STATE: 'badge-blue', UNIT: 'badge-olive' };

  return (
    <div className="page-shell">
      <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div>
      <h1 className="section-title mb-6">My Achievements</h1>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="card skeleton h-28" />)}</div>
      ) : achievements.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <div className="empty-state-title">No achievements recorded yet</div>
            <div className="empty-state-sub">Awards and recognitions logged by your ANO will appear here.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((a, i) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card p-0 overflow-hidden"
            >
              <div className="flex">
                <div className="w-2 shrink-0 bg-gradient-to-b from-gold to-khaki" />
                <div className="flex-1 p-6 flex gap-5 items-start">
                  <div className="w-12 h-12 bg-gold/10 border border-khaki/30 rounded-sm flex items-center justify-center text-2xl shrink-0">🎖️</div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={LEVEL_BADGE[a.level] || 'badge-olive'}>{a.level}</span>
                      <span className="font-mono text-2xs text-olive-muted">{a.date ? new Date(a.date).toLocaleDateString('en-IN') : ''}</span>
                    </div>
                    <h3 className="font-heading font-bold text-olive-dark text-xl mb-1">{a.title}</h3>
                    <p className="text-olive-muted text-sm">{a.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyAchievementsPage;

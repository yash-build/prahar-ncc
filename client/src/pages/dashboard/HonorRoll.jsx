import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const HonorRoll = () => {
  const [cadets, setCadets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCadets = async () => {
      try {
        const { data } = await api.get('/cadets', { params: { status: 'ACTIVE', limit: 100 } });
        if (data.success) setCadets(data.cadets.filter(c => c.isHonorRoll || c.isSUOPosition || c.isJUOPosition));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchCadets();
  }, []);

  const getRank = (c) => {
    if (c.isSUOPosition) return { label: 'SUO', color: '#d4af37' };
    if (c.isJUOPosition) return { label: 'JUO', color: '#c2b280' };
    return { label: c.rank, color: '#6b7a69' };
  };

  return (
    <AnimatedPage className="page-shell">
      <div>
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">RECOGNITION</div>
        <h1 className="section-title">Honor Roll</h1>
        <p className="font-mono text-xs text-olive-muted mt-1">Distinguished cadets and command hierarchy.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_,i) => <div key={i} className="card p-4"><div className="skeleton h-24 mb-3 rounded" /><div className="skeleton h-4 w-3/4 mb-2" /><div className="skeleton h-3 w-1/2" /></div>)}
        </div>
      ) : cadets.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">🎖️</div><div className="empty-state-title">No honored cadets yet</div><div className="empty-state-sub">SUO/JUO positions and honor roll cadets appear here.</div></div></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cadets.map((c, i) => {
            const r = getRank(c);
            return (
              <motion.div key={c._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }} className="card overflow-hidden group">
                <div className="h-36 bg-gradient-to-br from-olive/10 to-khaki/10 relative flex items-center justify-center">
                  {c.photoUrl ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                    : <span className="font-display text-5xl text-olive/20">{c.name[0]}</span>}
                  <div className="absolute top-2 right-2">
                    <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded-sm" style={{ background: r.color + '25', color: r.color, border: `1px solid ${r.color}40` }}>{r.label}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold text-olive-dark text-base truncate">{c.name}</h3>
                  <div className="font-mono text-2xs text-olive-muted mt-1">{c.wing} Wing · Yr {c.yearOfStudy}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatedPage>
  );
};
export default HonorRoll;

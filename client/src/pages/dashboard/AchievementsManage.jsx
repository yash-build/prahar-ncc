import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const LEVEL_BADGE = { NATIONAL:'badge-gold', STATE:'badge-blue', DISTRICT:'badge-olive', UNIT:'badge-olive', INTERNATIONAL:'badge-red' };

const AchievementsManage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/achievements/admin')
      .then(r => { if (r.data?.success) setItems(r.data.achievements); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell">
      <div className="flex justify-between items-center">
        <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">RECORDS</div><h1 className="section-title">Achievements</h1></div>
        <button className="btn-primary">+ Log Achievement</button>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="skeleton h-12"/>)}</div>
        ) : items.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏆</div><div className="empty-state-title">No achievements logged</div><div className="empty-state-sub">Use the button above to record an achievement.</div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Achievement</th><th>Level</th><th>Result</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {items.map((a,i)=>(
                  <motion.tr key={a._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}>
                    <td className="font-heading font-semibold text-olive-dark">{a.name}</td>
                    <td><span className={LEVEL_BADGE[a.level]||'badge-olive'}>{a.level}</span></td>
                    <td className="font-mono text-xs text-olive-muted">{a.result}</td>
                    <td className="font-mono text-2xs text-olive-muted">{new Date(a.date).toLocaleDateString()}</td>
                    <td><span className={a.status==='APPROVED'?'badge-green':'badge-amber'}>{a.status}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AchievementsManage;

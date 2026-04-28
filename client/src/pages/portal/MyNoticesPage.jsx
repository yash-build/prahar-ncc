import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/notices/public')
      .then(r => { if (r.data.success) setNotices(r.data.notices); })
      .finally(() => setLoading(false));
  }, []);

  const PRIORITY_BADGE = {
    URGENT: 'badge-red', IMPORTANT: 'badge-amber', NORMAL: 'badge-olive', INFO: 'badge-blue',
  };

  return (
    <div className="page-shell">
      <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div>
      <h1 className="section-title mb-6">Notices & Announcements</h1>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="card skeleton h-20" />)}</div>
      ) : notices.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📢</div><div className="empty-state-title">No notices published yet</div></div></div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <motion.div
              key={n._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/dashboard/notices/${n._id}`)}
              className="card p-5 cursor-pointer hover:border-olive/20 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <span className={`badge ${PRIORITY_BADGE[n.priority] || 'badge-olive'}`}>{n.priority}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-olive-dark group-hover:text-olive transition-colors">{n.title}</h3>
                  <p className="font-mono text-xs text-olive-muted mt-1 line-clamp-2">{n.body}</p>
                  <div className="font-mono text-2xs text-olive-muted/60 mt-2">
                    {new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-IN')} · {n.targetAudience}
                  </div>
                </div>
                <span className="text-olive-muted/30 group-hover:text-olive-muted transition-colors text-lg shrink-0">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyNoticesPage;

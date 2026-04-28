import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const AuditLog = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/yt/logs', { headers: { 'x-yt-secret': import.meta.env.VITE_YT_SECRET || 'PRAHAR_YT_2024_HIDDEN' } })
      .then(r => { if (r.data.success) setLogs(r.data.logs); })
      .catch(() => toast.error('Could not load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  const ACTION_COLOR = {
    CADET_CREATED: 'badge-green', CADET_DELETED: 'badge-red',
    CADET_UPDATED: 'badge-blue',  NOTICE_CREATED: 'badge-amber', NOTICE_PUBLISHED: 'badge-olive',
  };

  return (
    <AnimatedPage className="page-shell">
      <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">SECURITY</div><h1 className="section-title">Audit Logs</h1><p className="font-mono text-xs text-olive-muted mt-1">All system actions are logged and tamper-proof.</p></div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(8)].map((_,i) => <div key={i} className="skeleton h-10" />)}</div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">No audit logs yet</div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Timestamp</th><th>Action</th><th>Performed By</th><th>Entity</th></tr></thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="font-mono text-2xs text-olive-muted">{new Date(log.createdAt).toLocaleString()}</td>
                    <td><span className={ACTION_COLOR[log.action] || 'badge-olive'}>{log.action}</span></td>
                    <td className="font-heading font-semibold text-olive-dark">{log.performedBy?.name || '—'}</td>
                    <td className="font-mono text-2xs text-olive-muted">{log.entityType}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};
export default AuditLog;

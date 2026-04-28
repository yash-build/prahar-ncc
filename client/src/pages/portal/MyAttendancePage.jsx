import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const MyAttendancePage = () => {
  const { user } = useAuthStore();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/attendance/cadet/${user._id}`)
      .then(r => {
        if (r.data.success) {
          setEntries(r.data.entries);
          setStats(r.data.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const pct = stats.percentage;
  const pctColor = pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600';
  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="page-shell">
      <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div>
      <h1 className="section-title mb-6">My Attendance Record</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Sessions', val: stats.total, color: 'text-olive-dark' },
          { label: 'Present', val: stats.present, color: 'text-emerald-600' },
          { label: 'Percentage', val: `${pct}%`, color: pctColor },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <div className={`font-display text-4xl mb-1 ${s.color}`}>{s.val}</div>
            <div className="font-mono text-2xs text-olive-muted tracking-military">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card p-5 mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-xs text-olive-muted uppercase tracking-wider">Attendance Rate</span>
          <span className={`font-display text-xl ${pctColor}`}>{pct}%</span>
        </div>
        <div className="h-3 bg-stone-100 rounded-sm overflow-hidden">
          <motion.div
            className={`h-full ${barColor} rounded-sm`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        {pct < 75 && (
          <p className="font-mono text-xs text-red-500 mt-2">⚠ Below 75% threshold — you are flagged as a defaulter.</p>
        )}
      </div>

      {/* Session log */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-heading font-bold text-olive-dark uppercase text-sm">Session History</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_,i) => <div key={i} className="skeleton h-10" />)}</div>
        ) : entries.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No sessions recorded yet</div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Session Type</th><th>Status</th></tr></thead>
              <tbody>
                {entries.map((e, i) => (
                  <motion.tr key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="font-mono text-xs text-olive-muted">
                      {e.sessionId?.date ? new Date(e.sessionId.date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="font-mono text-xs">{e.sessionId?.sessionType || '—'}</td>
                    <td>
                      <span className={`badge ${e.status === 'P' ? 'badge-green' : e.status === 'A' ? 'badge-red' : 'badge-amber'}`}>
                        {e.status === 'P' ? 'Present' : e.status === 'A' ? 'Absent' : 'Leave'}
                      </span>
                    </td>
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
export default MyAttendancePage;

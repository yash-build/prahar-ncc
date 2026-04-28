/**
 * GodPanelData.jsx — Notices, Achievements, Gallery, Attendance panels for God Mode
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import godApi from '../../services/godApi';

/* ── Generic data table ─────────────────────────────────────────── */
const DataTable = ({ title, endpoint, columns, onRefresh }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => godApi.get(endpoint).then(r => {
    const key = Object.keys(r.data).find(k => Array.isArray(r.data[k]));
    if (key) setItems(r.data[key]);
  }).finally(() => setLoading(false));

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (prompt('Type CONFIRM to delete') !== 'CONFIRM') return;
    try { await godApi.delete(`${endpoint}/${id}`); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="glass overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-display text-xl text-parchment">{title}</h3>
        <span className="font-mono text-2xs text-white/30">{items.length} records</span>
      </div>
      {loading ? <div className="p-8 text-center text-white/30 font-mono text-sm">Loading...</div> : items.length === 0 ? (
        <div className="p-8 text-center text-white/20 font-mono text-sm">No data</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-white/10 text-white/30 font-mono text-2xs uppercase">
              {columns.map(c => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {items.map(item => (
                <tr key={item._id} className="hover:bg-white/5 transition-colors">
                  {columns.map(c => <td key={c.key} className="px-4 py-2 font-mono text-xs text-white/50 max-w-[200px] truncate">{c.render ? c.render(item) : (item[c.key] || '—')}</td>)}
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => handleDelete(item._id)} className="font-mono text-2xs text-red-400/60 hover:text-red-300">DELETE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ── Notices Panel ──────────────────────────────────────────────── */
export const GodPanelNotices = () => (
  <div>
    <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Notice Control</h2>
    <DataTable title="All Notices" endpoint="/notices" columns={[
      { key: 'title', label: 'Title' },
      { key: 'priority', label: 'Priority', render: n => <span className={`font-mono text-2xs px-2 py-0.5 rounded ${n.priority === 'URGENT' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300'}`}>{n.priority}</span> },
      { key: 'targetAudience', label: 'Target' },
      { key: 'createdAt', label: 'Created', render: n => new Date(n.createdAt).toLocaleDateString() },
    ]} />
  </div>
);

/* ── Achievements Panel ────────────────────────────────────────── */
export const GodPanelAchievements = () => (
  <div>
    <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Achievement Control</h2>
    <DataTable title="All Achievements" endpoint="/achievements" columns={[
      { key: 'title', label: 'Title' },
      { key: 'level', label: 'Level', render: a => <span className="font-mono text-2xs text-gold">{a.level}</span> },
      { key: 'type', label: 'Type' },
      { key: 'date', label: 'Date', render: a => a.date ? new Date(a.date).toLocaleDateString() : '—' },
    ]} />
  </div>
);

/* ── Gallery Panel ─────────────────────────────────────────────── */
export const GodPanelGallery = () => (
  <div>
    <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Gallery Control</h2>
    <DataTable title="All Gallery Items" endpoint="/gallery" columns={[
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'imageUrl', label: 'Image', render: g => g.imageUrl ? <img src={g.imageUrl} alt="" className="w-10 h-10 object-cover rounded-sm border border-white/10" /> : '—' },
      { key: 'createdAt', label: 'Created', render: g => new Date(g.createdAt).toLocaleDateString() },
    ]} />
  </div>
);

/* ── Attendance Panel ──────────────────────────────────────────── */
export const GodPanelAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => godApi.get('/attendance').then(r => { if (r.data.success) setSessions(r.data.sessions); }).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (prompt('Type CONFIRM to delete session + all entries') !== 'CONFIRM') return;
    try { await godApi.delete(`/attendance/${id}`); toast.success('Session deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Attendance Control</h2>
      <div className="glass overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30 font-mono text-sm">Loading...</div> : sessions.length === 0 ? (
          <div className="p-8 text-center text-white/20 font-mono text-sm">No sessions</div>
        ) : (
          <div className="divide-y divide-white/5">
            {sessions.map(s => (
              <div key={s._id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <span className="font-mono text-xs text-red-400/60">{new Date(s.date).toLocaleDateString()}</span>
                <span className="font-mono text-2xs text-parchment">{s.sessionType}</span>
                <span className={`font-mono text-2xs px-2 py-0.5 rounded ${s.isLocked ? 'bg-red-900/40 text-red-300' : 'bg-emerald-900/40 text-emerald-300'}`}>{s.isLocked ? 'LOCKED' : 'OPEN'}</span>
                <span className="font-mono text-2xs text-white/30 ml-auto">P:{s.totalPresent||0} A:{s.totalAbsent||0} L:{s.totalLeave||0}</span>
                <button onClick={() => handleDelete(s._id)} className="font-mono text-2xs text-red-400/60 hover:text-red-300">DELETE</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

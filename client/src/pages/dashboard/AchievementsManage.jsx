import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';
import useAuthStore from '../../store/authStore';

const LEVELS    = ['NATIONAL', 'STATE', 'DISTRICT', 'UNIT', 'INTERNATIONAL'];
const ACH_TYPES = ['SHOOTING', 'DRILL', 'TREKKING', 'CULTURAL', 'ACADEMIC', 'SPORTS', 'SOCIAL_SERVICE', 'OTHER'];

const LEVEL_BADGE = {
  NATIONAL:      'badge-red',
  STATE:         'badge-blue',
  DISTRICT:      'badge-green',
  UNIT:          'badge-olive',
  INTERNATIONAL: 'badge-gold',
};

const AchievementsManage = () => {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [form, setForm] = useState({
    name: '', type: 'SHOOTING', level: 'DISTRICT', result: '', date: '',
    cadetId: '', description: '',
  });
  const [cadets, setCadets] = useState([]);
  const { user } = useAuthStore();
  const isANO = user?.role === 'ANO';

  const fetchItems = () => {
    setLoading(true);
    api.get('/achievements')
      .then(r => { if (r.data?.success) setItems(r.data.achievements || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
    api.get('/cadets', { params: { limit: 200 } })
      .then(r => { if (r.data?.success) setCadets(r.data.cadets || []); })
      .catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/achievements', form);
      if (data.success) {
        toast.success('Achievement logged');
        setShowForm(false);
        setForm({ name: '', type: 'SHOOTING', level: 'DISTRICT', result: '', date: '', cadetId: '', description: '' });
        fetchItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log achievement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/achievements/${id}/approve`);
      toast.success('Achievement approved');
      setItems(prev => prev.map(a => a._id === id ? { ...a, status: 'APPROVED' } : a));
    } catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason (optional):') ?? '';
    try {
      await api.put(`/achievements/${id}/reject`, { reason });
      toast.success('Achievement rejected');
      fetchItems();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/achievements/${id}`);
      toast.success('Deleted');
      setItems(prev => prev.filter(a => a._id !== id));
    } catch { toast.error('Failed'); }
  };

  const filtered = filterLevel === 'ALL' ? items : items.filter(a => a.level === filterLevel);

  return (
    <AnimatedPage className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">RECORDS</div>
          <h1 className="section-title">Achievements</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">{items.length} total · {items.filter(a => a.status === 'PENDING_APPROVAL').length} pending</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Log Achievement'}
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card p-6">
            <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide mb-5">Log New Achievement</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Achievement Name</label>
                  <input className="input" required placeholder="e.g. Best Cadet Award" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Cadet (optional)</label>
                  <select className="input bg-white" value={form.cadetId} onChange={e => setForm(p => ({ ...p, cadetId: e.target.value }))}>
                    <option value="">— Unit / Team Achievement —</option>
                    {cadets.map(c => <option key={c._id} value={c._id}>{c.name} ({c.serviceNumber})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input bg-white" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {ACH_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Level</label>
                  <select className="input bg-white" value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Result / Position</label>
                  <input className="input" placeholder="e.g. Gold Medal / 1st Place" value={form.result}
                    onChange={e => setForm(p => ({ ...p, result: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input" required value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea className="input h-20 resize-none" placeholder="Brief description of the achievement..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Saving...' : '✓ Save Achievement'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', ...LEVELS].map(l => (
          <button key={l} onClick={() => setFilterLevel(l)}
            className={`font-mono text-2xs uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all
              ${filterLevel === l ? 'bg-olive-dark text-parchment border-olive-dark' : 'bg-white text-olive-muted border-stone-200 hover:border-olive/30'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <div className="empty-state-title">No achievements logged</div>
            <div className="empty-state-sub">Use the button above to record a unit or cadet achievement.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Achievement</th>
                  <th>Type</th>
                  <th>Level</th>
                  <th>Result</th>
                  <th>Date</th>
                  <th>Status</th>
                  {isANO && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div className="font-heading font-semibold text-olive-dark">{a.name}</div>
                      {a.cadetId?.name && <div className="font-mono text-2xs text-olive-muted">{a.cadetId.name}</div>}
                    </td>
                    <td className="font-mono text-xs text-olive-muted">{a.type?.replace('_', ' ')}</td>
                    <td><span className={LEVEL_BADGE[a.level] || 'badge-olive'}>{a.level}</span></td>
                    <td className="font-mono text-xs text-olive-muted">{a.result || '—'}</td>
                    <td className="font-mono text-2xs text-olive-muted">{a.date ? new Date(a.date).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <span className={a.status === 'APPROVED' ? 'badge-green' : a.status === 'REJECTED' ? 'badge-red' : 'badge-amber'}>
                        {a.status || 'PENDING'}
                      </span>
                    </td>
                    {isANO && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-3">
                          {a.status !== 'APPROVED' && (
                            <button onClick={() => handleApprove(a._id)}
                              className="font-mono text-2xs text-emerald-600 hover:text-emerald-800 uppercase tracking-wider">Approve</button>
                          )}
                          {a.status !== 'REJECTED' && (
                            <button onClick={() => handleReject(a._id)}
                              className="font-mono text-2xs text-amber-600 hover:text-amber-800 uppercase tracking-wider">Reject</button>
                          )}
                          <button onClick={() => handleDelete(a._id)}
                            className="font-mono text-2xs text-red-500 hover:text-red-700 uppercase tracking-wider">Delete</button>
                        </div>
                      </td>
                    )}
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

export default AchievementsManage;

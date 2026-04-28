import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import AnimatedPage from '../../components/layout/AnimatedPage';

const PRIORITY_COLORS = { URGENT: 'badge-red', IMPORTANT: 'badge-amber', INFORMATION: 'badge-olive' };
const AUDIENCE_COLORS = { ALL: 'badge-blue', SD: 'badge-green', SW: 'badge-olive' };

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'INFORMATION', targetAudience: 'ALL', expiresAt: '' });
  const { user } = useAuthStore();
  const isANO = user?.role === 'ANO';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notices');
      if (data.success) setNotices(data.notices);
    } catch { toast.error('Failed to load notices'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/notices', form);
      if (data.success) {
        toast.success('Notice created successfully');
        setShowForm(false);
        setForm({ title: '', body: '', priority: 'INFORMATION', targetAudience: 'ALL', expiresAt: '' });
        fetchNotices();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create notice'); }
  };

  return (
    <AnimatedPage className="page-shell">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PUBLICATIONS</div>
          <h1 className="section-title">Notice Board</h1>
        </div>
        {isANO && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '✕ Cancel' : '+ New Notice'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide mb-5">New Notice</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div><label className="label">Title</label><input className="input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} required maxLength={100} /></div>
            <div><label className="label">Body</label><textarea className="input h-28 resize-none" value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} required maxLength={800} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">Priority</label>
                <select className="input bg-white" value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))}>
                  <option value="INFORMATION">Information</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div><label className="label">Audience</label>
                <select className="input bg-white" value={form.targetAudience} onChange={e => setForm(p => ({...p, targetAudience: e.target.value}))}>
                  <option value="ALL">All</option><option value="SD">SD Wing</option><option value="SW">SW Wing</option>
                </select>
              </div>
              <div><label className="label">Expires At</label><input type="date" className="input" value={form.expiresAt} onChange={e => setForm(p => ({...p, expiresAt: e.target.value}))} required /></div>
            </div>
            <div className="flex gap-3"><button type="submit" className="btn-primary">Publish Notice</button><button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button></div>
          </form>
        </motion.div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? [...Array(4)].map((_,i) => <div key={i} className="card p-5"><div className="skeleton h-5 w-1/2 mb-2" /><div className="skeleton h-4 w-3/4" /></div>) :
          notices.length === 0 ? <div className="card"><div className="empty-state"><div className="empty-state-icon">📢</div><div className="empty-state-title">No notices published</div></div></div> :
          notices.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="card p-5 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={PRIORITY_COLORS[n.priority]}>{n.priority}</span>
                  <span className={AUDIENCE_COLORS[n.targetAudience]}>{n.targetAudience}</span>
                  <span className="font-mono text-2xs text-olive-muted ml-auto">{new Date(n.publishedAt || n.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-heading font-bold text-olive-dark text-lg">{n.title}</h3>
                <p className="text-olive-muted text-sm mt-1 line-clamp-2">{n.body}</p>
              </div>
              <span className={`badge shrink-0 ${n.status === 'PUBLISHED' ? 'badge-green' : 'badge-amber'}`}>{n.status}</span>
            </motion.div>
          ))
        }
      </div>
    </AnimatedPage>
  );
};
export default NoticesPage;

/**
 * NoticeBoard.jsx
 */
import { useEffect, useState } from 'react';
import { useAuth }             from '../context/AuthContext';
import { noticeService }       from '../services/services';
import NoticeCard              from '../components/NoticeCard';
import LoadingSpinner          from '../components/LoadingSpinner';
import { Bell, PlusCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  title: '', content: '', priority: 'normal', targetWing: 'ALL',
  expiresAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  isPinned: false,
};

export const NoticeBoard = () => {
  const { user, isANO } = useAuth();
  const [notices,    setNotices]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [filter,     setFilter]     = useState('ALL');

  const load = async () => {
    try {
      const res = await noticeService.getAll({});
      setNotices(res.data.notices);
    } catch { setNotices([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required'); return;
    }
    setSubmitting(true);
    try {
      await noticeService.create(form);
      toast.success('Notice posted');
      setShowForm(false);
      setForm(DEFAULT_FORM);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice?')) return;
    try {
      await noticeService.remove(id);
      setNotices(prev => prev.filter(n => n._id !== id));
      toast.success('Notice deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = filter === 'ALL' ? notices : notices.filter(n => n.priority === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e8e4dc] font-serif flex items-center gap-3">
            <Bell size={24} className="text-[#c8b87a]" /> Notice Board
          </h1>
          <p className="text-[#6b7560] text-sm mt-1">{notices.length} active notices</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
            <PlusCircle size={14} /> {showForm ? 'Cancel' : 'Post Notice'}
          </button>
        )}
      </div>

      {/* Post Notice Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6 animate-fade-up">
          <h3 className="text-sm font-semibold text-[#e8e4dc] mb-4">New Notice</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Title *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input text-sm" maxLength={120} required />
            <textarea placeholder="Content *" value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="input text-sm resize-none" rows={4} maxLength={2000} required />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input text-sm">
                  <option value="urgent">⚠️ Urgent</option>
                  <option value="normal">📋 Normal</option>
                  <option value="info">ℹ️ Info</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Target Wing</label>
                <select value={form.targetWing} onChange={e => setForm(f => ({ ...f, targetWing: e.target.value }))} className="input text-sm">
                  <option value="ALL">All</option>
                  <option value="SD">SD only</option>
                  <option value="SW">SW only</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Expires</label>
                <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} className="input text-sm" />
              </div>
              {isANO && (
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-xs text-[#8a9080] cursor-pointer">
                    <input type="checkbox" checked={form.isPinned}
                      onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                      className="rounded" />
                    Pin notice
                  </label>
                </div>
              )}
            </div>
            <button type="submit" disabled={submitting} className="btn-primary text-sm">
              {submitting ? 'Posting...' : 'Post Notice'}
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['ALL', 'urgent', 'normal', 'info'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded border font-semibold transition-all capitalize
              ${filter === f ? 'bg-[#4a5240] text-[#e8e4dc] border-[#6b7560]' : 'btn-ghost'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Notices */}
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <Bell size={32} className="text-[#2d3748] mx-auto mb-3" />
          <p className="text-[#6b7560] text-sm">No notices found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <NoticeCard key={n._id} notice={n} canDelete={isANO} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;

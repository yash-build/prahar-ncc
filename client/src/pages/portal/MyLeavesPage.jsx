import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const STATUS_COLORS = {
  PENDING: 'badge-amber',
  APPROVED: 'badge-green',
  REJECTED: 'badge-red'
};

const MyLeavesPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '', attachment: null });
  const fileInputRef = useRef(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves/my');
      if (data.success) setLeaves(data.leaves);
    } catch {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'attachment' && val) formData.append('attachment', val);
        else if (key !== 'attachment') formData.append(key, val);
      });

      const { data } = await api.post('/leaves/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (data.success) {
        toast.success('Leave application submitted');
        setShowForm(false);
        setForm({ startDate: '', endDate: '', reason: '', attachment: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl text-olive-dark uppercase tracking-wide">Leave Applications</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">Apply for leave and track approval status.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Apply for Leave'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="card p-6 bg-stone-50 border border-olive/10">
              <h3 className="font-heading font-bold text-olive-dark mb-4">New Leave Request</h3>
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date</label>
                    <input type="date" className="input bg-white" required value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input type="date" className="input bg-white" required value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Reason</label>
                  <textarea className="input bg-white h-24 resize-none" required placeholder="Provide a detailed reason for your leave..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
                </div>
                <div className="bg-white p-4 rounded border border-stone-200">
                  <label className="label">Medical Certificate / Proof (Optional)</label>
                  <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={e => setForm(p => ({ ...p, attachment: e.target.files[0] }))} className="block w-full text-sm text-olive-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-olive file:text-white hover:file:bg-olive-dark transition-colors" />
                  <p className="text-xs text-olive-muted mt-2 font-mono">Max 10MB. PDF or Image format.</p>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h3 className="font-mono text-xs font-bold text-olive-muted tracking-wider uppercase border-b border-stone-200 pb-2">History</h3>
        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-5 w-1/3 mb-2" /><div className="skeleton h-4 w-1/2" /></div>)
        ) : leaves.length === 0 ? (
          <div className="card p-8 text-center bg-stone-50 border-dashed border-2">
            <p className="font-mono text-sm text-olive-muted">You have no leave history.</p>
          </div>
        ) : (
          leaves.map((l, i) => (
            <motion.div key={l._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className={STATUS_COLORS[l.status]}>{l.status}</span>
                <span className="font-mono text-xs text-olive-muted">
                  Applied: {new Date(l.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="font-heading font-semibold text-olive-dark mb-1">
                {new Date(l.startDate).toLocaleDateString()} 
                {l.startDate !== l.endDate && ` to ${new Date(l.endDate).toLocaleDateString()}`}
              </div>
              <p className="text-sm text-olive-muted whitespace-pre-wrap">{l.reason}</p>
              
              {l.remarks && (
                <div className="mt-4 p-3 bg-red-50 text-red-900 border-l-2 border-red-300 text-sm">
                  <span className="font-bold text-xs uppercase tracking-wider block mb-1">Officer Remarks:</span>
                  {l.remarks}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </AnimatedPage>
  );
};

export default MyLeavesPage;

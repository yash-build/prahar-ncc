import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const STATUS_COLORS = { PENDING: 'badge-amber', APPROVED: 'badge-green', REJECTED: 'badge-red' };

const LeavesManage = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [reviewModal, setReviewModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/leaves');
      if (data.success) setLeaves(data.leaves);
    } catch {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter);

  const handleReview = async (status) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/leaves/${reviewModal._id}/review`, { status, remarks });
      if (data.success) {
        toast.success(`Leave ${status.toLowerCase()}`);
        setReviewModal(null);
        setRemarks('');
        fetchLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage className="page-shell">
      <div>
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PERSONNEL</div>
        <h1 className="section-title">Leave Applications</h1>
        <p className="font-mono text-xs text-olive-muted mt-1">Review and approve cadet leave requests.</p>
      </div>

      <div className="flex gap-2">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`font-mono text-2xs uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all ${filter === s ? 'bg-olive-dark text-parchment border-olive-dark' : 'bg-white text-olive-muted border-stone-200 hover:border-olive/30'}`}>
            {s} {s === 'PENDING' && leaves.filter(l => l.status === 'PENDING').length > 0 && `(${leaves.filter(l => l.status === 'PENDING').length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-6 w-1/4 mb-2"/><div className="skeleton h-4 w-1/2"/></div>)
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center text-olive-muted bg-stone-50 border-dashed border-2">
            <p className="font-mono text-sm">No leave applications found for this filter.</p>
          </div>
        ) : (
          filtered.map(l => {
            const isPdf = l.attachment?.resourceType === 'raw';
            return (
              <motion.div key={l._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 border-l-4" style={{ borderLeftColor: l.status === 'PENDING' ? '#f59e0b' : l.status === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-olive-dark">
                      {l.cadetId.rank} {l.cadetId.name} <span className="font-mono text-xs text-olive-muted ml-2">({l.cadetId.serviceNumber})</span>
                    </h3>
                    <div className="font-mono text-xs text-olive-muted mt-1">
                      {new Date(l.startDate).toLocaleDateString()} {l.startDate !== l.endDate && ` → ${new Date(l.endDate).toLocaleDateString()}`}
                    </div>
                  </div>
                  <span className={STATUS_COLORS[l.status]}>{l.status}</span>
                </div>
                
                <p className="text-sm text-olive-dark whitespace-pre-wrap mb-4 bg-stone-50 p-3 rounded">{l.reason}</p>
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {l.attachment?.url ? (
                    <a href={l.attachment.url} target="_blank" rel="noreferrer" className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1">
                      📎 View Proof {isPdf ? '(PDF)' : '(Image)'}
                    </a>
                  ) : <div/>}
                  
                  {l.status === 'PENDING' && (
                    <button onClick={() => setReviewModal(l)} className="btn-primary py-1.5 px-4 text-xs">Review Application</button>
                  )}
                  {l.status !== 'PENDING' && l.reviewedBy && (
                    <span className="font-mono text-2xs text-olive-muted">
                      Reviewed by {l.reviewedBy.name}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-heading font-bold text-lg mb-4">Review Leave: {reviewModal.cadetId.name}</h3>
            <p className="text-sm mb-4">Date: {new Date(reviewModal.startDate).toLocaleDateString()} to {new Date(reviewModal.endDate).toLocaleDateString()}</p>
            <div className="mb-4">
              <label className="label">Officer Remarks (Optional)</label>
              <textarea className="input resize-none h-20" placeholder="Provide reason for rejection or special instructions..." value={remarks} onChange={e => setRemarks(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button disabled={submitting} onClick={() => handleReview('APPROVED')} className="flex-1 bg-green-600 text-white font-bold text-sm py-2 rounded hover:bg-green-700 transition">Approve</button>
              <button disabled={submitting} onClick={() => handleReview('REJECTED')} className="flex-1 bg-red-600 text-white font-bold text-sm py-2 rounded hover:bg-red-700 transition">Reject</button>
            </div>
            <button onClick={() => setReviewModal(null)} className="mt-4 w-full text-stone-500 font-mono text-xs hover:text-black">Cancel</button>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default LeavesManage;

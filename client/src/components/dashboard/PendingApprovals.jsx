import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
  const [pending,  setPending]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState([]);
  const [rejectId, setRejectId] = useState(null);
  const [reason,   setReason]   = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/auth/pending-accounts');
      setPending(res.data.pendingAccounts);
    } catch {
      toast.error('Failed to load pending accounts');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (userId, name) => {
    try {
      await api.put(`/auth/approve-account/${userId}`);
      toast.success(`${name} approved! They can now login.`);
      setPending(prev => prev.filter(u => u._id !== userId));
      setSelected(prev => prev.filter(id => id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const reject = async () => {
    if (!rejectId || !reason.trim()) return;
    try {
      await api.put(`/auth/reject-account/${rejectId}`, { reason });
      toast.success('Account rejected.');
      setPending(prev => prev.filter(u => u._id !== rejectId));
      setRejectId(null);
      setReason('');
    } catch {
      toast.error('Rejection failed');
    }
  };

  const bulkApprove = async () => {
    if (selected.length === 0) return;
    try {
      const res = await api.put('/auth/bulk-approve', { userIds: selected });
      toast.success(res.data.message);
      fetchPending();
      setSelected([]);
    } catch {
      toast.error('Bulk approval failed');
    }
  };

  const approveAll = async () => {
    const allIds = pending.map(u => u._id);
    if (allIds.length === 0) return;
    try {
      await api.put('/auth/bulk-approve', { userIds: allIds });
      toast.success(`All ${allIds.length} accounts approved!`);
      setPending([]);
      setSelected([]);
    } catch {
      toast.error('Failed to approve all');
    }
  };

  if (loading) return (
    <div className="bg-white border border-stone-200 rounded-sm p-6">
      <div className="animate-pulse space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-12 bg-stone-100 rounded-sm" />)}
      </div>
    </div>
  );

  if (pending.length === 0) return (
    <div className="bg-white border border-stone-200 rounded-sm p-6 text-center">
      <CheckCircle className="w-8 h-8 text-[#4a5240] mx-auto mb-2" />
      <p className="font-mono text-xs text-stone-400 tracking-wider">NO PENDING APPROVALS</p>
    </div>
  );

  return (
    <div className="bg-white border border-[#c8b98a] rounded-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#2c3128] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-[#c8b98a]" />
          <span className="font-mono text-xs text-[#c8b98a] tracking-widest">
            PENDING APPROVALS ({pending.length})
          </span>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <button onClick={bulkApprove}
                    className="font-mono text-[10px] bg-[#4a5240] text-[#dde3d8] px-3 py-1.5 rounded-sm hover:bg-[#7a8a6e]">
              APPROVE SELECTED ({selected.length})
            </button>
          )}
          <button onClick={approveAll}
                  className="font-mono text-[10px] bg-[#c8b98a] text-[#1a1d16] px-3 py-1.5 rounded-sm hover:bg-[#a89560]">
            APPROVE ALL
          </button>
        </div>
      </div>

      {/* Pending list */}
      <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
        {pending.map((user) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-4 px-5 py-3"
          >
            {/* Select checkbox */}
            <input
              type="checkbox"
              checked={selected.includes(user._id)}
              onChange={e => setSelected(prev =>
                e.target.checked ? [...prev, user._id] : prev.filter(id => id !== user._id)
              )}
              className="w-4 h-4 accent-[#4a5240]"
            />

            {/* Photo or initials */}
            {user.cadet?.photoThumbUrl ? (
              <img src={user.cadet.photoThumbUrl} alt={user.name}
                   className="w-9 h-9 rounded-sm object-cover flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 bg-[#2c3128] rounded-sm flex items-center justify-center flex-shrink-0">
                <span className="font-display text-sm text-[#c8b98a]">{user.name.charAt(0)}</span>
              </div>
            )}

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="font-sans text-sm text-[#1a1d16] font-medium truncate">{user.name}</p>
              <p className="font-mono text-[10px] text-[#7a8a6e]">
                {user.cadet?.serviceNumber || 'No service no.'} ·{' '}
                {user.cadet?.wing || '?'} ·{' '}
                {user.cadet?.rank || 'CADET'} ·{' '}
                Yr {user.cadet?.yearOfStudy || '?'}
              </p>
              <p className="font-mono text-[10px] text-stone-400">
                Requested: {new Date(user.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => approve(user._id, user.name)}
                className="flex items-center gap-1 bg-green-600 text-white font-mono text-[10px]
                           px-3 py-1.5 rounded-sm hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                APPROVE
              </button>
              <button
                onClick={() => setRejectId(user._id)}
                className="flex items-center gap-1 border border-red-300 text-red-600 font-mono text-[10px]
                           px-3 py-1.5 rounded-sm hover:bg-red-50 transition-colors"
              >
                <XCircle className="w-3 h-3" />
                REJECT
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reject reason modal */}
      <AnimatePresence>
        {rejectId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
            onClick={() => setRejectId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-sm border border-stone-200 p-6 w-full max-w-sm"
            >
              <h3 className="font-mono text-xs text-[#2c3128] tracking-widest mb-3">
                REJECTION REASON
              </h3>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for rejection (required)"
                rows={3}
                className="w-full border border-stone-200 rounded-sm px-3 py-2 font-sans text-sm
                           focus:outline-none focus:border-[#4a5240] resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setRejectId(null)}
                        className="font-mono text-xs text-stone-400 px-3 py-2 border border-stone-200 rounded-sm">
                  CANCEL
                </button>
                <button
                  onClick={reject}
                  disabled={!reason.trim()}
                  className="font-mono text-xs bg-red-600 text-white px-4 py-2 rounded-sm
                             hover:bg-red-700 disabled:opacity-50"
                >
                  REJECT ACCOUNT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingApprovals;

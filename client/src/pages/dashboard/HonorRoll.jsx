import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

/* ── Selection Assistant Modal ───────────────────────────────── */
const SelectionModal = ({ onClose, onAdded }) => {
  const [cadets, setCadets] = useState([]);
  const [reason, setReason] = useState('');
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    api.get('/cadets', { params: { limit: 200 } })
      .then(r => { if (r.data?.success) setCadets(r.data.cadets.filter(c => !c.isHonorRoll && c.status === 'ACTIVE')); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cadets.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.serviceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const add = async (cadet) => {
    if (!reason || !quote) return toast.error('Please provide a reason and a quote.');
    setAdding(cadet._id);
    try {
      await api.put(`/cadets/${cadet._id}`, { isHonorRoll: true, honorRollReason: reason, honorRollQuote: quote });
      toast.success(`${cadet.name} added to Honor Roll`);
      onAdded();
      onClose();
    } catch { toast.error('Failed to add'); }
    finally { setAdding(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white border border-stone-200 rounded-sm shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide">Selection Assistant</h3>
            <p className="font-mono text-2xs text-olive-muted mt-0.5">Choose cadets to add to the Honor Roll</p>
          </div>
          <button onClick={onClose} className="text-olive-muted hover:text-olive-dark transition-colors text-xl leading-none">✕</button>
        </div>
        {/* Reason & Quote Inputs */}
        <div className="px-6 py-3 border-b border-stone-100 flex gap-2">
          <input className="input text-xs" placeholder="Reason (e.g. Best Drill)" value={reason} onChange={e=>setReason(e.target.value)} />
          <input className="input text-xs" placeholder="Quote" value={quote} onChange={e=>setQuote(e.target.value)} />
        </div>
        {/* Search */}
        <div className="px-6 py-3 border-b border-stone-100">
          <input className="input" placeholder="Search by name or service number..."
            value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>
        {/* List */}
        <div className="overflow-y-auto max-h-72">
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center font-mono text-xs text-olive-muted">No eligible cadets found</div>
          ) : filtered.map(c => (
            <div key={c._id} className="flex items-center gap-4 px-6 py-3 border-b border-stone-50 hover:bg-stone-50 transition-colors">
              <div className="w-9 h-9 rounded-sm bg-olive/8 border border-olive/12 flex items-center justify-center shrink-0">
                {c.photoUrl
                  ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover rounded-sm" />
                  : <span className="font-display text-olive/30 text-lg">{c.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-olive-dark text-sm truncate">{c.name}</div>
                <div className="font-mono text-2xs text-olive-muted">{c.serviceNumber} · {c.rank} · Yr {c.yearOfStudy}</div>
              </div>
              <button onClick={() => add(c)} disabled={adding === c._id}
                className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50 shrink-0">
                {adding === c._id ? '...' : '+ Add'}
              </button>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-100">
          <button onClick={onClose} className="btn-ghost text-xs w-full">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main HonorRoll Page ─────────────────────────────────────── */
const HonorRoll = () => {
  const [cadets,  setCadets]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();
  const isANO = user?.role === 'ANO';

  const fetchCadets = async () => {
    try {
      const { data } = await api.get('/cadets', { params: { status: 'ACTIVE', limit: 100 } });
      if (data.success) setCadets(data.cadets.filter(c => c.isHonorRoll || c.isSUOPosition || c.isJUOPosition));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCadets(); }, []);

  const handleRemove = async (cadet) => {
    if (!window.confirm(`Remove ${cadet.name} from Honor Roll?`)) return;
    try {
      await api.put(`/cadets/${cadet._id}`, { isHonorRoll: false });
      toast.success('Removed from Honor Roll');
      fetchCadets();
    } catch { toast.error('Failed to remove'); }
  };

  const handleEditNote = async (cadet) => {
    const note = prompt('Enter Honor Roll Note / Yearbook Message:', cadet.yearbookMessage || '');
    if (note !== null) {
      try {
        await api.put(`/cadets/${cadet._id}`, { yearbookMessage: note });
        toast.success('Note updated');
        fetchCadets();
      } catch { toast.error('Failed to update note'); }
    }
  };

  const getRank = (c) => {
    if (c.isSUOPosition) return { label: 'SUO', color: '#d4af37' };
    if (c.isJUOPosition) return { label: 'JUO', color: '#c2b280' };
    return { label: c.rank, color: '#6b7a69' };
  };

  return (
    <AnimatedPage className="page-shell">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">RECOGNITION</div>
          <h1 className="section-title">Honor Roll</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">Distinguished cadets and command hierarchy.</p>
        </div>
        {isANO && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Add to Honor Roll
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-24 mb-3 rounded" /><div className="skeleton h-4 w-3/4 mb-2" /><div className="skeleton h-3 w-1/2" /></div>)}
        </div>
      ) : cadets.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🎖️</div>
            <div className="empty-state-title">No honored cadets yet</div>
            <div className="empty-state-sub">SUO/JUO positions and honor roll cadets appear here.</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {cadets.map((c, i) => {
            const r = getRank(c);
            return (
              <motion.div key={c._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }} className="card overflow-hidden group">
                <div className="h-36 bg-gradient-to-br from-olive/10 to-khaki/10 relative flex items-center justify-center">
                  {c.photoUrl
                    ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                    : <span className="font-display text-5xl text-olive/20">{c.name[0]}</span>
                  }
                  <div className="absolute top-2 right-2">
                    <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded-sm"
                      style={{ background: r.color + '25', color: r.color, border: `1px solid ${r.color}40` }}>
                      {r.label}
                    </span>
                  </div>
                  {c.isHonorRoll && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-gold/90 rounded-full flex items-center justify-center shadow">
                      <span className="text-xs text-olive-dark">✦</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold text-olive-dark text-base truncate">{c.name}</h3>
                  <div className="font-mono text-2xs text-olive-muted mt-1 mb-2">{c.wing} Wing · Yr {c.yearOfStudy}</div>
                  {c.isHonorRoll && c.honorRollReason && <div className="font-mono text-xs text-olive-dark mb-1 font-semibold">{c.honorRollReason}</div>}
                  {c.yearbookMessage && (
                    <p className="font-sans text-xs text-olive-muted italic border-l-2 border-khaki/30 pl-2 line-clamp-2">
                      "{c.yearbookMessage || c.honorRollQuote}"
                    </p>
                  )}
                  {isANO && c.isHonorRoll && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-stone-200">
                      <button onClick={(e) => { e.stopPropagation(); handleEditNote(c); }}
                        className="text-2xs text-khaki-dark font-mono uppercase hover:text-olive-dark flex-1">Edit Note</button>
                      <button onClick={(e) => { e.stopPropagation(); handleRemove(c); }}
                        className="text-2xs text-red-500 font-mono uppercase hover:text-red-700">Remove</button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selection Modal */}
      <AnimatePresence>
        {showModal && (
          <SelectionModal onClose={() => setShowModal(false)} onAdded={fetchCadets} />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default HonorRoll;

/**
 * GodPanelUndo.jsx — Undo Center + Audit Logs for God Mode
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import godApi from '../../services/godApi';

/* ── Undo Center ───────────────────────────────────────────────── */
export const GodPanelUndo = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => godApi.get('/undo').then(r => { if (r.data.success) setLogs(r.data.logs); }).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleUndo = async (logId, action) => {
    if (prompt(`Type UNDO to revert: ${action}`) !== 'UNDO') return;
    try {
      const { data } = await godApi.post(`/undo/${logId}`);
      toast.success(data.message);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Undo failed'); }
  };

  return (
    <div>
      <h2 className="font-display text-3xl text-parchment tracking-wide mb-2">Undo Center</h2>
      <p className="font-mono text-xs text-white/30 mb-6">Revert any destructive action. Only actions with snapshots can be undone.</p>

      <div className="glass overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30 font-mono text-sm">Loading...</div> : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3 opacity-30">🔄</div>
            <div className="font-mono text-sm text-white/30">No undoable actions found</div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log, i) => (
              <motion.div key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-sm bg-amber-900/30 border border-amber-500/20 flex items-center justify-center text-amber-300 font-mono text-xs">↩</div>
                <div className="flex-1 min-w-0">
                  <div className="text-parchment text-sm font-semibold">{log.action.replace(/_/g, ' ')}</div>
                  <div className="font-mono text-2xs text-white/30">{log.entityType} · by {log.performedBy?.name || 'System'} · {new Date(log.createdAt).toLocaleString()}</div>
                </div>
                <span className={`font-mono text-2xs px-2 py-0.5 rounded ${log.severity === 'CRITICAL' ? 'bg-red-900/40 text-red-300' : 'bg-amber-900/40 text-amber-300'}`}>{log.severity}</span>
                <button onClick={() => handleUndo(log._id, log.action)}
                  className="px-3 py-1.5 bg-amber-900/40 text-amber-300 font-mono text-2xs uppercase border border-amber-500/20 rounded-sm hover:bg-amber-900/60 transition-all">
                  UNDO
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Full Audit Logs ───────────────────────────────────────────── */
export const GodPanelLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', entityType: '' });

  const fetch = () => {
    const params = new URLSearchParams();
    if (filter.action) params.set('action', filter.action);
    if (filter.entityType) params.set('entityType', filter.entityType);
    godApi.get(`/logs?${params.toString()}`).then(r => { if (r.data.success) setLogs(r.data.logs); }).finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const SEVERITY = { INFO: 'text-white/40', WARN: 'text-amber-400', CRITICAL: 'text-red-400' };

  return (
    <div>
      <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Audit Logs</h2>

      <div className="flex gap-3 mb-4">
        <input placeholder="Filter by action..." value={filter.action} onChange={e => setFilter({ ...filter, action: e.target.value })}
          className="flex-1 bg-black/40 border border-white/10 text-parchment font-mono text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-red-500/50" />
        <select value={filter.entityType} onChange={e => setFilter({ ...filter, entityType: e.target.value })}
          className="bg-black/40 border border-white/10 text-parchment font-mono text-sm px-3 py-2 rounded-sm">
          <option value="">All Entities</option>
          {['User','Cadet','Notice','Achievement','GalleryItem','AttendanceSession','System'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={fetch} className="px-4 py-2 bg-red-900/40 text-red-300 font-mono text-xs uppercase border border-red-500/20 rounded-sm hover:bg-red-900/60">Filter</button>
      </div>

      <div className="glass overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30 font-mono text-sm">Loading...</div> : (
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {logs.map((log, i) => (
              <div key={log._id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <span className="font-mono text-2xs text-white/20 shrink-0 w-24">{new Date(log.createdAt).toLocaleTimeString()}</span>
                <span className={`font-mono text-2xs font-bold ${SEVERITY[log.severity] || 'text-white/40'}`}>{log.severity || 'INFO'}</span>
                <span className="font-mono text-2xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded shrink-0">{log.action}</span>
                <span className="text-white/30 font-mono text-2xs truncate">{log.entityType}</span>
                <span className="text-white/50 text-xs truncate ml-auto">{log.performedBy?.name || 'System'}</span>
                {log.undone && <span className="font-mono text-2xs text-emerald-400">✓ UNDONE</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

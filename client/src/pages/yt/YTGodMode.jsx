import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';

const sections = [
  { key: 'stats',   label: 'System Stats',   icon: '📊' },
  { key: 'logs',    label: 'Audit Log',       icon: '📋' },
  { key: 'export',  label: 'Export Data',     icon: '💾' },
  { key: 'promote', label: 'Batch Promote',   icon: '⬆️' },
];

const SECRET = import.meta.env.VITE_YT_SECRET || 'PRAHAR_YT_2024_HIDDEN';

const YTGodMode = () => {
  const [unlocked,       setUnlocked]       = useState(false);
  const [keyInput,       setKeyInput]        = useState('');
  const [activeSection,  setActiveSection]   = useState('stats');
  const [stats,          setStats]           = useState(null);
  const [logs,           setLogs]            = useState([]);
  const [loading,        setLoading]         = useState(false);

  const ytHeaders = { 'x-yt-secret': SECRET };

  const unlock = () => {
    if (keyInput === SECRET) {
      setUnlocked(true);
      toast.success('⚡ GOD MODE ACTIVATED', { duration: 3000 });
      fetchStats();
    } else {
      toast.error('Invalid access key');
      setKeyInput('');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/yt/stats', { headers: ytHeaders });
      if (data.success) setStats(data.stats);
    } catch { toast.error('Failed to fetch stats'); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/yt/logs', { headers: ytHeaders });
      if (data.success) setLogs(data.logs);
    } catch { toast.error('Failed to fetch logs'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/yt/export-all', { headers: ytHeaders });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `prahar-backup-${Date.now()}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('System backup downloaded.');
    } catch { toast.error('Export failed'); }
    finally { setLoading(false); }
  };

  const handlePromote = async () => {
    if (!window.confirm('⚠ FORCE PROMOTE ALL BATCHES?\n\nThis will advance every active cadet by one year.\nThis action cannot be undone. Proceed?')) return;
    setLoading(true);
    try {
      const { data } = await api.post('/yt/promote-all', {}, { headers: ytHeaders });
      toast.success(data.message || 'Batch promotion complete.');
    } catch { toast.error('Promotion failed'); }
    finally { setLoading(false); }
  };

  const handleSection = (key) => {
    setActiveSection(key);
    if (key === 'logs') fetchLogs();
  };

  /* ── LOCK SCREEN ── */
  if (!unlocked) return (
    <div className="min-h-screen bg-olive-deep flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0d1109 0%, #141a13 50%, #0d1109 100%)' }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,white 40px,white 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,white 40px,white 41px)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-sm p-8 text-center relative z-10"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-sm border border-red-500/30 bg-red-900/20 flex items-center justify-center">
          <span className="text-3xl">🔐</span>
        </div>
        <div className="font-display text-4xl text-parchment tracking-widest mb-1">YT COMMAND</div>
        <div className="font-mono text-xs text-red-400/70 tracking-widest mb-8">RESTRICTED ACCESS</div>

        <input
          type="password"
          placeholder="Enter access key..."
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && unlock()}
          className="w-full bg-black/40 border border-white/10 text-parchment font-mono text-sm px-4 py-3 rounded-sm mb-4 focus:outline-none focus:border-red-500/50 text-center tracking-widest"
        />
        <button
          onClick={unlock}
          className="w-full py-3 font-heading font-bold uppercase tracking-widest text-sm rounded-sm transition-all"
          style={{ background: 'linear-gradient(90deg,#7f1d1d,#991b1b)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          AUTHENTICATE
        </button>
        <div className="mt-6 font-mono text-2xs text-white/15">PRAHAR SYSTEM v2.0 · CLASSIFIED</div>
      </motion.div>
    </div>
  );

  /* ── GOD PANEL ── */
  return (
    <div className="min-h-screen flex"
      style={{ background: 'linear-gradient(135deg, #0d1109 0%, #141a13 100%)' }}>

      {/* Sidebar */}
      <div className="w-56 border-r shrink-0 flex flex-col"
        style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(0,0,0,0.4)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <div className="font-display text-2xl text-red-400 tracking-widest">YT CMD</div>
          <div className="font-mono text-2xs text-red-400/40 mt-0.5">GOD MODE ACTIVE</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => handleSection(s.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm font-mono text-xs text-left transition-all
                ${activeSection === s.key ? 'bg-red-900/40 text-red-300 border-l-2 border-red-500' : 'text-white/40 hover:text-white/70 hover:bg-white/5 border-l-2 border-transparent'}`}
            >
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <button
            onClick={() => { setUnlocked(false); setKeyInput(''); }}
            className="w-full font-mono text-2xs text-red-400/50 hover:text-red-300 py-2 transition-colors"
          >
            ⏏ LOCK SYSTEM
          </button>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >

            {/* STATS */}
            {activeSection === 'stats' && (
              <div>
                <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">System Overview</h2>
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(stats).map(([k, v]) => (
                      <div key={k} className="glass p-5 text-center">
                        <div className="font-display text-4xl text-gold mb-1">{v}</div>
                        <div className="font-mono text-2xs text-white/40 uppercase tracking-widest">{k.replace('total','').replace(/([A-Z])/g,' $1').trim()}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/30 font-mono text-sm">Loading stats...</div>
                )}
              </div>
            )}

            {/* LOGS */}
            {activeSection === 'logs' && (
              <div>
                <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Audit Logs</h2>
                <div className="glass overflow-hidden">
                  {loading ? (
                    <div className="text-center py-12 text-white/30 font-mono text-sm">Loading logs...</div>
                  ) : logs.length === 0 ? (
                    <div className="text-center py-12 text-white/30 font-mono text-sm">No logs found.</div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {logs.map((log, i) => (
                        <div key={i} className="px-5 py-3 flex items-center gap-4 text-xs">
                          <span className="font-mono text-red-400/60 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                          <span className="badge font-mono text-2xs bg-red-900/40 text-red-300">{log.action}</span>
                          <span className="text-white/50 truncate">{log.performedBy?.name || 'System'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EXPORT */}
            {activeSection === 'export' && (
              <div>
                <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Data Export</h2>
                <div className="glass p-8 text-center">
                  <div className="text-5xl mb-6">💾</div>
                  <p className="font-mono text-sm text-white/50 mb-8 max-w-md mx-auto">
                    Export complete system backup as JSON. Includes all cadets, users, attendance sessions, notices, and audit logs.
                  </p>
                  <button
                    onClick={handleExport}
                    disabled={loading}
                    className="px-10 py-3 font-heading font-bold uppercase tracking-widest text-sm rounded-sm transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg,#d4af37,#c2b280)', color: '#141a13', border: '1px solid #b8962c' }}
                  >
                    {loading ? 'Generating...' : 'Download Full System Backup'}
                  </button>
                </div>
              </div>
            )}

            {/* PROMOTE */}
            {activeSection === 'promote' && (
              <div>
                <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">Batch Promotion</h2>
                <div className="glass p-8">
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-4">⬆️</div>
                    <p className="font-mono text-sm text-white/50 max-w-md mx-auto">
                      Force promote all batches simultaneously. Year 1 → Year 2 → Year 3 → PASSED OUT.
                    </p>
                  </div>
                  <div className="bg-red-900/20 border border-red-500/20 rounded-sm p-4 mb-8 font-mono text-xs text-red-300/70 space-y-1">
                    <div>⚠ Year 1 cadets → Year 2</div>
                    <div>⚠ Year 2 cadets → Year 3</div>
                    <div>⚠ Year 3 cadets → PASSED OUT (archived)</div>
                    <div className="text-red-500/50 pt-2">This action is IRREVERSIBLE. Use with extreme caution.</div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={handlePromote}
                      disabled={loading}
                      className="px-10 py-4 font-display text-xl uppercase tracking-widest rounded-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                      style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 30px rgba(239,68,68,0.1)' }}
                    >
                      {loading ? 'Executing...' : 'EXECUTE PROMOTION'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YTGodMode;

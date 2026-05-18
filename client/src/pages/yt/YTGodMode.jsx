/**
 * YTGodMode.jsx — PRAHAR God Mode Console
 * Full system admin beyond ANO — secret-key authenticated
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import godApi, { setGodSecret } from '../../services/godApi';
import GodPanelUsers from './GodPanelUsers';
import GodPanelCadets from './GodPanelCadets';
import { GodPanelNotices, GodPanelAchievements, GodPanelGallery, GodPanelAttendance } from './GodPanelData';
import { GodPanelUndo, GodPanelLogs } from './GodPanelUndo';
import { GodPanelSystem, GodPanelDebug } from './GodPanelSystem';
import { GodPanelPageEditor, GodPanelHealth, GodPanelBulkOps } from './GodPanelExtras';

const SECRET = import.meta.env.VITE_YT_SECRET || 'PRAHAR_YT_2024_HIDDEN';

const sections = [
  { key: 'overview',     label: 'Command Center',  icon: '📊', group: 'Core' },
  { key: 'users',        label: 'User Control',    icon: '👥', group: 'Core' },
  { key: 'cadets',       label: 'Cadet Control',   icon: '🎖️', group: 'Core' },
  { key: 'attendance',   label: 'Attendance',      icon: '📋', group: 'Data' },
  { key: 'notices',      label: 'Notices',         icon: '📢', group: 'Data' },
  { key: 'achievements', label: 'Achievements',    icon: '🏆', group: 'Data' },
  { key: 'gallery',      label: 'Gallery',         icon: '🖼️', group: 'Data' },
  { key: 'logs',         label: 'Full Audit Log',  icon: '📜', group: 'System' },
  { key: 'undo',         label: 'Undo Center',     icon: '↩️', group: 'System' },
  { key: 'page-editor',  label: 'Page Editor',     icon: '✏️', group: 'System' },
  { key: 'health',       label: 'System Health',   icon: '💚', group: 'System' },
  { key: 'bulk',         label: 'Bulk Ops',        icon: '⚠️', group: 'System' },
  { key: 'system',       label: 'System Control',  icon: '⚙️', group: 'System' },
  { key: 'debug',        label: 'Debug Panel',     icon: '🛠️', group: 'System' },
];

const YTGodMode = () => {
  const [unlocked, setUnlocked]     = useState(() => sessionStorage.getItem('yt-unlocked') === '1');
  const [keyInput, setKeyInput]     = useState('');
  const [active, setActive]         = useState('overview');
  const [stats, setStats]           = useState(null);
  const [attempts, setAttempts]     = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);

  const fetchStats = () => godApi.get('/stats').then(r => { if (r.data.success) setStats(r.data.stats); }).catch(() => {});

  // Re-establish godApi secret and fetch stats whenever unlocked becomes true.
  // This covers BOTH: fresh password entry AND page reload where sessionStorage
  // already marks the session as unlocked (module-level _secret resets on reload).
  useEffect(() => {
    if (!unlocked) return;
    setGodSecret(SECRET);
    fetchStats();
  }, [unlocked]); // eslint-disable-line react-hooks/exhaustive-deps

  const unlock = () => {
    if (lockedUntil && Date.now() < lockedUntil) {
      const mins = Math.ceil((lockedUntil - Date.now()) / 60000);
      toast.error(`Locked. Try again in ${mins} minute(s).`);
      return;
    }
    if (keyInput === SECRET) {
      setGodSecret(SECRET);
      setUnlocked(true);
      setAttempts(0);
      sessionStorage.setItem('yt-unlocked', '1');
      toast.success('⚡ GOD MODE ACTIVATED', { duration: 3000, icon: '🔓' });
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setKeyInput('');
      if (next >= 5) {
        setLockedUntil(Date.now() + 10 * 60 * 1000);
        toast.error('Too many attempts. Locked for 10 minutes.');
      } else {
        toast.error(`Invalid key. ${5 - next} attempt(s) remaining.`);
      }
    }
  };

  /* ── LOCK SCREEN ─────────────────────────────────────────────── */
  if (!unlocked) return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0d1109 0%, #141a13 50%, #0d1109 100%)' }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,white 40px,white 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,white 40px,white 41px)' }} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm p-8 text-center relative z-10 rounded-sm"
        style={{ background: 'rgba(20,26,19,0.95)', border: '1px solid rgba(239,68,68,0.15)', boxShadow: '0 0 60px rgba(239,68,68,0.05)' }}>
        <div className="w-16 h-16 mx-auto mb-6 rounded-sm border border-red-500/30 bg-red-900/20 flex items-center justify-center">
          <span className="text-3xl">🔐</span>
        </div>
        <div className="font-display text-4xl text-parchment tracking-widest mb-1">GOD MODE</div>
        <div className="font-mono text-xs text-red-400/70 tracking-widest mb-8">RESTRICTED · PRAHAR SYSTEM</div>
        <input type="password" placeholder="Enter access key..." value={keyInput}
          onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && unlock()}
          className="w-full bg-black/40 border border-white/10 text-parchment font-mono text-sm px-4 py-3 rounded-sm mb-4 focus:outline-none focus:border-red-500/50 text-center tracking-widest" />
        <button onClick={unlock}
          className="w-full py-3 font-heading font-bold uppercase tracking-widest text-sm rounded-sm transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(90deg,#7f1d1d,#991b1b)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
          AUTHENTICATE
        </button>
        <div className="mt-6 font-mono text-2xs text-white/15">PRAHAR v2.0 · CLASSIFIED</div>
      </motion.div>
    </div>
  );

  /* ── GOD PANEL ───────────────────────────────────────────────── */
  const groups = [...new Set(sections.map(s => s.group))];

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0d1109 0%, #141a13 100%)' }}>
      {/* Sidebar */}
      <div className="w-56 border-r shrink-0 flex flex-col" style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(0,0,0,0.4)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <div className="font-display text-2xl text-red-400 tracking-widest">GOD MODE</div>
          <div className="font-mono text-2xs text-red-400/40 mt-0.5">PRAHAR SYSTEM BRAIN</div>
        </div>
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {groups.map(g => (
            <div key={g}>
              <div className="font-mono text-2xs text-white/15 uppercase tracking-widest px-3 mb-1">{g}</div>
              <div className="space-y-0.5">
                {sections.filter(s => s.group === g).map(s => (
                  <button key={s.key} onClick={() => setActive(s.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm font-mono text-xs text-left transition-all
                      ${active === s.key ? 'bg-red-900/40 text-red-300 border-l-2 border-red-500' : 'text-white/40 hover:text-white/70 hover:bg-white/5 border-l-2 border-transparent'}`}>
                    <span>{s.icon}</span>{s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
          <button onClick={() => { setUnlocked(false); setKeyInput(''); setGodSecret(''); sessionStorage.removeItem('yt-unlocked'); }}
            className="w-full font-mono text-2xs text-red-400/50 hover:text-red-300 py-2 transition-colors">
            ⏏ LOCK SYSTEM
          </button>
        </div>
      </div>

      {/* Main panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>

            {active === 'overview' && (
              <div>
                <div style={{ fontFamily: 'monospace', color: '#00ff41', fontSize: 18, letterSpacing: 4, marginBottom: 4 }}>COMMAND_CENTER.exe</div>
                <div style={{ fontFamily: 'monospace', color: '#2a5a2a', fontSize: 11, marginBottom: 20 }}>Full system overview — all collections at a glance</div>
                {stats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
                    {Object.entries(stats).map(([k, v]) => (
                      <div key={k} style={{ padding: 16, textAlign: 'center', background: 'rgba(0,255,65,0.02)', border: '1px solid #1a3a1a' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 32, color: '#c8b98a', lineHeight: 1 }}>{v}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#2a5a2a', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' }}>{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ fontFamily: 'monospace', color: '#2a5a2a', padding: 40, textAlign: 'center' }}>// loading stats...</div>}
                {/* Quick actions */}
                <div style={{ fontFamily: 'monospace', color: '#2a5a2a', fontSize: 11, marginBottom: 8, letterSpacing: 2 }}>// QUICK ACTIONS</div>
                <div className="flex flex-wrap gap-3">
                  {[{ label: 'Generate Demo Data', fn: async () => { await godApi.post('/demo'); toast.success('Demo data generated'); fetchStats(); } },
                    { label: 'Export All JSON',    fn: async () => { const {data} = await godApi.get('/export-all'); const b = new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `prahar-backup-${Date.now()}.json`; a.click(); toast.success('Export downloaded'); } },
                    { label: 'Clear Notifications', fn: async () => { await godApi.post('/clear-notifications'); toast.success('Cleared'); } },
                  ].map(a => (
                    <button key={a.label} onClick={a.fn}
                      style={{ padding: '8px 16px', fontFamily: 'monospace', fontSize: 11, background: '#0a1a0a', color: '#c8b98a', border: '1px solid #1a3a1a', cursor: 'pointer', letterSpacing: 1 }}>
                      ▶ {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {active === 'users'        && <GodPanelUsers />}
            {active === 'cadets'       && <GodPanelCadets />}
            {active === 'attendance'   && <GodPanelAttendance />}
            {active === 'notices'      && <GodPanelNotices />}
            {active === 'achievements' && <GodPanelAchievements />}
            {active === 'gallery'      && <GodPanelGallery />}
            {active === 'logs'         && <GodPanelLogs />}
            {active === 'undo'         && <GodPanelUndo />}
            {active === 'page-editor'  && <GodPanelPageEditor />}
            {active === 'health'       && <GodPanelHealth />}
            {active === 'bulk'         && <GodPanelBulkOps />}
            {active === 'system'       && <GodPanelSystem />}
            {active === 'debug'        && <GodPanelDebug />}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YTGodMode;

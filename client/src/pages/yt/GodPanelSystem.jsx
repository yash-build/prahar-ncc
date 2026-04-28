/**
 * GodPanelSystem.jsx — System control + Export + Debug for God Mode
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import godApi from '../../services/godApi';

/* ── System Control ────────────────────────────────────────────── */
export const GodPanelSystem = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data } = await godApi.get('/export-all');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `prahar-godmode-backup-${Date.now()}.json`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('Full system backup downloaded');
    } catch { toast.error('Export failed'); }
    finally { setLoading(false); }
  };

  const handlePromote = async () => {
    if (prompt('Type PROMOTE to force promote all batches.\nYear 1→2, Year 2→3, Year 3→PASSED OUT') !== 'PROMOTE') return;
    setLoading(true);
    try {
      const { data } = await godApi.post('/promote-all');
      toast.success(data.message);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (prompt('⚠ DANGER: This will DELETE ALL DATA.\nType HARD-RESET to confirm') !== 'HARD-RESET') return;
    if (prompt('Are you ABSOLUTELY sure?\nType YES-DESTROY-EVERYTHING') !== 'YES-DESTROY-EVERYTHING') return;
    setLoading(true);
    try {
      const { data } = await godApi.post('/hard-reset');
      toast.success(data.message);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const Card = ({ icon, title, desc, action, btnText, danger }) => (
    <div className="glass p-6 flex flex-col items-center text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-display text-xl text-parchment mb-2">{title}</h3>
      <p className="font-mono text-xs text-white/30 mb-6 max-w-xs">{desc}</p>
      <button onClick={action} disabled={loading}
        className={`px-8 py-3 font-heading font-bold uppercase tracking-widest text-sm rounded-sm transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ${
          danger ? 'bg-red-900/60 text-red-300 border border-red-500/30' : 'bg-gradient-to-r from-gold/80 to-khaki text-olive-deep border border-gold/40'}`}>
        {loading ? 'Processing...' : btnText}
      </button>
    </div>
  );

  return (
    <div>
      <h2 className="font-display text-3xl text-parchment tracking-wide mb-6">System Control</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card icon="💾" title="Export All Data" desc="Download complete system backup as JSON. Includes all collections." action={handleExport} btnText="Download Backup" />
        <Card icon="⬆️" title="Batch Promotion" desc="Force promote all batches. Year 1→2→3→Passed Out." action={handlePromote} btnText="Execute Promotion" />
        <Card icon="💀" title="Hard Reset" desc="Permanently delete ALL system data. This is IRREVERSIBLE." action={handleReset} btnText="HARD RESET" danger />
      </div>
    </div>
  );
};

/* ── Debug Panel ───────────────────────────────────────────────── */
export const GodPanelDebug = () => {
  const [results, setResults] = useState([]);
  const [checking, setChecking] = useState(false);

  const ENDPOINTS = [
    { path: '/stats',        label: 'System Stats' },
    { path: '/users',        label: 'Users API' },
    { path: '/cadets',       label: 'Cadets API' },
    { path: '/attendance',   label: 'Attendance API' },
    { path: '/notices',      label: 'Notices API' },
    { path: '/achievements', label: 'Achievements API' },
    { path: '/gallery',      label: 'Gallery API' },
    { path: '/logs',         label: 'Audit Logs API' },
    { path: '/undo',         label: 'Undo API' },
    { path: '/config',       label: 'Config API' },
  ];

  const runDiagnostics = async () => {
    setChecking(true);
    const out = [];
    for (const ep of ENDPOINTS) {
      const start = Date.now();
      try {
        const r = await godApi.get(ep.path);
        out.push({ ...ep, status: 'OK', time: Date.now() - start, code: r.status });
      } catch (err) {
        out.push({ ...ep, status: 'FAIL', time: Date.now() - start, code: err.response?.status || 'ERR', error: err.response?.data?.message || err.message });
      }
    }
    setResults(out);
    setChecking(false);
    const fails = out.filter(r => r.status === 'FAIL');
    if (fails.length === 0) toast.success('All systems operational');
    else toast.error(`${fails.length} endpoint(s) failed`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-3xl text-parchment tracking-wide">Debug Panel</h2>
          <p className="font-mono text-xs text-white/30 mt-1">Test all API endpoints and detect issues</p>
        </div>
        <button onClick={runDiagnostics} disabled={checking}
          className="px-6 py-2 bg-emerald-900/40 text-emerald-300 font-mono text-xs uppercase border border-emerald-500/20 rounded-sm hover:bg-emerald-900/60 disabled:opacity-50 transition-all">
          {checking ? '⏳ Running...' : '🔍 Run Diagnostics'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="divide-y divide-white/5">
            {results.map((r, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4">
                <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'OK' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="font-mono text-xs text-parchment w-40 shrink-0">{r.label}</span>
                <span className="font-mono text-2xs text-white/30">{r.path}</span>
                <span className={`font-mono text-2xs ml-auto ${r.status === 'OK' ? 'text-emerald-400' : 'text-red-400'}`}>{r.status} ({r.code})</span>
                <span className="font-mono text-2xs text-white/20">{r.time}ms</span>
                {r.error && <span className="font-mono text-2xs text-red-400/60 truncate max-w-[200px]">{r.error}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

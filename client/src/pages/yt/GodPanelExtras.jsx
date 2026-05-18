/**
 * GodPanelExtras.jsx — Page Editor + System Health panels
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import godApi from '../../services/godApi';

const T = ({ children, dim }) => (
  <span style={{ fontFamily: 'monospace', color: dim ? '#2a5a2a' : '#c8b98a', fontSize: 12 }}>
    {children}
  </span>
);

const TermCard = ({ title, children }) => (
  <div style={{ background: '#0a0e08', border: '1px solid #1a3a1a', marginBottom: 16 }}>
    <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderBottom: '1px solid #1a3a1a', alignItems: 'center' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4141', display: 'inline-block' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffaa00', display: 'inline-block' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#00ff41', display: 'inline-block' }} />
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#2a5a2a', marginLeft: 8, letterSpacing: 2 }}>{title}</span>
    </div>
    <div style={{ padding: 16 }}>{children}</div>
  </div>
);

/* ── PAGE EDITOR ──────────────────────────────────────────────────── */
const PAGE_SECTIONS = [
  { key: 'hero',         label: 'Hero Section',       fields: ['heading', 'subheading', 'ctaText'] },
  { key: 'ano',          label: 'ANO Section',         fields: ['heading', 'subtitle'] },
  { key: 'hierarchy',   label: 'Command Hierarchy',   fields: ['heading', 'visible'] },
  { key: 'yearbook',    label: 'Yearbook Preview',    fields: ['heading', 'visible'] },
  { key: 'gallery',     label: 'Gallery Section',     fields: ['heading', 'visible'] },
  { key: 'achievements',label: 'Achievements Wall',   fields: ['heading', 'visible'] },
  { key: 'notices',     label: 'Notice Board',        fields: ['heading', 'visible'] },
  { key: 'footer',      label: 'Footer',              fields: ['credit', 'visible'] },
];

export const GodPanelPageEditor = () => {
  const [configs, setConfigs]   = useState({});
  const [active,  setActive]    = useState('hero');
  const [saving,  setSaving]    = useState(false);
  const [form,    setForm]      = useState({});

  useEffect(() => {
    godApi.get('/config').then(r => {
      if (r.data?.success) {
        const map = {};
        (r.data.configs || []).forEach(c => { map[c.section] = c.config; });
        setConfigs(map);
        setForm(map[active] || getDefaults(active));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setForm(configs[active] || getDefaults(active));
  }, [active, configs]);

  const getDefaults = (section) => {
    const defs = {
      hero:          { heading: 'PRAHAR', subheading: 'LCIT NCC Digital Command System', ctaText: 'Enter Command Portal →' },
      ano:           { heading: 'Associate NCC Officer', subtitle: 'LCIT College, Bilaspur' },
      hierarchy:     { heading: 'Command Hierarchy', visible: true },
      yearbook:      { heading: 'Cadet Yearbook Preview', visible: true },
      gallery:       { heading: 'Gallery', visible: true },
      achievements:  { heading: 'Achievements Wall', visible: true },
      notices:       { heading: 'Latest Notices', visible: true },
      footer:        { credit: 'Built by Yash Tiwari', visible: true },
    };
    return defs[section] || {};
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await godApi.put(`/config/${active}`, { config: form });
      setConfigs(p => ({ ...p, [active]: form }));
      toast.success(`Saved: ${active} section`);
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleReset = () => {
    const def = getDefaults(active);
    setForm(def);
    toast('Reset to defaults (save to apply)', { icon: 'ℹ️' });
  };

  const section = PAGE_SECTIONS.find(s => s.key === active);

  return (
    <div>
      <div style={{ fontFamily: 'monospace', color: '#00ff41', fontSize: 18, letterSpacing: 4, marginBottom: 4 }}>
        PAGE_EDITOR.exe
      </div>
      <div style={{ fontFamily: 'monospace', color: '#2a5a2a', fontSize: 11, marginBottom: 20 }}>
        Edit public site sections › changes apply on next page load
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Section selector */}
        <div style={{ width: 180, shrink: 0 }}>
          <TermCard title="SECTIONS">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PAGE_SECTIONS.map(s => (
                <button key={s.key} onClick={() => setActive(s.key)}
                  style={{
                    padding: '6px 10px', fontFamily: 'monospace', fontSize: 11,
                    color: active === s.key ? '#00ff41' : '#2a5a2a',
                    background: active === s.key ? 'rgba(0,255,65,0.05)' : 'transparent',
                    border: `1px solid ${active === s.key ? '#1a5a1a' : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                  {active === s.key ? '▶ ' : '  '}{s.label}
                </button>
              ))}
            </div>
          </TermCard>
        </div>

        {/* Field editor */}
        <div style={{ flex: 1 }}>
          <TermCard title={`EDIT :: ${section?.label?.toUpperCase()}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section?.fields.map(field => (
                <div key={field}>
                  <T dim>// {field}</T>
                  <div style={{ marginTop: 4 }}>
                    {field === 'visible' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="checkbox" checked={!!form[field]} id={`field-${field}`}
                          onChange={e => setForm(p => ({ ...p, [field]: e.target.checked }))}
                          style={{ accentColor: '#00ff41', width: 16, height: 16 }} />
                        <label htmlFor={`field-${field}`} style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8b98a', cursor: 'pointer' }}>
                          Section visible on public site
                        </label>
                      </div>
                    ) : (
                      <input value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                        style={{
                          width: '100%', padding: '8px 12px', fontFamily: 'monospace', fontSize: 12,
                          background: '#040604', border: '1px solid #1a3a1a', color: '#c8b98a',
                          outline: 'none', boxSizing: 'border-box',
                        }} />
                    )}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ padding: '8px 20px', fontFamily: 'monospace', fontSize: 11, background: '#1a5a1a', color: '#00ff41', border: '1px solid #2a8a2a', cursor: 'pointer', letterSpacing: 2 }}>
                  {saving ? 'SAVING...' : '▶ SAVE SECTION'}
                </button>
                <button onClick={handleReset}
                  style={{ padding: '8px 20px', fontFamily: 'monospace', fontSize: 11, background: 'transparent', color: '#2a5a2a', border: '1px solid #1a3a1a', cursor: 'pointer', letterSpacing: 2 }}>
                  RESET DEFAULT
                </button>
              </div>
            </div>
          </TermCard>

          <TermCard title="PREVIEW :: CONFIG.JSON">
            <pre style={{ fontFamily: 'monospace', fontSize: 11, color: '#2a5a2a', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify({ section: active, ...form }, null, 2)}
            </pre>
          </TermCard>
        </div>
      </div>
    </div>
  );
};

/* ── SYSTEM HEALTH ────────────────────────────────────────────────── */
export const GodPanelHealth = () => {
  const [health,   setHealth]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const { data } = await godApi.get('/health');
      setHealth(data.health);
    } catch { toast.error('Health check failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHealth(); }, []);

  const Row = ({ label, value, ok }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0a1a0a' }}>
      <T dim>{label}</T>
      <span style={{ fontFamily: 'monospace', fontSize: 12, color: ok === false ? '#ff4141' : ok === true ? '#00ff41' : '#c8b98a' }}>{value}</span>
    </div>
  );

  return (
    <div>
      <div style={{ fontFamily: 'monospace', color: '#00ff41', fontSize: 18, letterSpacing: 4, marginBottom: 4 }}>
        SYSTEM_HEALTH.exe
      </div>
      <div style={{ fontFamily: 'monospace', color: '#2a5a2a', fontSize: 11, marginBottom: 20 }}>
        Live server diagnostics and resource monitoring
      </div>

      <TermCard title="SERVER :: STATUS">
        {loading ? (
          <T dim>// scanning...</T>
        ) : health ? (
          <div>
            <Row label="// db.status"      value={health.dbStatus}                          ok={health.dbStatus === 'connected'} />
            <Row label="// db.latency_ms"  value={`${health.dbLatencyMs}ms`}                ok={health.dbLatencyMs < 100} />
            <Row label="// server.uptime"  value={`${Math.floor(health.uptime / 60)}m ${Math.floor(health.uptime % 60)}s`} />
            <Row label="// process.memory" value={`${health.memoryMB} MB`}                   ok={health.memoryMB < 256} />
            <Row label="// node.version"   value={health.nodeVersion} />
            <Row label="// env"            value={health.env} />
            <Row label="// timestamp"      value={new Date(health.timestamp).toLocaleTimeString()} />
          </div>
        ) : (
          <T dim>// no data — run health check</T>
        )}
      </TermCard>

      <button onClick={fetchHealth} disabled={loading}
        style={{ padding: '8px 24px', fontFamily: 'monospace', fontSize: 11, background: '#1a5a1a', color: '#00ff41', border: '1px solid #2a8a2a', cursor: 'pointer', letterSpacing: 2 }}>
        {loading ? '// SCANNING...' : '▶ REFRESH HEALTH'}
      </button>
    </div>
  );
};

/* ── BULK DELETE ──────────────────────────────────────────────────── */
export const GodPanelBulkOps = () => {
  const [confirmText, setConfirmText] = useState('');
  const [entity,      setEntity]      = useState('cadets');
  const [loading,     setLoading]     = useState(false);

  const ENTITIES = ['cadets', 'notices', 'achievements', 'gallery', 'events'];
  const expected = `DELETE-ALL-${entity.toUpperCase()}`;

  const handleBulkDelete = async () => {
    if (confirmText !== expected) {
      toast.error(`Type exactly: ${expected}`);
      return;
    }
    setLoading(true);
    try {
      const { data } = await godApi.delete(`/bulk/${entity}`, { data: { confirm: confirmText } });
      toast.success(data.message);
      setConfirmText('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ fontFamily: 'monospace', color: '#ff4141', fontSize: 18, letterSpacing: 4, marginBottom: 4 }}>
        ⚠ BULK_OPS.exe
      </div>
      <div style={{ fontFamily: 'monospace', color: '#2a5a2a', fontSize: 11, marginBottom: 20 }}>
        Irreversible bulk operations — require explicit confirmation string
      </div>

      <TermCard title="BULK DELETE :: SELECT ENTITY">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {ENTITIES.map(e => (
            <button key={e} onClick={() => { setEntity(e); setConfirmText(''); }}
              style={{ padding: '6px 14px', fontFamily: 'monospace', fontSize: 11, cursor: 'pointer',
                background: entity === e ? '#2a0a0a' : 'transparent',
                color: entity === e ? '#ff4141' : '#2a5a2a',
                border: `1px solid ${entity === e ? '#ff4141' : '#1a3a1a'}` }}>
              {e.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ background: '#0a0000', border: '1px solid #ff4141', padding: 12, marginBottom: 12 }}>
          <T dim>// To confirm, type exactly:</T>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#ff4141', letterSpacing: 2, marginTop: 4 }}>
            {expected}
          </div>
        </div>

        <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
          placeholder={expected}
          style={{ width: '100%', padding: '8px 12px', fontFamily: 'monospace', fontSize: 12,
            background: '#040604', border: '1px solid #3a0a0a', color: '#ff4141',
            outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />

        <button onClick={handleBulkDelete} disabled={loading || confirmText !== expected}
          style={{ padding: '8px 20px', fontFamily: 'monospace', fontSize: 11,
            background: confirmText === expected ? '#3a0000' : '#0a0000',
            color: confirmText === expected ? '#ff4141' : '#2a0a0a',
            border: `1px solid ${confirmText === expected ? '#ff4141' : '#1a0000'}`,
            cursor: confirmText === expected ? 'pointer' : 'not-allowed', letterSpacing: 2 }}>
          {loading ? '// DELETING...' : `▶ DELETE ALL ${entity.toUpperCase()}`}
        </button>
      </TermCard>
    </div>
  );
};

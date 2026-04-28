/**
 * CadetDetail.jsx — Full cadet profile page (FIXED for new architecture)
 * Uses useAuthStore + api instead of legacy AuthContext/cadetService
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import AnimatedPage from '../components/layout/AnimatedPage';

// ── Attendance ring ──────────────────────────────────────────────────────────
const AttendanceRing = ({ pct }) => {
  if (pct === null || pct === undefined) return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full border-4 border-olive/20 flex items-center justify-center">
        <span className="text-olive-muted text-xs text-center">No data</span>
      </div>
    </div>
  );
  const radius = 36;
  const circ = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circ;
  const color = pct >= 75 ? '#27ae60' : pct >= 50 ? '#e67e22' : '#c0392b';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="8" />
          <circle cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 48 48)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-olive-dark leading-none">{pct}%</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        {pct >= 75 ? 'Good Standing' : pct >= 50 ? 'At Risk' : 'Defaulter'}
      </span>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CadetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isANO = user?.role === 'ANO';
  const [cadet, setCadet] = useState(null);
  const [attendance, setAttendance] = useState({ entries: [], stats: { total: 0, present: 0, percentage: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cadetRes, attRes] = await Promise.all([
          api.get(`/cadets/${id}`),
          api.get(`/attendance/cadet/${id}`).catch(() => ({ data: { entries: [], stats: { total: 0, present: 0, percentage: 0 } } })),
        ]);
        if (cadetRes.data.success) setCadet(cadetRes.data.cadet);
        if (attRes.data.success) setAttendance(attRes.data);
      } catch {
        setCadet(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <AnimatedPage className="page-shell flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-khaki/20 border-t-khaki rounded-full animate-spin mx-auto mb-3" />
        <p className="font-mono text-xs text-olive-muted">Loading profile...</p>
      </div>
    </AnimatedPage>
  );

  if (!cadet) return (
    <AnimatedPage className="page-shell">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4">← Back</button>
      <div className="card p-16 text-center">
        <div className="empty-state-icon">👤</div>
        <div className="empty-state-title">Cadet not found</div>
        <div className="empty-state-sub">This profile may have been removed or the ID is invalid.</div>
      </div>
    </AnimatedPage>
  );

  const RANK_COLOR = { SUO: '#d4af37', JUO: '#c2b280', SGT: '#4a5a48', CPL: '#6b7a69', LCPL: '#6b7a69', CADET: '#a8b8a5' };
  const rankColor = RANK_COLOR[cadet.rank] || '#a8b8a5';

  return (
    <AnimatedPage className="page-shell">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 w-max">← Back to Registry</button>

      {/* Profile Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="relative">
              {cadet.photoUrl
                ? <img src={cadet.photoUrl} alt={cadet.name} className="w-28 h-28 rounded-sm object-cover border-2 border-khaki/40" />
                : <div className="w-28 h-28 rounded-sm bg-gradient-to-br from-olive/10 to-khaki/10 border-2 border-olive/20 flex items-center justify-center">
                    <span className="font-display text-5xl text-olive/30">{cadet.name?.[0]}</span>
                  </div>
              }
              {cadet.isHonorRoll && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gold rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xs">★</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">{cadet.serviceNumber}</div>
                <h1 className="font-display text-4xl text-olive-dark uppercase">{cadet.name}</h1>
              </div>
              {isANO && (
                <div className="flex gap-2">
                  <button onClick={() => toast('Use Edit button in registry')} className="btn-ghost text-xs">✎ Edit</button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded-sm border"
                style={{ background: `${rankColor}25`, color: rankColor, borderColor: `${rankColor}40` }}>
                {cadet.rank}
              </span>
              <span className="badge-olive">{cadet.wing} Wing</span>
              <span className="badge">Year {cadet.yearOfStudy}</span>
              <span className="badge">{cadet.batchYear}</span>
              {cadet.status === 'PASSED_OUT' && <span className="badge-red">PASSED OUT</span>}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {cadet.phone && <div><p className="font-mono text-2xs text-olive-muted uppercase tracking-wider">Phone</p><p className="text-sm text-olive-dark">{cadet.phone}</p></div>}
              {cadet.email && <div><p className="font-mono text-2xs text-olive-muted uppercase tracking-wider">Email</p><p className="text-sm text-olive-dark truncate">{cadet.email}</p></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {/* Attendance Ring */}
        <div className="card p-5 flex flex-col items-center gap-3">
          <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider self-start">Attendance</div>
          <AttendanceRing pct={attendance.stats?.percentage} />
          <p className="font-mono text-2xs text-olive-muted text-center">
            {attendance.stats?.present || 0}/{attendance.stats?.total || 0} sessions
          </p>
        </div>

        {/* Honor Status */}
        <div className={`card p-5 ${cadet.isHonorRoll ? 'border-khaki/40' : ''}`}>
          <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-3">Honor Status</div>
          {cadet.isHonorRoll
            ? <p className="text-khaki-dark font-bold text-lg">★ Honored Cadet</p>
            : <p className="text-olive-muted/60 text-sm">Not on Honor Roll</p>
          }
          {cadet.yearbookMessage && (
            <p className="text-olive-muted text-xs mt-2 italic border-l-2 border-khaki/30 pl-2">&quot;{cadet.yearbookMessage}&quot;</p>
          )}
        </div>

        {/* Gender / Status */}
        <div className="card p-5">
          <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-3">Cadet Info</div>
          <div className="space-y-2">
            <div><span className="font-mono text-2xs text-olive-muted">Gender: </span><span className="text-olive-dark text-sm">{cadet.gender === 'M' ? 'Male' : 'Female'}</span></div>
            <div><span className="font-mono text-2xs text-olive-muted">Status: </span><span className="text-olive-dark text-sm">{cadet.status}</span></div>
            <div><span className="font-mono text-2xs text-olive-muted">Enrolled: </span><span className="text-olive-dark text-sm">{cadet.createdAt ? new Date(cadet.createdAt).toLocaleDateString('en-IN') : '—'}</span></div>
          </div>
        </div>
      </div>

      {/* Attendance history */}
      {attendance.entries?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100">
            <h3 className="font-heading font-bold text-olive-dark uppercase text-sm">Attendance History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Session</th><th>Status</th></tr>
              </thead>
              <tbody>
                {attendance.entries.slice(0, 20).map((e, i) => (
                  <motion.tr key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <td className="font-mono text-xs text-olive-muted">
                      {e.sessionId?.date ? new Date(e.sessionId.date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="font-mono text-xs">{e.sessionId?.sessionType || '—'}</td>
                    <td>
                      <span className={`badge ${e.status === 'P' ? 'badge-green' : e.status === 'A' ? 'badge-red' : 'badge-amber'}`}>
                        {e.status === 'P' ? 'Present' : e.status === 'A' ? 'Absent' : 'Leave'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default CadetDetail;

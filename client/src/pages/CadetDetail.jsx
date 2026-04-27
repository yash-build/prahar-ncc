/**
 * CadetDetail.jsx — Full cadet profile page
 * Shows attendance %, achievements timeline, personal message, honor status
 */

import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { useAuth }             from '../context/AuthContext';
import {
  Star, Award, Calendar, ChevronLeft, Shield,
  MessageSquare, TrendingUp, AlertTriangle, Edit2, Check, X,
} from 'lucide-react';
import { cadetService, achievementService } from '../services/services';
import { RankBadge, WingBadge }       from '../components/RankBadge';
import LoadingSpinner                  from '../components/LoadingSpinner';
import {
  formatDate, getAttendanceColor, getAttendanceLabel,
  getInitials, getPriorityConfig,
} from '../utils/helpers';
import toast from 'react-hot-toast';

// ── Attendance ring ──────────────────────────────────────────────────────────
const AttendanceRing = ({ pct }) => {
  if (pct === null || pct === undefined) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border-4 border-[#2d3748] flex items-center justify-center">
          <span className="text-[#6b7560] text-xs text-center">No data</span>
        </div>
      </div>
    );
  }

  const radius     = 36;
  const circ       = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circ;
  const color      = pct >= 75 ? '#27ae60' : pct >= 50 ? '#e67e22' : '#c0392b';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96">
          {/* Background ring */}
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#2d3748" strokeWidth="8" />
          {/* Progress ring */}
          <circle
            cx="48" cy="48" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 48 48)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#e8e4dc] leading-none">{pct}%</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>
        {getAttendanceLabel(pct)}
      </span>
    </div>
  );
};

// ── Achievement card ─────────────────────────────────────────────────────────
const AchievementItem = ({ a, canDelete, onDelete }) => (
  <div className="flex items-start gap-3 p-3 bg-[#0f1117] rounded-lg border border-[#2d3748]">
    <div className="w-8 h-8 rounded-lg bg-[#3d3000] border border-[#6b5a00] flex items-center justify-center flex-shrink-0 mt-0.5">
      <Award size={14} className="text-[#c8b87a]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[#e8e4dc] text-sm font-semibold leading-tight">{a.title}</p>
      {a.description && (
        <p className="text-[#6b7560] text-xs mt-0.5 leading-relaxed">{a.description}</p>
      )}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {a.type && (
          <span className="text-[10px] bg-[#1c2128] border border-[#2d3748] text-[#8a9080] px-2 py-0.5 rounded">
            {a.type}
          </span>
        )}
        {a.level && (
          <span className="text-[10px] bg-[#3d3000] border border-[#6b5a00] text-[#c8b87a] px-2 py-0.5 rounded font-bold">
            {a.level}
          </span>
        )}
        <span className="text-[10px] text-[#4a5240] flex items-center gap-1">
          <Calendar size={9} /> {formatDate(a.date)}
        </span>
      </div>
    </div>
    {canDelete && (
      <button onClick={() => onDelete(a._id)} className="text-[#5a2a2a] hover:text-red-400 text-xs transition-colors flex-shrink-0">
        <X size={14} />
      </button>
    )}
  </div>
);

// ── Personal message editor ──────────────────────────────────────────────────
const PersonalMessage = ({ cadetId, initial, canEdit }) => {
  const [editing, setEditing]   = useState(false);
  const [message, setMessage]   = useState(initial || '');
  const [loading, setLoading]   = useState(false);

  const save = async () => {
    if (message.length > 500) { toast.error('Max 500 characters'); return; }
    setLoading(true);
    try {
      await cadetService.updateMessage(cadetId, message);
      toast.success('Message updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!initial && !canEdit) return null;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[#4a5240]" />
          <span className="text-xs text-[#8a9080] uppercase tracking-wider font-semibold">
            ANO's Message
          </span>
        </div>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)} className="text-[#4a5240] hover:text-[#6b7560]">
            <Edit2 size={13} />
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            className="input text-sm resize-none"
            placeholder="Write a personal note for this cadet..."
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#4a5240]">{message.length}/500</span>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs py-1.5 px-3">
                Cancel
              </button>
              <button onClick={save} disabled={loading} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                {loading ? <div className="w-3 h-3 border border-[#6b7560] border-t-[#c8b87a] rounded-full animate-spin" /> : <Check size={12} />}
                Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[#8a9080] text-sm leading-relaxed italic">
          {message || (canEdit ? 'Click edit to add a personal message...' : 'No message')}
        </p>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const CadetDetail = () => {
  const { id }          = useParams();
  const { isANO }       = useAuth();
  const [cadet,  setCadet]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await cadetService.getOne(id);
        setCadet(res.data.cadet);
      } catch {
        setCadet(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDeleteAchievement = async (achId) => {
    if (!confirm('Delete this achievement?')) return;
    try {
      await achievementService.remove(achId);
      setCadet(prev => ({
        ...prev,
        achievements: prev.achievements.filter(a => a._id !== achId),
      }));
      toast.success('Achievement removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleHonor = async () => {
    try {
      await cadetService.toggleHonor(id, cadet.honorNote);
      setCadet(prev => ({ ...prev, isHonored: !prev.isHonored }));
      toast.success(cadet.isHonored ? 'Removed from Honor Board' : 'Added to Honor Board');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" label="Loading profile..." />
    </div>
  );

  if (!cadet) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-[#6b7560] text-lg">Cadet not found</p>
      <Link to="/cadets" className="btn-ghost mt-4 inline-flex items-center gap-2 text-sm">
        <ChevronLeft size={14} /> Back to Registry
      </Link>
    </div>
  );

  const { name, regNo, rank, wing, year, photoUrl, isHonored, honorNote,
          personalMessage, attendance, achievements, phone, email, enrolledAt } = cadet;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Back */}
      <Link to="/cadets" className="inline-flex items-center gap-1.5 text-[#6b7560] hover:text-[#e8e4dc] text-sm mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to Registry
      </Link>

      {/* Profile header */}
      <div className="card p-6 mb-6 animate-fade-up">
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              {photoUrl ? (
                <img src={photoUrl} alt={name}
                  className={`w-28 h-28 rounded-xl object-cover border-2 ${isHonored ? 'border-[#c8b87a]' : 'border-[#2d3748]'}`} />
              ) : (
                <div className={`w-28 h-28 rounded-xl bg-[#2d3748] flex items-center justify-center border-2 ${isHonored ? 'border-[#c8b87a]' : 'border-[#2d3748]'}`}>
                  <span className="text-3xl font-bold text-[#6b7560]">{getInitials(name)}</span>
                </div>
              )}
              {isHonored && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#c8b87a] rounded-full flex items-center justify-center shadow-lg">
                  <Star size={13} fill="currentColor" className="text-[#2e3328]" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-[#e8e4dc] font-serif leading-tight">{name}</h1>
                <p className="text-[#6b7560] text-sm font-mono mt-0.5">{regNo}</p>
              </div>
              {isANO && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleToggleHonor}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border font-semibold transition-all
                      ${isHonored
                        ? 'bg-[#3d3000] text-[#c8b87a] border-[#6b5a00] hover:bg-[#5a4500]'
                        : 'bg-transparent text-[#6b7560] border-[#2d3748] hover:border-[#c8b87a] hover:text-[#c8b87a]'}`}
                  >
                    <Star size={12} fill={isHonored ? 'currentColor' : 'none'} />
                    {isHonored ? 'Honored' : 'Honor'}
                  </button>
                  <Link to={`/admin?editCadet=${id}`} className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <Edit2 size={12} /> Edit
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <RankBadge rank={rank} size="md" />
              <WingBadge wing={wing} size="md" />
              <span className="text-xs bg-[#1c2128] border border-[#2d3748] text-[#6b7560] px-2.5 py-1 rounded">
                Year {year}
              </span>
              {attendance?.isDefaulter && (
                <span className="flex items-center gap-1 text-xs bg-[#3a0000] border border-[#8a0000] text-red-400 px-2.5 py-1 rounded font-bold">
                  <AlertTriangle size={11} /> Defaulter
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {phone && (
                <div>
                  <p className="text-[10px] text-[#4a5240] uppercase tracking-wider">Phone</p>
                  <p className="text-sm text-[#8a9080]">{phone}</p>
                </div>
              )}
              {email && (
                <div>
                  <p className="text-[10px] text-[#4a5240] uppercase tracking-wider">Email</p>
                  <p className="text-sm text-[#8a9080] truncate">{email}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-[#4a5240] uppercase tracking-wider">Enrolled</p>
                <p className="text-sm text-[#8a9080]">{formatDate(enrolledAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-column info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

        {/* Attendance ring */}
        <div className="card p-5 flex flex-col items-center gap-3 animate-fade-up-delay-1">
          <div className="flex items-center gap-2 self-start">
            <TrendingUp size={14} className="text-[#4a5240]" />
            <span className="text-xs text-[#8a9080] uppercase tracking-wider font-semibold">Attendance</span>
          </div>
          <AttendanceRing pct={attendance?.percentage} />
          {attendance?.sessionsTotal > 0 && (
            <p className="text-[10px] text-[#4a5240] text-center">
              {attendance.sessionsPresent}/{attendance.sessionsTotal} sessions
            </p>
          )}
        </div>

        {/* Achievements count */}
        <div className="card p-5 animate-fade-up-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <Award size={14} className="text-[#c8b87a]" />
            <span className="text-xs text-[#8a9080] uppercase tracking-wider font-semibold">Achievements</span>
          </div>
          <p className="text-4xl font-bold text-[#e8e4dc] font-serif">{achievements?.length || 0}</p>
          <p className="text-xs text-[#6b7560] mt-1">Total records</p>
          {achievements?.length > 0 && (
            <div className="mt-3 space-y-1">
              {['National', 'State', 'District'].map(lvl => {
                const count = achievements.filter(a => a.level === lvl).length;
                return count > 0 ? (
                  <div key={lvl} className="flex items-center justify-between text-xs">
                    <span className="text-[#6b7560]">{lvl}</span>
                    <span className="text-[#c8b87a] font-bold">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Honor status */}
        <div className={`card p-5 animate-fade-up-delay-3 ${isHonored ? 'border-[#6b5a00]' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className={isHonored ? 'text-[#c8b87a]' : 'text-[#4a5240]'} fill={isHonored ? 'currentColor' : 'none'} />
            <span className="text-xs text-[#8a9080] uppercase tracking-wider font-semibold">Honor Status</span>
          </div>
          {isHonored ? (
            <>
              <p className="text-[#c8b87a] font-bold text-sm">★ Honored Cadet</p>
              {honorNote && <p className="text-[#8a9080] text-xs mt-2 leading-relaxed italic">"{honorNote}"</p>}
            </>
          ) : (
            <p className="text-[#4a5240] text-sm">Not honored yet</p>
          )}
        </div>
      </div>

      {/* Personal message */}
      <div className="mb-6 animate-fade-up">
        <PersonalMessage
          cadetId={id}
          initial={personalMessage}
          canEdit={isANO}
        />
      </div>

      {/* Achievements timeline */}
      <div className="card p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-[#c8b87a]" />
            <span className="text-sm text-[#8a9080] uppercase tracking-wider font-semibold">
              Achievement Record
            </span>
          </div>
          {isANO && (
            <Link
              to={`/admin?addAchievement=${id}`}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1"
            >
              + Add
            </Link>
          )}
        </div>

        {achievements?.length === 0 ? (
          <div className="text-center py-8">
            <Award size={32} className="text-[#2d3748] mx-auto mb-2" />
            <p className="text-[#4a5240] text-sm">No achievements recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {achievements.map(a => (
              <AchievementItem
                key={a._id}
                a={a}
                canDelete={isANO}
                onDelete={handleDeleteAchievement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CadetDetail;

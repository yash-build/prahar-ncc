/**
 * AttendancePanel.jsx
 * Full attendance marking workflow:
 * 1. List of past sessions
 * 2. Create new session
 * 3. Mark individual cadets present/absent
 * 4. Bulk mark all present/absent
 */

import { useEffect, useState } from 'react';
import { useAuth }             from '../context/AuthContext';
import { attendanceService }   from '../services/services';
import {
  CheckCircle, XCircle, PlusCircle, Lock, Unlock,
  Users, Calendar, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

// ── New Session Form ──────────────────────────────────────────────────────────
const NewSessionForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    date:         new Date().toISOString().split('T')[0], // Today's date
    sessionLabel: 'Parade',
    wing:         'ALL',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await attendanceService.createSession(form);
      toast.success(`Session created — ${res.data.message}`);
      onCreated(res.data.sessionId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6">
      <h3 className="text-sm font-semibold text-[#e8e4dc] mb-4 flex items-center gap-2">
        <PlusCircle size={14} className="text-[#4a5240]" /> Create New Session
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Date</label>
          <input type="date" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="input text-sm" required />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Session Label</label>
          <input type="text" value={form.sessionLabel}
            onChange={e => setForm(f => ({ ...f, sessionLabel: e.target.value }))}
            className="input text-sm" placeholder="Morning Parade" maxLength={80} />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Wing</label>
          <select value={form.wing} onChange={e => setForm(f => ({ ...f, wing: e.target.value }))}
            className="input text-sm">
            <option value="ALL">All (SD + SW)</option>
            <option value="SD">SD only</option>
            <option value="SW">SW only</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
        {loading
          ? <><div className="w-4 h-4 border-2 border-[#6b7560] border-t-[#c8b87a] rounded-full animate-spin" /> Creating...</>
          : <><PlusCircle size={14} /> Create Session</>}
      </button>
    </form>
  );
};

// ── Attendance Marking Panel ──────────────────────────────────────────────────
const SessionMarkingPanel = ({ sessionId, isANO, onLockToggle }) => {
  const [session,  setSession]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  // Local state of status changes before saving
  const [changes,  setChanges]  = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await attendanceService.getSession(sessionId);
        setSession(res.data.session);
        setChanges({});
      } catch {
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sessionId]);

  const toggleStatus = (cadetId, currentStatus) => {
    if (session?.isLocked && !isANO) return;
    const next = currentStatus === 'present' ? 'absent' : 'present';
    setChanges(prev => ({ ...prev, [cadetId]: next }));
  };

  const getStatus = (record) => {
    return changes[record.cadet._id] ?? record.status;
  };

  const saveChanges = async () => {
    const updates = Object.entries(changes).map(([cadetId, status]) => ({ cadetId, status }));
    if (updates.length === 0) { toast('No changes to save', { icon: 'ℹ️' }); return; }

    setSaving(true);
    try {
      await attendanceService.markAttendance(sessionId, updates);
      // Apply changes to local session state
      setSession(prev => ({
        ...prev,
        records: prev.records.map(r => ({
          ...r,
          status: changes[r.cadet._id] ?? r.status,
        })),
      }));
      setChanges({});
      toast.success(`${updates.length} record(s) saved`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const bulkMark = async (status) => {
    setSaving(true);
    try {
      await attendanceService.bulkMark(sessionId, status);
      setSession(prev => ({
        ...prev,
        records: prev.records.map(r => ({ ...r, status })),
      }));
      setChanges({});
      toast.success(`All cadets marked ${status}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLockToggle = async () => {
    try {
      await attendanceService.toggleLock(sessionId);
      setSession(prev => ({ ...prev, isLocked: !prev.isLocked }));
      toast.success(session.isLocked ? 'Session unlocked' : 'Session locked');
      onLockToggle?.();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="py-8 flex justify-center"><LoadingSpinner label="Loading session..." /></div>;
  if (!session) return null;

  const presentCount    = session.records.filter(r => (changes[r.cadet._id] ?? r.status) === 'present').length;
  const totalCount      = session.records.length;
  const hasUnsavedChanges = Object.keys(changes).length > 0;

  return (
    <div className="card p-5 animate-fade-up">
      {/* Session info bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-4 border-b border-[#2d3748]">
        <div>
          <h3 className="text-[#e8e4dc] font-semibold">{session.sessionLabel}</h3>
          <p className="text-[#6b7560] text-xs mt-0.5">
            {formatDate(session.date)} · Wing: {session.wing} · {totalCount} cadets
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Lock indicator */}
          {session.isLocked ? (
            <span className="flex items-center gap-1 text-xs text-orange-400 bg-[#3a2000] border border-[#6b4000] px-2 py-1 rounded">
              <Lock size={11} /> Locked
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-[#003a10] border border-[#006b20] px-2 py-1 rounded">
              <Unlock size={11} /> Open
            </span>
          )}
          {isANO && (
            <button onClick={handleLockToggle} className="btn-ghost text-xs py-1 px-2.5 flex items-center gap-1">
              {session.isLocked ? <Unlock size={11} /> : <Lock size={11} />}
              {session.isLocked ? 'Unlock' : 'Lock'}
            </button>
          )}
        </div>
      </div>

      {/* Attendance summary */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-[#0f1117] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400 font-serif">{presentCount}</p>
          <p className="text-[10px] text-[#6b7560] uppercase tracking-wider">Present</p>
        </div>
        <div className="flex-1 bg-[#0f1117] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400 font-serif">{totalCount - presentCount}</p>
          <p className="text-[10px] text-[#6b7560] uppercase tracking-wider">Absent</p>
        </div>
        <div className="flex-1 bg-[#0f1117] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#c8b87a] font-serif">
            {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
          </p>
          <p className="text-[10px] text-[#6b7560] uppercase tracking-wider">Attendance</p>
        </div>
      </div>

      {/* Bulk actions */}
      {!session.isLocked || isANO ? (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button onClick={() => bulkMark('present')} disabled={saving}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-green-900 border-green-700 hover:bg-green-800">
            <CheckCircle size={12} /> Mark All Present
          </button>
          <button onClick={() => bulkMark('absent')} disabled={saving}
            className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5">
            <XCircle size={12} /> Mark All Absent
          </button>
          {hasUnsavedChanges && (
            <button onClick={saveChanges} disabled={saving}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 ml-auto">
              {saving
                ? <div className="w-3 h-3 border border-[#6b7560] border-t-[#c8b87a] rounded-full animate-spin" />
                : null}
              Save {Object.keys(changes).length} Change{Object.keys(changes).length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4 text-xs text-orange-400 bg-[#3a2000] border border-[#6b4000] rounded px-3 py-2">
          <AlertCircle size={13} /> This session is locked. Only ANO can make changes.
        </div>
      )}

      {/* Cadet list */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
        {session.records.map(record => {
          const status = getStatus(record);
          const isPresent = status === 'present';
          const hasChange = changes[record.cadet._id] !== undefined;

          return (
            <button
              key={record.cadet._id}
              onClick={() => toggleStatus(record.cadet._id, status)}
              disabled={(session.isLocked && !isANO) || saving}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                ${isPresent
                  ? 'bg-[#003a10] border-[#005a18] hover:bg-[#004a14]'
                  : 'bg-[#1c2128] border-[#2d3748] hover:border-[#4a5240]'}
                ${hasChange ? 'ring-1 ring-[#c8b87a]' : ''}
                ${(session.isLocked && !isANO) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {/* Status icon */}
              {isPresent
                ? <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                : <XCircle    size={16} className="text-red-400 flex-shrink-0" />}

              {/* Cadet info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e8e4dc] leading-tight truncate">
                  {record.cadet.name}
                </p>
                <p className="text-[10px] text-[#6b7560] font-mono">{record.cadet.regNo}</p>
              </div>

              {/* Rank + Wing */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`rank-${record.cadet.rank?.toLowerCase().replace('/', '')} px-1.5 py-0.5 text-[9px] rounded font-bold`}>
                  {record.cadet.rank}
                </span>
              </div>

              {/* Change indicator */}
              {hasChange && (
                <span className="text-[#c8b87a] text-[9px] flex-shrink-0">●</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating save bar when changes pending */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-0 mt-4 pt-4 border-t border-[#2d3748] flex items-center justify-between">
          <span className="text-xs text-[#c8b87a]">
            ● {Object.keys(changes).length} unsaved change(s)
          </span>
          <button onClick={saveChanges} disabled={saving} className="btn-primary text-sm py-2 px-5">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const AttendancePanel = () => {
  const { isANO }              = useAuth();
  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeId,    setActiveId]    = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const loadSessions = async () => {
    try {
      const res = await attendanceService.getSessions({});
      setSessions(res.data.sessions);
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  const handleCreated = (newSessionId) => {
    setShowNewForm(false);
    loadSessions();
    setActiveId(newSessionId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e8e4dc] font-serif">Attendance</h1>
          <p className="text-[#6b7560] text-sm mt-1">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(s => !s)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <PlusCircle size={14} />
          {showNewForm ? 'Cancel' : 'New Session'}
        </button>
      </div>

      {/* New session form */}
      {showNewForm && <NewSessionForm onCreated={handleCreated} />}

      {/* Active session marking panel */}
      {activeId && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-[#8a9080] uppercase tracking-wider font-semibold">
              Marking Attendance
            </h2>
            <button onClick={() => setActiveId(null)} className="text-xs text-[#4a5240] hover:text-[#6b7560]">
              Close ×
            </button>
          </div>
          <SessionMarkingPanel
            sessionId={activeId}
            isANO={isANO}
            onLockToggle={loadSessions}
          />
        </div>
      )}

      {/* Sessions list */}
      <div>
        <h2 className="text-sm text-[#6b7560] uppercase tracking-widest font-semibold mb-3">
          Session History
        </h2>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner label="Loading sessions..." /></div>
        ) : sessions.length === 0 ? (
          <div className="card p-8 text-center">
            <Calendar size={32} className="text-[#2d3748] mx-auto mb-3" />
            <p className="text-[#6b7560] text-sm">No attendance sessions yet</p>
            <p className="text-[#4a5240] text-xs mt-1">Create a session to start marking attendance</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => {
              const pct = session.totalCadets > 0
                ? Math.round((session.presentCount / session.totalCadets) * 100)
                : 0;
              const isActive = activeId === session._id;

              return (
                <button
                  key={session._id}
                  onClick={() => setActiveId(isActive ? null : session._id)}
                  className={`w-full card p-4 flex items-center gap-4 text-left transition-all
                    ${isActive ? 'border-[#4a5240]' : ''}`}
                >
                  {/* Date block */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-[#c8b87a] text-lg font-bold font-serif leading-none">
                      {new Date(session.date).getDate()}
                    </p>
                    <p className="text-[#6b7560] text-[10px] uppercase">
                      {new Date(session.date).toLocaleString('en-IN', { month: 'short' })}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e8e4dc] text-sm font-semibold leading-tight">
                      {session.sessionLabel}
                    </p>
                    <p className="text-[#6b7560] text-xs mt-0.5">
                      Wing: {session.wing} · {session.presentCount}/{session.totalCadets} present
                      {session.markedBy ? ` · by ${session.markedBy.name}` : ''}
                    </p>
                  </div>

                  {/* Attendance % */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-lg font-bold font-serif ${pct >= 75 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {pct}%
                    </p>
                  </div>

                  {/* Lock + expand */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {session.isLocked && <Lock size={12} className="text-orange-400" />}
                    {isActive
                      ? <ChevronUp size={14} className="text-[#4a5240]" />
                      : <ChevronDown size={14} className="text-[#4a5240]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePanel;

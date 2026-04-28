import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const SESSION_TYPES = ['PARADE', 'PT', 'CAMP', 'NCC_DAY', 'CLASSIFIED'];

const STATUS_OPTS = [
  { key: 'P', label: 'P', color: 'bg-emerald-500 border-emerald-500 text-white' },
  { key: 'A', label: 'A', color: 'bg-red-500 border-red-500 text-white' },
  { key: 'L', label: 'L', color: 'bg-amber-500 border-amber-500 text-white' },
];

const AttendancePage = () => {
  const [sessionType, setType]      = useState('PARADE');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [cadets, setCadets]         = useState([]);
  const [sessionId, setSessionId]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading]       = useState(true);

  // Fetch all active cadets
  useEffect(() => {
    api.get('/cadets').then(r => {
      if (r.data.success) {
        setCadets(r.data.cadets.map(c => ({
          id: c._id, reg: c.serviceNumber, name: c.name, rank: c.rank, status: 'P'
        })));
      }
    }).finally(() => setLoading(false));
  }, []);

  // Fetch session based on date and type
  useEffect(() => {
    if (loading) return;
    const fetchSessionData = async () => {
      try {
        const { data } = await api.get(`/attendance/sessions?date=${date}&sessionType=${sessionType}`);
        if (data.success && data.sessions.length > 0) {
          const session = data.sessions[0];
          setSessionId(session._id);
          const entriesRes = await api.get(`/attendance/sessions/${session._id}/entries`);
          if (entriesRes.data.success) {
            const entryMap = {};
            entriesRes.data.entries.forEach(e => entryMap[e.cadetId._id || e.cadetId] = e.status);
            setCadets(cs => cs.map(c => ({ ...c, status: entryMap[c.id] || 'P' })));
          }
        } else {
          setSessionId(null);
          setCadets(cs => cs.map(c => ({ ...c, status: 'P' })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSessionData();
  }, [date, sessionType, loading]);

  const toggle = (id, status) => {
    setCadets(cs => cs.map(c => c.id === id ? { ...c, status } : c));
  };

  const markAll = (status) => {
    setCadets(cs => cs.map(c => ({ ...c, status })));
    toast.success(`All cadets marked ${status}`);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const { data } = await api.post('/attendance/sessions', { date, sessionType });
        if (data.success) currentSessionId = data.session._id;
        setSessionId(currentSessionId);
      }
      
      const entries = cadets.map(c => ({ cadetId: c.id, status: c.status }));
      await api.post(`/attendance/sessions/${currentSessionId}/entries`, { entries });
      toast.success('Attendance session submitted and logged.');
    } catch (err) {
      toast.error('Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const present = cadets.filter(c => c.status === 'P').length;
  const absent  = cadets.filter(c => c.status === 'A').length;
  const leave   = cadets.filter(c => c.status === 'L').length;

  return (
    <AnimatedPage className="page-shell">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">OPERATIONS</div>
          <h1 className="section-title">Attendance Marker</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">Mark bulk attendance for any session type.</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-khaki/30 border-t-khaki rounded-full animate-spin" />
              Submitting...
            </span>
          ) : '✓ Submit Session'}
        </button>
      </div>

      {/* Session config */}
      <div className="card p-5 flex flex-wrap gap-6 items-end">
        <div>
          <label className="label">Session Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input w-48" />
        </div>
        <div>
          <label className="label">Session Type</label>
          <select value={sessionType} onChange={e => setType(e.target.value)} className="input w-44 bg-white">
            {SESSION_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => markAll('P')} className="btn-ghost text-xs">Mark All P</button>
          <button onClick={() => markAll('A')}  className="btn-ghost text-xs">Mark All A</button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Present', val: present, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Absent',  val: absent,  color: 'text-red-600',     bg: 'bg-red-50 border-red-200' },
          { label: 'On Leave',val: leave,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`border rounded-sm p-4 ${s.bg} text-center`}>
            <div className={`font-display text-4xl ${s.color}`}>{s.val}</div>
            <div className={`font-mono text-2xs ${s.color} tracking-military mt-1`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service No.</th>
                <th>Cadet</th>
                <th>Rank</th>
                <th className="text-center">Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {cadets.map((cadet, i) => (
                <motion.tr
                  key={cadet.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                >
                  <td className="font-mono text-xs text-olive-muted">{cadet.reg}</td>
                  <td className="font-heading font-semibold text-olive-dark">{cadet.name}</td>
                  <td><div className="rank-pip">{cadet.rank}</div></td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      {STATUS_OPTS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => toggle(cadet.id, opt.key)}
                          className={`w-9 h-9 font-mono text-xs font-bold border-2 rounded-sm transition-all duration-150
                            ${cadet.status === opt.key ? opt.color : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AttendancePage;

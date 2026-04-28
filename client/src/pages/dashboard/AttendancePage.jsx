import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';

const SESSION_TYPES = ['PARADE', 'PT', 'CAMP', 'NCC_DAY', 'CLASSIFIED'];

const DEMO_CADETS = [
  { id: '1', reg: 'CG21SDA001', name: 'Yash Tiwari',  rank: 'SUO', status: 'PRESENT' },
  { id: '2', reg: 'CG21SDA002', name: 'Rahul Sharma', rank: 'JUO', status: 'PRESENT' },
  { id: '3', reg: 'CG21SDA003', name: 'Aman Verma',   rank: 'SGT', status: 'ABSENT'  },
  { id: '4', reg: 'CG21SDA004', name: 'Vikash Singh', rank: 'CPL', status: 'LEAVE'   },
  { id: '5', reg: 'CG21SDA005', name: 'Riya Gupta',   rank: 'CDT', status: 'PRESENT' },
];

const STATUS_OPTS = [
  { key: 'PRESENT', label: 'P', color: 'bg-emerald-500 border-emerald-500 text-white' },
  { key: 'ABSENT',  label: 'A', color: 'bg-red-500 border-red-500 text-white' },
  { key: 'LEAVE',   label: 'L', color: 'bg-amber-500 border-amber-500 text-white' },
];

const AttendancePage = () => {
  const [sessionType, setType]      = useState('PARADE');
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [cadets, setCadets]         = useState(DEMO_CADETS);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id, status) => {
    setCadets(cs => cs.map(c => c.id === id ? { ...c, status } : c));
  };

  const markAll = (status) => {
    setCadets(cs => cs.map(c => ({ ...c, status })));
    toast.success(`All cadets marked ${status}`);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000)); // simulate API
    toast.success('Attendance session submitted and logged.');
    setSubmitting(false);
  };

  const present = cadets.filter(c => c.status === 'PRESENT').length;
  const absent  = cadets.filter(c => c.status === 'ABSENT').length;
  const leave   = cadets.filter(c => c.status === 'LEAVE').length;

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
          <button onClick={() => markAll('PRESENT')} className="btn-ghost text-xs">Mark All P</button>
          <button onClick={() => markAll('ABSENT')}  className="btn-ghost text-xs">Mark All A</button>
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

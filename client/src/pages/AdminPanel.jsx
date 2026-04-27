/**
 * AdminPanel.jsx — ANO-only management panel
 * - Add / edit cadets
 * - Add achievements
 * - Create SUO accounts
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams }             from 'react-router-dom';
import { cadetService, achievementService } from '../services/services';
import api                             from '../services/api';
import { Settings, UserPlus, Award, Users, X, Check } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast          from 'react-hot-toast';

const RANKS = ['Cadet', 'L/Cpl', 'Cpl', 'Sgt', 'JUO', 'SUO'];
const WINGS = ['SD', 'SW'];
const YEARS = [1, 2, 3];
const ACH_TYPES   = ['Camp', 'Certificate', 'Competition', 'Award', 'Other'];
const ACH_LEVELS  = ['School', 'District', 'State', 'National', 'International'];

// ── Tab navigation ───────────────────────────────────────────────────────────
const tabs = [
  { id: 'cadets',       label: 'Manage Cadets',   icon: <Users size={14} /> },
  { id: 'achievements', label: 'Add Achievement',  icon: <Award size={14} /> },
  { id: 'accounts',     label: 'User Accounts',    icon: <UserPlus size={14} /> },
];

// ── Cadet Form ───────────────────────────────────────────────────────────────
const CadetForm = ({ onSaved }) => {
  const [form, setForm] = useState({
    name: '', regNo: '', wing: 'SD', rank: 'Cadet', year: 1,
    phone: '', email: '',
  });
  const [photo,      setPhoto]      = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      await cadetService.create(fd);
      toast.success(`Cadet ${form.name} registered`);
      setForm({ name: '', regNo: '', wing: 'SD', rank: 'Cadet', year: 1, phone: '', email: '' });
      setPhoto(null);
      onSaved?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="text-sm font-semibold text-[#e8e4dc] mb-5 flex items-center gap-2">
        <UserPlus size={14} className="text-[#4a5240]" /> Register New Cadet
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Full Name *</label>
          <input value={form.name} onChange={e => setField('name', e.target.value)}
            className="input text-sm" placeholder="Arjun Mehta" required />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Reg. Number *</label>
          <input value={form.regNo} onChange={e => setField('regNo', e.target.value)}
            className="input text-sm font-mono" placeholder="NCC/2024/SD/001" required />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Wing *</label>
          <select value={form.wing} onChange={e => setField('wing', e.target.value)} className="input text-sm">
            {WINGS.map(w => <option key={w} value={w}>{w} — {w === 'SD' ? 'Senior Division (Boys)' : 'Senior Wing (Girls)'}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Rank *</label>
          <select value={form.rank} onChange={e => setField('rank', e.target.value)} className="input text-sm">
            {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Year *</label>
          <select value={form.year} onChange={e => setField('year', Number(e.target.value))} className="input text-sm">
            {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Phone</label>
          <input value={form.phone} onChange={e => setField('phone', e.target.value)}
            className="input text-sm" placeholder="9876543210" maxLength={10} />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
            className="input text-sm" placeholder="cadet@college.edu" />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Photo</label>
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept="image/*"
              onChange={e => setPhoto(e.target.files[0])} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="btn-ghost text-xs py-2 px-3 flex-1">
              {photo ? `✓ ${photo.name}` : 'Choose Photo (optional)'}
            </button>
            {photo && <button type="button" onClick={() => setPhoto(null)} className="text-red-400 text-xs"><X size={14} /></button>}
          </div>
          <p className="text-[10px] text-[#4a5240] mt-1">JPG/PNG, max 5MB. Face photo recommended.</p>
        </div>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 text-sm">
        {submitting ? <><div className="w-4 h-4 border-2 border-[#6b7560] border-t-[#c8b87a] rounded-full animate-spin" /> Registering...</> : 'Register Cadet'}
      </button>
    </form>
  );
};

// ── Achievement Form ──────────────────────────────────────────────────────────
const AchievementForm = ({ cadets }) => {
  const [form, setForm] = useState({
    cadetId: '', title: '', type: 'Camp', level: 'State',
    description: '', date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cadetId) { toast.error('Select a cadet'); return; }
    setSubmitting(true);
    try {
      await achievementService.add(form);
      toast.success('Achievement added');
      setForm(f => ({ ...f, cadetId: '', title: '', description: '' }));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="text-sm font-semibold text-[#e8e4dc] mb-5 flex items-center gap-2">
        <Award size={14} className="text-[#c8b87a]" /> Add Achievement
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Cadet *</label>
          <select value={form.cadetId} onChange={e => setField('cadetId', e.target.value)} className="input text-sm" required>
            <option value="">Select Cadet...</option>
            {cadets.map(c => <option key={c._id} value={c._id}>{c.name} ({c.rank} · {c.wing})</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Achievement Title *</label>
          <input value={form.title} onChange={e => setField('title', e.target.value)}
            className="input text-sm" placeholder="Republic Day Camp 2024" required maxLength={120} />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Type</label>
          <select value={form.type} onChange={e => setField('type', e.target.value)} className="input text-sm">
            {ACH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Level</label>
          <select value={form.level} onChange={e => setField('level', e.target.value)} className="input text-sm">
            {ACH_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Date *</label>
          <input type="date" value={form.date} onChange={e => setField('date', e.target.value)} className="input text-sm" required />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Description</label>
          <input value={form.description} onChange={e => setField('description', e.target.value)}
            className="input text-sm" placeholder="Optional details..." maxLength={400} />
        </div>
      </div>
      <button type="submit" disabled={submitting} className="btn-primary text-sm flex items-center gap-2">
        {submitting ? 'Adding...' : <><Check size={14} /> Add Achievement</>}
      </button>
    </form>
  );
};

// ── Create User Account ───────────────────────────────────────────────────────
const UserAccountForm = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SUO' });
  const [submitting, setSubmitting] = useState(false);
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', form);
      toast.success(`${form.role} account created for ${form.name}`);
      setForm({ name: '', email: '', password: '', role: 'SUO' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6">
      <h3 className="text-sm font-semibold text-[#e8e4dc] mb-5 flex items-center gap-2">
        <UserPlus size={14} className="text-[#4a5240]" /> Create Login Account
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Full Name *</label>
          <input value={form.name} onChange={e => setField('name', e.target.value)}
            className="input text-sm" required placeholder="Priya Sharma" />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Email *</label>
          <input type="email" value={form.email} onChange={e => setField('email', e.target.value)}
            className="input text-sm" required placeholder="suo@unit.ncc" />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Password *</label>
          <input type="password" value={form.password} onChange={e => setField('password', e.target.value)}
            className="input text-sm" required minLength={8} placeholder="Min 8 characters" />
        </div>
        <div>
          <label className="text-[10px] text-[#6b7560] uppercase tracking-wider block mb-1">Role</label>
          <select value={form.role} onChange={e => setField('role', e.target.value)} className="input text-sm">
            <option value="SUO">SUO (Limited access)</option>
            <option value="ANO">ANO (Full access)</option>
          </select>
        </div>
      </div>
      <div className="bg-[#1a2000] border border-[#3a5000] rounded p-3 mb-4 text-xs text-[#8a9080]">
        ⚠️ Share credentials securely with the user. Instruct them to change password after first login.
      </div>
      <button type="submit" disabled={submitting} className="btn-primary text-sm">
        {submitting ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
};

// ── Main Admin Panel ──────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('cadets');
  const [cadets,    setCadets]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [searchParams]            = useSearchParams();

  const loadCadets = async () => {
    try {
      const res = await cadetService.getAll({});
      setCadets(res.data.cadets);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    loadCadets();
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#e8e4dc] font-serif flex items-center gap-3">
          <Settings size={22} className="text-[#4a5240]" /> Admin Panel
        </h1>
        <p className="text-[#6b7560] text-sm mt-1">ANO-only management tools</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded border font-medium transition-all
              ${activeTab === t.id
                ? 'bg-[#4a5240] text-[#e8e4dc] border-[#6b7560]'
                : 'btn-ghost'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : (
        <>
          {activeTab === 'cadets'       && <CadetForm onSaved={loadCadets} />}
          {activeTab === 'achievements' && <AchievementForm cadets={cadets} />}
          {activeTab === 'accounts'     && <UserAccountForm />}
        </>
      )}
    </div>
  );
};

export default AdminPanel;

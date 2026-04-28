/**
 * GodPanelUsers.jsx — User management panel for God Mode
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import godApi from '../../services/godApi';

const GodPanelUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cadet' });

  const fetch = () => godApi.get('/users').then(r => { if (r.data.success) setUsers(r.data.users); }).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await godApi.post('/users', form);
      toast.success('User created'); setShowCreate(false); setForm({ name: '', email: '', password: '', role: 'cadet' }); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (prompt(`Type DELETE to remove user "${name}"`) !== 'DELETE') return;
    try { await godApi.delete(`/users/${id}`); toast.success('User deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  const handleResetPw = async (id) => {
    const pw = prompt('Enter new password (min 6 chars):');
    if (!pw || pw.length < 6) return;
    try { await godApi.post(`/users/${id}/reset-password`, { newPassword: pw }); toast.success('Password reset'); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl text-parchment tracking-wide">User Management</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-red-900/40 text-red-300 font-mono text-xs uppercase tracking-wider rounded-sm border border-red-500/20 hover:bg-red-900/60 transition-all">
          {showCreate ? '✕ Cancel' : '+ Create User'}
        </button>
      </div>

      {showCreate && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleCreate} className="glass p-5 mb-6 grid grid-cols-2 gap-4">
          <input required placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-black/40 border border-white/10 text-parchment font-mono text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-red-500/50" />
          <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-black/40 border border-white/10 text-parchment font-mono text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-red-500/50" />
          <input required placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-black/40 border border-white/10 text-parchment font-mono text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-red-500/50" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="bg-black/40 border border-white/10 text-parchment font-mono text-sm px-3 py-2 rounded-sm">
            <option value="cadet">Cadet</option><option value="SUO">SUO</option><option value="ANO">ANO</option>
          </select>
          <button type="submit" className="col-span-2 py-2 bg-emerald-900/40 text-emerald-300 font-mono text-xs uppercase border border-emerald-500/20 rounded-sm hover:bg-emerald-900/60">Create</button>
        </motion.form>
      )}

      <div className="glass overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30 font-mono text-sm">Loading...</div> : (
          <div className="divide-y divide-white/5">
            {users.map(u => (
              <div key={u._id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-sm bg-red-900/30 border border-red-500/20 flex items-center justify-center text-red-300 font-display text-sm">{u.name?.[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-parchment text-sm font-semibold truncate">{u.name}</div>
                  <div className="font-mono text-2xs text-white/40">{u.email}</div>
                </div>
                <span className="badge font-mono text-2xs bg-red-900/40 text-red-300 shrink-0">{u.role}</span>
                <button onClick={() => handleResetPw(u._id)} className="font-mono text-2xs text-amber-400/60 hover:text-amber-300 transition-colors">RESET PW</button>
                <button onClick={() => handleDelete(u._id, u.name)} className="font-mono text-2xs text-red-400/60 hover:text-red-300 transition-colors">DELETE</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default GodPanelUsers;

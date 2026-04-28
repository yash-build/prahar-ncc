/**
 * GodPanelCadets.jsx — Cadet management panel for God Mode
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import godApi from '../../services/godApi';

const GodPanelCadets = () => {
  const [cadets, setCadets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = () => godApi.get('/cadets').then(r => { if (r.data.success) setCadets(r.data.cadets); }).finally(() => setLoading(false));
  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (prompt(`Type CONFIRM to delete "${name}"`) !== 'CONFIRM') return;
    try { await godApi.delete(`/cadets/${id}`); toast.success('Cadet deleted'); fetch(); } catch { toast.error('Failed'); }
  };

  const handleRank = async (id, rank) => {
    try { await godApi.put(`/cadets/${id}`, { rank }); toast.success(`Rank → ${rank}`); fetch(); } catch { toast.error('Failed'); }
  };

  const handlePassedOut = async (id) => {
    if (prompt('Type CONFIRM to mark passed out') !== 'CONFIRM') return;
    try { await godApi.post(`/cadets/${id}/passed-out`); toast.success('Marked passed out'); fetch(); } catch { toast.error('Failed'); }
  };

  const filtered = cadets.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.serviceNumber?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl text-parchment tracking-wide">Cadet Control</h2>
        <span className="font-mono text-xs text-white/30">{cadets.length} total</span>
      </div>

      <input placeholder="Search by name or service number..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full bg-black/40 border border-white/10 text-parchment font-mono text-sm px-4 py-2 rounded-sm mb-4 focus:outline-none focus:border-red-500/50" />

      <div className="glass overflow-hidden">
        {loading ? <div className="p-8 text-center text-white/30 font-mono text-sm">Loading...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/10 text-white/30 font-mono text-2xs uppercase">
                <th className="px-4 py-3">Service No</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Wing</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(c => (
                  <tr key={c._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-red-400/60">{c.serviceNumber}</td>
                    <td className="px-4 py-2 text-parchment text-sm font-semibold">{c.name}</td>
                    <td className="px-4 py-2">
                      <select value={c.rank} onChange={e => handleRank(c._id, e.target.value)} className="bg-transparent border border-white/10 text-parchment font-mono text-2xs px-2 py-1 rounded-sm cursor-pointer">
                        {['CADET','LCPL','CPL','SGT','JUO','SUO'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-white/40">{c.wing}</td>
                    <td className="px-4 py-2 font-mono text-xs text-white/40">{c.yearOfStudy}</td>
                    <td className="px-4 py-2"><span className={`font-mono text-2xs px-2 py-0.5 rounded ${c.status === 'ACTIVE' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>{c.status}</span></td>
                    <td className="px-4 py-2 text-right flex gap-2 justify-end">
                      {c.status === 'ACTIVE' && <button onClick={() => handlePassedOut(c._id)} className="font-mono text-2xs text-amber-400/60 hover:text-amber-300">PASS OUT</button>}
                      <button onClick={() => handleDelete(c._id, c.name)} className="font-mono text-2xs text-red-400/60 hover:text-red-300">DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default GodPanelCadets;

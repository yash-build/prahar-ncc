import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const MyProfilePage = () => {
  const { user, token, setAuth } = useAuthStore();
  const [cadet, setCadet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Find cadet record linked to logged-in user
    api.get('/cadets').then(r => {
      if (r.data.success) {
        const match = r.data.cadets.find(c =>
          c.email === user?.email || c.userId === user?._id
        );
        setCadet(match || null);
        if (match) setMessage(match.yearbookMessage || '');
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleSaveMessage = async () => {
    if (!cadet) return;
    setSaving(true);
    try {
      await api.put(`/cadets/${cadet._id}`, { yearbookMessage: message });
      setCadet({ ...cadet, yearbookMessage: message });
      setEditing(false);
    } catch(e) {} finally { setSaving(false); }
  };

  const RANK_COLOR = { SUO: '#d4af37', JUO: '#c2b280', SGT: '#4a5a48', CPL: '#6b7a69', LCPL: '#6b7a69', CADET: '#a8b8a5' };

  return (
    <div className="page-shell">
      <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">PORTAL</div>
      <h1 className="section-title mb-6">My Profile</h1>

      {loading ? (
        <div className="card p-8"><div className="skeleton h-64" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Photo & Rank */}
          <div className="card p-6 flex flex-col items-center text-center gap-4">
            <div className="w-28 h-28 rounded-sm bg-gradient-to-br from-olive/10 to-khaki/10 border border-olive/10 flex items-center justify-center overflow-hidden">
              {cadet?.photoUrl
                ? <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover" />
                : <span className="font-display text-5xl text-olive/20">{user?.name?.[0] || '?'}</span>
              }
            </div>
            <div>
              <h2 className="font-heading font-bold text-olive-dark text-xl">{user?.name}</h2>
              <div className="font-mono text-xs text-olive-muted">{user?.email}</div>
            </div>
            {cadet && (
              <div className="flex gap-2 flex-wrap justify-center">
                <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded-sm border"
                  style={{ background: `${RANK_COLOR[cadet.rank]}25`, color: RANK_COLOR[cadet.rank], borderColor: `${RANK_COLOR[cadet.rank]}40` }}>
                  {cadet.rank}
                </span>
                <span className="badge-olive">{cadet.wing} Wing</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-2 card p-6">
            <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide border-b border-stone-100 pb-4 mb-5">Cadet Record</h3>
            {cadet ? (
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                {[
                  { label: 'Service No.', value: cadet.serviceNumber },
                  { label: 'Year of Study', value: `Year ${cadet.yearOfStudy}` },
                  { label: 'Batch Year', value: cadet.batchYear },
                  { label: 'Gender', value: cadet.gender === 'M' ? 'Male' : 'Female' },
                  { label: 'Phone', value: cadet.phone },
                  { label: 'Email', value: cadet.email },
                ].map(f => (
                  <div key={f.label}>
                    <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-0.5">{f.label}</div>
                    <div className="font-heading font-semibold text-olive-dark">{f.value || '—'}</div>
                  </div>
                ))}

                <div className="col-span-2 mt-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider">Yearbook Message</div>
                    {!editing && (
                      <button onClick={() => setEditing(true)} className="font-mono text-2xs text-khaki-dark hover:text-olive-dark transition-colors uppercase">Edit</button>
                    )}
                  </div>
                  {editing ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="input resize-none h-20 text-sm"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="A short message for the yearbook..."
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditing(false)} className="btn-ghost text-xs">Cancel</button>
                        <button onClick={handleSaveMessage} disabled={saving} className="btn-primary text-xs">{saving ? 'Saving...' : 'Save Message'}</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-olive-muted italic text-sm border-l-2 border-khaki/40 pl-3">
                      {cadet.yearbookMessage || 'No message set. Click Edit to add one.'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-title">Cadet record not linked</div>
                <div className="empty-state-sub">Contact your ANO to link your user account to a cadet record.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default MyProfilePage;

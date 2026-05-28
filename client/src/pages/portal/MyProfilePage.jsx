import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const MyProfilePage = () => {
  const { user } = useAuthStore();
  const [cadet, setCadet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  // Editable fields
  const [formData, setFormData] = useState({
    contactPhone: '',
    contactEmail: '',
    yearbookMessage: '',
  });

  useEffect(() => {
    api.get('/cadets/my').then(r => {
      if (r.data.success) {
        setCadet(r.data.cadet);
        setFormData({
          contactPhone: r.data.cadet.contactPhone || '',
          contactEmail: r.data.cadet.contactEmail || '',
          yearbookMessage: r.data.cadet.yearbookMessage || '',
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/cadets/my', formData);
      if (data.success) {
        setCadet(data.cadet);
        setEditing(false);
        toast.success('Profile updated!');
      }
    } catch (e) { toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return toast.error('Only JPEG, PNG, WebP allowed');
    }
    if (file.size > 10 * 1024 * 1024) {
      return toast.error('Photo must be under 10MB');
    }
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.put('/cadets/my', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setCadet(data.cadet);
        toast.success('Photo updated!');
      }
    } catch { toast.error('Failed to upload photo'); }
    finally { setUploadingPhoto(false); }
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
          {/* ─── Photo & Identity Card ─── */}
          <div className="card p-6 flex flex-col items-center text-center gap-4">
            {/* Photo with upload overlay */}
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative w-36 h-44 rounded-sm bg-gradient-to-br from-olive/10 to-khaki/10 border-2 border-dashed border-olive/20 
                         flex items-center justify-center overflow-hidden cursor-pointer group hover:border-olive/40 transition-all"
            >
              {uploadingPhoto ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="w-6 h-6 border-2 border-olive/30 border-t-olive rounded-full animate-spin" />
                  <span className="font-mono text-2xs text-olive-muted">Uploading...</span>
                </div>
              ) : cadet?.photoUrl ? (
                <>
                  <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-lg">📷</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="font-display text-5xl text-olive/20">{user?.name?.[0] || '?'}</span>
                  <span className="font-mono text-2xs text-olive-muted/60">Click to upload photo</span>
                </div>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {cadet?.photoUrl && !uploadingPhoto && (
              <span className="font-mono text-2xs text-green-600">✓ Photo uploaded · Click to change</span>
            )}

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
                {cadet.isHonorRoll && <span className="font-mono text-2xs text-gold font-bold">✦ Honor Roll</span>}
              </div>
            )}
          </div>

          {/* ─── Details & Editable Fields ─── */}
          <div className="md:col-span-2 space-y-6">
            {/* Read-only record */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide border-b border-stone-100 pb-4 mb-5">Cadet Record</h3>
              {cadet ? (
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {[
                    { label: 'Service No.', value: cadet.serviceNumber },
                    { label: 'Rank', value: cadet.rank },
                    { label: 'Wing', value: `${cadet.wing} Wing` },
                    { label: 'Year of Study', value: `Year ${cadet.yearOfStudy}` },
                    { label: 'Batch Year', value: cadet.batchYear },
                    { label: 'Battalion', value: cadet.unitId?.name || '17 CG BN NCC' },
                    { label: 'Attendance', value: `${cadet.attendancePercentage}% (${cadet.totalPresent}P / ${cadet.totalAbsent}A / ${cadet.totalLeave}L)` },
                    { label: 'Status', value: cadet.status },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-0.5">{f.label}</div>
                      <div className="font-heading font-semibold text-olive-dark">{f.value || '—'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">👤</div>
                  <div className="empty-state-title">Cadet record not linked</div>
                  <div className="empty-state-sub">Contact your ANO to link your user account to a cadet record.</div>
                </div>
              )}
            </div>

            {/* Editable personal info */}
            {cadet && (
              <div className="card p-6">
                <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-5">
                  <div>
                    <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide">Personal Details</h3>
                    <p className="font-mono text-2xs text-olive-muted mt-0.5">You can update these yourself</p>
                  </div>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="btn-ghost text-xs py-1.5 px-4">Edit</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(false); setFormData({ contactPhone: cadet.contactPhone || '', contactEmail: cadet.contactEmail || '', yearbookMessage: cadet.yearbookMessage || '' }); }}
                        className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
                      <button onClick={handleSaveProfile} disabled={saving} className="btn-primary text-xs py-1.5 px-4">
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label">WhatsApp / Phone</label>
                        <input type="tel" className="input" placeholder="e.g. 9876543210"
                          value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                      </div>
                      <div>
                        <label className="label">Personal Email</label>
                        <input type="email" className="input" placeholder="e.g. myname@gmail.com"
                          value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Yearbook Message <span className="text-olive-muted">(max 160 chars)</span></label>
                      <textarea rows={3} className="input resize-none text-sm" maxLength={160}
                        placeholder='e.g. "Discipline before desire. Jai Hind!"'
                        value={formData.yearbookMessage} onChange={e => setFormData({ ...formData, yearbookMessage: e.target.value })} />
                      <div className="font-mono text-2xs text-olive-muted text-right mt-1">
                        {formData.yearbookMessage.length}/160
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-0.5">Phone</div>
                      <div className="font-heading font-semibold text-olive-dark">{cadet.contactPhone || <span className="text-olive-muted italic font-normal">Not set — click Edit</span>}</div>
                    </div>
                    <div>
                      <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-0.5">Personal Email</div>
                      <div className="font-heading font-semibold text-olive-dark">{cadet.contactEmail || <span className="text-olive-muted italic font-normal">Not set</span>}</div>
                    </div>
                    <div className="md:col-span-2">
                      <div className="font-mono text-2xs text-olive-muted uppercase tracking-wider mb-0.5">Yearbook Message</div>
                      {cadet.yearbookMessage ? (
                        <p className="text-olive-dark italic text-sm border-l-2 border-khaki/40 pl-3">"{cadet.yearbookMessage}"</p>
                      ) : (
                        <p className="text-olive-muted italic text-sm">No message set — click Edit to add one</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default MyProfilePage;

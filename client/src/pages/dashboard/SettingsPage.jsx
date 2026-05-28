import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import AnimatedPage from '../../components/layout/AnimatedPage';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', password: '' });
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState(null);
  const [statsData, setStatsData] = useState({});
  const [visData, setVisData] = useState({});

  // ANO Profile state
  const [anoProfile, setAnoProfile] = useState({ name: '', title: 'LT. / CAPT.', designation: 'Associate NCC Officer', quote: '', photo: '' });
  const [anoPhotoFile, setAnoPhotoFile] = useState(null);
  const [anoPhotoPreview, setAnoPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const anoPhotoInputRef = useRef(null);

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data?.success) {
        setSettings(r.data.settings);
        setStatsData(r.data.settings.stats || {});
        setVisData(r.data.settings.visibility || {});
        if (r.data.settings.anoProfile) {
          setAnoProfile({
            name: r.data.settings.anoProfile.name || '',
            title: r.data.settings.anoProfile.title || 'LT. / CAPT.',
            designation: r.data.settings.anoProfile.designation || 'Associate NCC Officer',
            quote: r.data.settings.anoProfile.quote || '',
            photo: r.data.settings.anoProfile.photo || ''
          });
          if (r.data.settings.anoProfile.photo) {
            setAnoPhotoPreview(r.data.settings.anoProfile.photo);
          }
        }
      }
    });
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', formData);
      if (data.success) {
        toast.success(data.message);
        useAuthStore.getState().setAuth({ ...user, name: data.user.name, email: data.user.email }, useAuthStore.getState().token);
        setEditMode(false);
      }
    } catch (err) { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleSaveSettings = async () => {
    try {
      const { data } = await api.put('/settings', { stats: statsData, visibility: visData, anoProfile });
      if (data.success) {
        toast.success('Public website settings saved');
        setSettings(data.settings);
      }
    } catch { toast.error('Failed to save settings'); }
  };

  const handleAnoPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, WebP images allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Photo must be under 10MB');
      return;
    }
    setAnoPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAnoPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUploadAnoPhoto = async () => {
    if (!anoPhotoFile) return toast.error('Select a photo first');
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', anoPhotoFile);
      const { data } = await api.post('/settings/ano-photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success('ANO photo uploaded successfully!');
        setAnoProfile(prev => ({ ...prev, photo: data.photoUrl }));
        setAnoPhotoPreview(data.photoUrl);
        setAnoPhotoFile(null);
        setSettings(data.settings);
      }
    } catch (err) { toast.error('Failed to upload photo'); }
    finally { setUploadingPhoto(false); }
  };

  const handleReset = async () => {
    const confirm = prompt('Type RESET to confirm:');
    if (confirm !== 'RESET') {
      if (confirm) toast.error('Confirmation failed');
      return;
    }
    try {
      const { data } = await api.post('/batch/reset');
      if (data.success) toast.success('System reset successfully. All data wiped.');
    } catch (e) { toast.error('Failed to reset system'); }
  };

  return (
    <AnimatedPage className="page-shell max-w-5xl space-y-6">
      <div>
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">CONFIGURATION</div>
        <h1 className="section-title">System Settings</h1>
      </div>

      {/* ═══ ANO PROFILE SECTION ═══════════════════════════ */}
      <div className="card p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide">ANO Public Profile</h3>
            <p className="font-mono text-2xs text-olive-muted mt-0.5">This appears on the public landing page</p>
          </div>
          <button onClick={handleSaveSettings} className="btn-primary text-xs py-1.5 px-4">Save All</button>
        </div>

        <div className="grid md:grid-cols-[240px_1fr] gap-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => anoPhotoInputRef.current?.click()}
              className="relative w-48 h-60 rounded-sm bg-gradient-to-br from-olive/10 to-khaki/8 border-2 border-dashed border-khaki/30 
                         flex items-center justify-center cursor-pointer overflow-hidden group hover:border-gold/60 transition-all duration-300"
            >
              {anoPhotoPreview ? (
                <>
                  <img src={anoPhotoPreview} alt="ANO Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="font-mono text-xs text-white tracking-wider">CHANGE PHOTO</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-4">
                  <span className="text-4xl opacity-30">📷</span>
                  <span className="font-mono text-2xs text-olive-muted tracking-wider">CLICK TO UPLOAD<br/>ANO PHOTO</span>
                  <span className="font-mono text-2xs text-olive-muted/50">3:4 ratio recommended</span>
                </div>
              )}
            </div>
            <input
              ref={anoPhotoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAnoPhotoSelect}
              className="hidden"
            />
            {anoPhotoFile && (
              <button onClick={handleUploadAnoPhoto} disabled={uploadingPhoto}
                className="btn-primary text-xs py-1.5 px-6 w-full disabled:opacity-50">
                {uploadingPhoto ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : 'Upload Photo'}
              </button>
            )}
            {anoPhotoPreview && !anoPhotoFile && (
              <span className="font-mono text-2xs text-green-600">✓ Photo saved</span>
            )}
          </div>

          {/* ANO Info Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Title / Rank Prefix</label>
                <input type="text" className="input text-sm" placeholder="e.g. LT. / CAPT."
                  value={anoProfile.title} onChange={e => setAnoProfile({ ...anoProfile, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Designation</label>
                <input type="text" className="input text-sm" placeholder="e.g. Associate NCC Officer"
                  value={anoProfile.designation} onChange={e => setAnoProfile({ ...anoProfile, designation: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Full Name</label>
              <input type="text" className="input text-sm" placeholder="e.g. Lt Yash Tiwari"
                value={anoProfile.name} onChange={e => setAnoProfile({ ...anoProfile, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Inspirational Quote</label>
              <textarea rows={3} className="input text-sm resize-none" placeholder="A quote that appears below your name on the landing page..."
                value={anoProfile.quote} onChange={e => setAnoProfile({ ...anoProfile, quote: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ GRID: PROFILE + SITE CONFIG ═══════════════════ */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Profile Column */}
        <div className="space-y-6">
          <div className="card p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide">My Profile</h3>
              <button onClick={() => setEditMode(!editMode)} className="btn-ghost text-xs py-1 px-3">
                {editMode ? 'Cancel' : 'Edit Details'}
              </button>
            </div>
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                <div>
                  <label className="label">Name</label>
                  <input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="label">New Password (leave blank to keep current)</label>
                  <input type="password" className="input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full mt-2">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between py-2 border-b border-stone-50"><span className="font-mono text-xs text-olive-muted uppercase tracking-wider">Name</span><span className="font-heading font-semibold text-olive-dark">{user?.name}</span></div>
                <div className="flex justify-between py-2 border-b border-stone-50"><span className="font-mono text-xs text-olive-muted uppercase tracking-wider">Email</span><span className="font-heading font-semibold text-olive-dark">{user?.email}</span></div>
                <div className="flex justify-between py-2 border-b border-stone-50"><span className="font-mono text-xs text-olive-muted uppercase tracking-wider">Role</span><span className="font-heading font-semibold text-olive-dark">{user?.role}</span></div>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-heading font-bold text-red-800 uppercase tracking-wide border-b border-red-100 pb-4 mb-5">Danger Zone</h3>
            <p className="text-red-600 text-xs font-mono mb-4">Deletes all cadets, notices, and attendance records. Cannot be undone.</p>
            <button onClick={handleReset} className="btn-danger text-xs px-4 py-2 w-full">Reset All Data</button>
          </div>
        </div>

        {/* Public Site Configuration Column */}
        {settings && (
          <div className="card p-6 space-y-5 h-fit">
            <div className="flex justify-between items-center border-b border-stone-100 pb-4">
              <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide">Public Site Config</h3>
              <button onClick={handleSaveSettings} className="btn-primary text-xs py-1 px-3">Save Config</button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-mono text-xs text-olive-muted uppercase tracking-wider">Site Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Enrolled Cadets</label>
                  <input type="text" className="input text-sm py-1" value={statsData.cadets || ''} onChange={e => setStatsData({...statsData, cadets: e.target.value})} />
                </div>
                <div>
                  <label className="label">Data Accuracy</label>
                  <input type="text" className="input text-sm py-1" value={statsData.accuracy || ''} onChange={e => setStatsData({...statsData, accuracy: e.target.value})} />
                </div>
                <div>
                  <label className="label">Wings Managed</label>
                  <input type="text" className="input text-sm py-1" value={statsData.wings || ''} onChange={e => setStatsData({...statsData, wings: e.target.value})} />
                </div>
                <div>
                  <label className="label">System Uptime</label>
                  <input type="text" className="input text-sm py-1" value={statsData.uptime || ''} onChange={e => setStatsData({...statsData, uptime: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Battalion Name</label>
                  <input type="text" className="input text-sm py-1" value={statsData.battalion || ''} onChange={e => setStatsData({...statsData, battalion: e.target.value})} />
                </div>
              </div>

              <h4 className="font-mono text-xs text-olive-muted uppercase tracking-wider pt-4 border-t border-stone-100">Page Visibility</h4>
              <div className="space-y-2">
                {['gallery', 'achievements', 'notices', 'yearbook'].map(page => (
                  <div key={page} className="flex items-center justify-between p-2 hover:bg-stone-50 rounded">
                    <span className="font-heading text-sm text-olive-dark capitalize">{page} Page</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={visData[page]} onChange={e => setVisData({...visData, [page]: e.target.checked})} />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-olive-dark"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default SettingsPage;

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data?.success) {
        setSettings(r.data.settings);
        setStatsData(r.data.settings.stats);
        setVisData(r.data.settings.visibility);
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
      const { data } = await api.put('/settings', { stats: statsData, visibility: visData });
      if (data.success) {
        toast.success('Public website settings saved');
        setSettings(data.settings);
      }
    } catch { toast.error('Failed to save settings'); }
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
    <AnimatedPage className="page-shell max-w-4xl grid md:grid-cols-2 gap-6 items-start">
      <div className="col-span-full">
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">CONFIGURATION</div>
        <h1 className="section-title">System Settings</h1>
      </div>

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
    </AnimatedPage>
  );
};

export default SettingsPage;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';
import useAuthStore from '../../store/authStore';

const CATEGORIES = ['ALL', 'CAMP', 'PARADE', 'EVENT', 'TRAINING', 'OTHER'];

const GalleryManage = () => {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [form, setForm] = useState({ caption: '', category: 'CAMP', isPublic: true });
  const fileRef = useRef(null);
  const { user } = useAuthStore();
  const isANO = user?.role === 'ANO';

  const fetchItems = () => {
    setLoading(true);
    api.get('/gallery')
      .then(r => { if (r.data?.success) setItems(r.data.items || []); })
      .catch(() => toast.error('Failed to load gallery'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview({ file, url: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!preview) { toast.error('Select an image first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', preview.file);
      fd.append('caption', form.caption);
      fd.append('category', form.category);
      fd.append('isPublic', form.isPublic);
      const { data } = await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) {
        toast.success('Photo uploaded successfully');
        setShowForm(false);
        setPreview(null);
        setForm({ caption: '', category: 'CAMP', isPublic: true });
        fetchItems();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed — check Cloudinary credentials');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this photo from gallery?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Photo removed');
      setItems(prev => prev.filter(x => x._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleTogglePublic = async (item) => {
    try {
      const { data } = await api.put(`/gallery/${item._id}`, { isPublic: !item.isPublic });
      if (data.success) {
        setItems(prev => prev.map(x => x._id === item._id ? { ...x, isPublic: !item.isPublic } : x));
        toast.success(item.isPublic ? 'Hidden from public' : 'Published to public gallery');
      }
    } catch { toast.error('Update failed'); }
  };

  const filtered = filter === 'ALL' ? items : items.filter(i => i.category === filter);

  return (
    <AnimatedPage className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">MEDIA</div>
          <h1 className="section-title">Gallery Management</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">{items.length} photos · {items.filter(i => i.isPublic).length} public</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Upload Photo'}
        </button>
      </div>

      {/* Upload Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-6">
            <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide mb-5">Upload New Photo</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-olive/20 rounded-sm p-6 text-center cursor-pointer hover:border-khaki/40 transition-colors"
              >
                {preview
                  ? <img src={preview.url} alt="preview" className="max-h-48 mx-auto rounded object-cover" />
                  : <div className="py-4">
                      <div className="text-3xl mb-2">🖼️</div>
                      <div className="font-mono text-xs text-olive-muted">Click to select image (JPG, PNG, WebP)</div>
                    </div>
                }
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Caption</label>
                  <input className="input" placeholder="e.g. Republic Day Parade 2024" value={form.caption}
                    onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input bg-white" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="isPublic" checked={form.isPublic}
                  onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))}
                  className="w-4 h-4 accent-olive" />
                <label htmlFor="isPublic" className="font-mono text-xs text-olive-muted cursor-pointer">
                  Publish to public gallery immediately
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="btn-primary disabled:opacity-50">
                  {uploading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-khaki/30 border-t-khaki rounded-full animate-spin" />Uploading...</span> : '↑ Upload'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setPreview(null); }} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`font-mono text-2xs uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all
              ${filter === c ? 'bg-olive-dark text-parchment border-olive-dark' : 'bg-white text-olive-muted border-stone-200 hover:border-olive/30'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card"><div className="skeleton aspect-square" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🖼️</div>
            <div className="empty-state-title">No photos yet</div>
            <div className="empty-state-sub">Upload photos from camps, parades and events.</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => (
            <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }} className="card overflow-hidden group relative">
              <div className="aspect-square bg-olive/5 overflow-hidden">
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="text-4xl opacity-20">🖼️</span></div>
                }
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-semibold text-olive-dark truncate">{item.caption || 'Untitled'}</p>
                    <span className="font-mono text-2xs text-olive-muted">{item.category}</span>
                  </div>
                  <span className={`shrink-0 font-mono text-2xs px-1.5 py-0.5 rounded-sm ${item.isPublic ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-50 text-stone-500 border border-stone-200'}`}>
                    {item.isPublic ? 'Public' : 'Hidden'}
                  </span>
                </div>
              </div>
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button onClick={() => handleTogglePublic(item)}
                  className="px-3 py-1.5 bg-white/90 font-mono text-2xs text-olive-dark rounded-sm hover:bg-white transition-colors">
                  {item.isPublic ? 'Hide' : 'Publish'}
                </button>
                {isANO && (
                  <button onClick={() => handleDelete(item._id)}
                    className="px-3 py-1.5 bg-red-500/90 font-mono text-2xs text-white rounded-sm hover:bg-red-600 transition-colors">
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
};

export default GalleryManage;

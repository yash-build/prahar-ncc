import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AnimatedPage from '../../components/layout/AnimatedPage';
import useAuthStore from '../../store/authStore';

const EVENT_TYPES = ['CAMP', 'PARADE', 'EXAM', 'TRAINING', 'COMPETITION', 'SOCIAL', 'OTHER'];
const STATUS_COLOR = { UPCOMING: 'badge-blue', ONGOING: 'badge-amber', COMPLETED: 'badge-green', CANCELLED: 'badge-red' };
const TYPE_COLOR   = { CAMP: 'badge-olive', PARADE: 'badge-gold', EXAM: 'badge-red', TRAINING: 'badge-blue', COMPETITION: 'badge-green', SOCIAL: 'badge-amber', OTHER: 'badge-olive' };

const EventsPage = () => {
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [form, setForm] = useState({
    title: '', type: 'CAMP', startDate: '', endDate: '', venue: '',
    description: '', isCompulsory: false, coverImage: null
  });
  
  // Gallery Modal State
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuthStore();
  const isANO = user?.role === 'ANO';

  const fetchEvents = () => {
    setLoading(true);
    api.get('/events')
      .then(r => { if (r.data?.success) setEvents(r.data.events || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'coverImage' && val) formData.append('coverImage', val);
        else if (key !== 'coverImage') formData.append(key, val);
      });

      const { data } = await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success('Event created successfully');
        setShowForm(false);
        setForm({ title: '', type: 'CAMP', startDate: '', endDate: '', venue: '', description: '', isCompulsory: false, coverImage: null });
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"? This will also delete all associated gallery photos.`)) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  // Gallery Management Logic
  const openGalleryModal = (ev) => {
    setActiveEvent(ev);
    setGalleryModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (files.length > 10) return toast.error('Max 10 photos per upload allowed.');

    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    setUploadingPhotos(true);
    try {
      const { data } = await api.post(`/events/${activeEvent._id}/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        toast.success(data.message);
        setActiveEvent(prev => ({ ...prev, gallery: data.gallery }));
        setEvents(prev => prev.map(ev => ev._id === activeEvent._id ? { ...ev, gallery: data.gallery } : ev));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Delete this photo from the gallery?')) return;
    try {
      const { data } = await api.delete(`/events/${activeEvent._id}/gallery/${photoId}`);
      if (data.success) {
        toast.success('Photo deleted');
        setActiveEvent(prev => ({ ...prev, gallery: data.gallery }));
        setEvents(prev => prev.map(ev => ev._id === activeEvent._id ? { ...ev, gallery: data.gallery } : ev));
      }
    } catch { toast.error('Failed to delete photo'); }
  };

  const getStatus = (ev) => {
    if (ev.status) return ev.status;
    const now = new Date();
    const start = new Date(ev.startDate);
    const end = ev.endDate ? new Date(ev.endDate) : start;
    if (now < start) return 'UPCOMING';
    if (now > end) return 'COMPLETED';
    return 'ONGOING';
  };

  const filtered = filterStatus === 'ALL' ? events : events.filter(e => getStatus(e) === filterStatus);

  return (
    <AnimatedPage className="page-shell">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-2xs text-olive-muted tracking-military mb-1">CALENDAR</div>
          <h1 className="section-title">Events &amp; Gallery</h1>
          <p className="font-mono text-xs text-olive-muted mt-1">
            Manage upcoming camps and event photo galleries.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Create Event'}
        </button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card p-6">
            <h3 className="font-heading font-bold text-olive-dark uppercase tracking-wide mb-5">New Event</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Event Title</label>
                  <input className="input" required placeholder="e.g. Annual Training Camp 2025" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select className="input bg-white" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" placeholder="e.g. Raipur NCC Camp" value={form.venue}
                    onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input" required value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="label">End Date (optional)</label>
                  <input type="date" className="input" value={form.endDate}
                    onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input h-20 resize-none" placeholder="Details about the event..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              
              <div className="bg-stone-100 p-4 rounded border border-stone-200">
                <label className="label">Cover Image</label>
                <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, coverImage: e.target.files[0] }))}
                  className="block w-full text-sm text-olive-muted file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-bold file:bg-olive file:text-white hover:file:bg-olive-dark transition-colors" />
                <p className="text-xs text-olive-muted/70 mt-2 font-mono">Will be shown on the public gallery page.</p>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="mandatory" checked={form.isCompulsory}
                  onChange={e => setForm(p => ({ ...p, isCompulsory: e.target.checked }))}
                  className="w-4 h-4 accent-olive" />
                <label htmlFor="mandatory" className="font-mono text-xs text-olive-muted cursor-pointer">
                  Mandatory for all cadets (shows red dot in cadet calendar)
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                  {submitting ? 'Creating...' : '✓ Create Event'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`font-mono text-2xs uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all
              ${filterStatus === s ? 'bg-olive-dark text-parchment border-olive-dark' : 'bg-white text-olive-muted border-stone-200 hover:border-olive/30'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="card p-5 flex gap-5"><div className="skeleton w-20 h-20 shrink-0" /><div className="flex-1 space-y-2"><div className="skeleton h-5 w-1/2" /><div className="skeleton h-4 w-3/4" /></div></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏕️</div>
            <div className="empty-state-title">No events found</div>
            <div className="empty-state-sub">Create events to manage camps and upload gallery photos.</div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ev, i) => {
            const status = getStatus(ev);
            const startDate = ev.startDate ? new Date(ev.startDate) : null;
            return (
              <motion.div key={ev._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }} className="card flex flex-col md:flex-row items-start overflow-hidden relative">
                
                {/* Event Cover Image (Left Side) */}
                <div className="shrink-0 w-full md:w-48 h-32 md:h-full min-h-[140px] bg-stone-200 relative">
                  {ev.coverImage?.url ? (
                    <img src={ev.coverImage.url} alt={ev.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-olive/30">
                      <span className="text-3xl mb-1">📷</span>
                      <span className="font-mono text-2xs uppercase">No Cover</span>
                    </div>
                  )}
                  {startDate && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm border border-black/10 px-2 py-1 flex flex-col items-center leading-none rounded-sm shadow-sm">
                      <span className="font-display text-lg text-olive-dark">{startDate.getDate()}</span>
                      <span className="font-mono text-[10px] text-olive-muted uppercase">{startDate.toLocaleString('en', { month: 'short' })}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={STATUS_COLOR[status] || 'badge-olive'}>{status}</span>
                    <span className={TYPE_COLOR[ev.type] || 'badge-olive'}>{ev.type}</span>
                    {ev.isCompulsory && <span className="badge-red">MANDATORY</span>}
                    <span className="badge-olive bg-stone-200 text-olive-dark">
                      📸 {ev.gallery?.length || 0} Photos
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-olive-dark text-xl mb-1 truncate">{ev.title}</h3>
                  <div className="font-mono text-xs text-olive-muted flex items-center gap-2 mb-3">
                    <span>{startDate ? startDate.toLocaleDateString() : 'TBD'}</span>
                    {ev.endDate && <span>→ {new Date(ev.endDate).toLocaleDateString()}</span>}
                    <span>· {ev.venue || 'No venue'}</span>
                  </div>
                </div>

                <div className="p-5 border-t md:border-t-0 md:border-l border-stone-100 flex flex-row md:flex-col justify-end md:justify-center items-center gap-3 bg-stone-50 md:h-[140px] w-full md:w-auto shrink-0">
                  <button onClick={() => openGalleryModal(ev)} className="btn-primary w-full md:w-auto text-xs py-2 px-4 whitespace-nowrap shadow-sm">
                    Manage Gallery
                  </button>
                  {isANO && (
                    <button onClick={() => handleDelete(ev._id, ev.title)} className="font-mono text-2xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors px-2 py-1">
                      Delete Event
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Gallery Modal */}
      <AnimatePresence>
        {galleryModalOpen && activeEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-olive-dark/80 backdrop-blur-sm" onClick={() => setGalleryModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded shadow-2xl relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-stone-200">
              
              <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
                <div>
                  <h2 className="font-heading font-bold text-lg text-olive-dark leading-tight">{activeEvent.title}</h2>
                  <p className="font-mono text-xs text-olive-muted">Gallery Management ({activeEvent.gallery?.length || 0} photos)</p>
                </div>
                <button onClick={() => setGalleryModalOpen(false)} className="text-stone-400 hover:text-olive-dark transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-stone-300 rounded p-8 text-center bg-stone-50 hover:bg-stone-100 transition-colors relative mb-8">
                  <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handlePhotoUpload} disabled={uploadingPhotos} ref={fileInputRef} />
                  
                  <div className="text-4xl mb-3 opacity-60">📁</div>
                  <h3 className="font-heading font-bold text-olive-dark mb-1">
                    {uploadingPhotos ? 'Uploading photos...' : 'Click or Drag & Drop Photos Here'}
                  </h3>
                  <p className="font-mono text-xs text-olive-muted">You can select up to 10 photos at once (Max 10MB each).</p>
                  
                  {uploadingPhotos && (
                    <div className="mt-4 w-full max-w-xs mx-auto bg-stone-200 rounded-full h-1 overflow-hidden">
                      <div className="bg-olive h-full animate-[pulse_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
                    </div>
                  )}
                </div>

                {/* Photo Grid */}
                {activeEvent.gallery?.length > 0 ? (
                  <div>
                    <h4 className="font-mono text-xs font-bold text-olive-muted uppercase tracking-wider mb-4 border-b border-stone-100 pb-2">Uploaded Photos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {activeEvent.gallery.map(photo => (
                        <div key={photo._id} className="group relative aspect-square bg-stone-100 rounded overflow-hidden shadow-sm border border-stone-200">
                          <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => handleDeletePhoto(photo._id)} className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs px-3 py-1.5 rounded-sm shadow-md flex items-center gap-1 transition-transform transform active:scale-95">
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 opacity-50">
                    <p className="font-mono text-sm text-olive-muted">No photos in this gallery yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default EventsPage;

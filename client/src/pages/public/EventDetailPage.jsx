import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    setLoading(true);
    api.get(`/events/${id}/public`)
      .then(res => {
        if (res.data.success) setEvent(res.data.event);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="skeleton w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center">
        <h1 className="font-display text-4xl text-yellow-400 mb-4">Event Not Found</h1>
        <button onClick={() => navigate('/gallery')} className="btn-primary">Return to Gallery</button>
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const statusColors = { UPCOMING: 'bg-blue-500', ONGOING: 'bg-amber-500', COMPLETED: 'bg-green-600', CANCELLED: 'bg-red-500' };

  return (
    <div className="min-h-screen bg-stone-50 pt-20 pb-20">
      
      {/* Hero Section */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-stone-800 flex items-end">
        {event.coverImage?.url ? (
          <img src={event.coverImage.url} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-olive-dark opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8 pb-12">
          <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white font-mono text-xs uppercase tracking-wider mb-6 flex items-center gap-2 transition-colors">
            ← Back to Events
          </button>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-white rounded-sm ${statusColors[event.status] || 'bg-olive'}`}>
              {event.status}
            </span>
            <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-transparent/20 backdrop-blur-sm text-white rounded-sm border border-white/10">
              {event.type}
            </span>
            {event.isCompulsory && (
              <span className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-red-500/80 backdrop-blur-sm text-white rounded-sm border border-red-500/20">
                MANDATORY
              </span>
            )}
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-wide leading-tight shadow-sm">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-dark p-8 shadow-xl bg-transparent mb-8">
              <h2 className="font-heading font-bold text-2xl text-yellow-400 mb-4 border-b border-stone-100 pb-4">Event Overview</h2>
              <div className="prose prose-stone max-w-none text-yellow-200 text-lg leading-relaxed whitespace-pre-wrap">
                {event.description || 'No description provided.'}
              </div>
            </motion.div>

            {/* Gallery Grid */}
            {event.gallery && event.gallery.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="font-heading font-bold text-2xl text-yellow-400 mb-6 flex items-center gap-3">
                  <span>Event Gallery</span>
                  <span className="font-mono text-xs font-normal text-white bg-olive px-2 py-0.5 rounded-full">{event.gallery.length}</span>
                </h2>
                <div className="columns-2 sm:columns-3 gap-4 space-y-4">
                  {event.gallery.map((photo, index) => (
                    <motion.div 
                      key={photo._id} 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      whileInView={{ opacity: 1, scale: 1 }} 
                      viewport={{ once: true }}
                      className="break-inside-avoid relative group cursor-zoom-in rounded overflow-hidden shadow-sm"
                      onClick={() => setLightboxIndex(index)}
                    >
                      <img src={photo.url} alt={`Gallery ${index}`} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-dark p-6 bg-olive-dark text-white sticky top-24">
              <h3 className="font-heading font-semibold text-parchment mb-6 text-xl tracking-wide uppercase border-b border-white/10 pb-4">Details</h3>
              <ul className="space-y-5 font-mono text-sm">
                <li className="flex flex-col gap-1">
                  <span className="text-white/50 text-[10px] uppercase tracking-widest">Date</span>
                  <span className="text-white text-base">
                    {startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </li>
                {endDate && startDate.getTime() !== endDate.getTime() && (
                  <li className="flex flex-col gap-1">
                    <span className="text-white/50 text-[10px] uppercase tracking-widest">Until</span>
                    <span className="text-white text-base">
                      {endDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </li>
                )}
                <li className="flex flex-col gap-1">
                  <span className="text-white/50 text-[10px] uppercase tracking-widest">Venue</span>
                  <span className="text-white text-base">{event.venue || 'TBA'}</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-white/50 text-[10px] uppercase tracking-widest">Target Wing</span>
                  <span className="text-white text-base">{event.targetWing === 'ALL' ? 'SD & SW (All Cadets)' : event.targetWing}</span>
                </li>
              </ul>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Lightbox / Carousel */}
      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md">
            <button 
              onClick={() => setLightboxIndex(-1)} 
              className="absolute top-6 right-6 text-white/50 hover:text-white z-50 p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-12 pointer-events-none z-40">
              <button 
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev > 0 ? prev - 1 : event.gallery.length - 1); }}
                className="pointer-events-auto bg-black/50 hover:bg-black text-white p-3 sm:p-4 rounded-full backdrop-blur-sm transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev < event.gallery.length - 1 ? prev + 1 : 0); }}
                className="pointer-events-auto bg-black/50 hover:bg-black text-white p-3 sm:p-4 rounded-full backdrop-blur-sm transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <motion.div 
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="w-full h-full p-4 sm:p-12 flex flex-col items-center justify-center"
              onClick={() => setLightboxIndex(-1)}
            >
              <img 
                src={event.gallery[lightboxIndex].url} 
                alt="Fullscreen" 
                className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl rounded-sm select-none"
                onClick={(e) => e.stopPropagation()} 
              />
              <div className="absolute bottom-6 font-mono text-xs text-white/50 tracking-widest bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md">
                {lightboxIndex + 1} / {event.gallery.length}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EventDetailPage;

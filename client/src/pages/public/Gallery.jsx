import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Gallery = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events/public')
      .then(res => {
        if (res.data.success) {
          // Only show events that have a cover image or are explicitly galleries
          const galleryEvents = res.data.events.filter(ev => ev.coverImage?.url || ev.gallery?.length > 0);
          // If none have media, just show all events as fallbacks
          setEvents(galleryEvents.length > 0 ? galleryEvents : res.data.events);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['bg-olive/10', 'bg-khaki/15', 'bg-stone-200', 'bg-olive-dark/10', 'bg-khaki/10', 'bg-stone-300'];

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8 min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="font-mono text-2xs text-yellow-200 tracking-military mb-3">MEDIA ARCHIVE</div>
        <h1 className="font-display text-6xl text-yellow-400 uppercase tracking-wide mb-3">NCC Gallery</h1>
        <div className="gold-divider mb-4" />
        <p className="text-yellow-200 max-w-xl font-sans">Visual documentation of our training, national camps, and moments of institutional pride.</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card-dark h-72 animate-pulse border-white/10 flex flex-col justify-end p-4">
              <div className="h-4 bg-stone-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-stone-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card-dark p-12 text-center text-yellow-200">
          <div className="text-4xl mb-4">📸</div>
          <h2 className="font-heading font-bold text-xl text-yellow-400">No Galleries Available</h2>
          <p className="font-mono text-sm mt-2">Check back later for photos of our latest events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={event._id}
              onClick={() => navigate(`/events/${event._id}`)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="card-dark group overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all"
            >
              {/* Cover Photo */}
              <div className={`h-64 relative overflow-hidden ${COLORS[i % COLORS.length]}`}>
                {event.coverImage?.url ? (
                  <img src={event.coverImage.url} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-4xl text-yellow-400/20 uppercase tracking-widest">NCC</span>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-olive-dark/0 group-hover:bg-olive-dark/80 backdrop-blur-[2px] transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-parchment font-heading font-bold text-lg uppercase tracking-wider mb-2">
                    View Gallery
                  </span>
                  <span className="font-mono text-xs text-white/70 tracking-widest border border-white/20 px-3 py-1 rounded-sm">
                    {event.gallery?.length || 0} PHOTOS
                  </span>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-5 flex items-start justify-between bg-transparent">
                <div className="flex-1 pr-4">
                  <h3 className="font-heading font-bold text-yellow-400 text-base uppercase leading-tight line-clamp-2 mb-2 group-hover:text-yellow-500 transition-colors">{event.title}</h3>
                  <p className="font-mono text-xs text-yellow-200">
                    {new Date(event.startDate).getFullYear()} • {event.venue || 'LCIT'}
                  </p>
                </div>
                <span className="badge-olive shrink-0 shadow-sm">{event.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Gallery = () => {
  const navigate = useNavigate();
  const ITEMS = [
    { title: 'Republic Day Camp 2024',  category: 'CAMP',        year: '2024' },
    { title: 'Independence Day Parade', category: 'PARADE',      year: '2024' },
    { title: 'TSC Selection Trials',    category: 'SELECTION',   year: '2023' },
    { title: 'Annual NCC Day',          category: 'EVENT',       year: '2024' },
    { title: 'Community Service Drive', category: 'COMMUNITY',   year: '2023' },
    { title: 'B-Certificate Exam',      category: 'EXAMINATION', year: '2023' },
  ];

  const COLORS = ['bg-olive/10', 'bg-khaki/15', 'bg-stone-200', 'bg-olive-dark/10', 'bg-khaki/10', 'bg-stone-300'];

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-3">MEDIA ARCHIVE</div>
        <h1 className="font-display text-6xl text-olive-dark uppercase tracking-wide mb-3">NCC Gallery</h1>
        <div className="gold-divider mb-4" />
        <p className="text-olive-muted max-w-xl font-sans">Visual documentation of our training, national camps, and moments of institutional pride.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ITEMS.map((item, i) => (
          <motion.div
            key={i}
            onClick={() => navigate(`/gallery/${i}`)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="card group overflow-hidden cursor-pointer"
          >
            {/* Photo placeholder */}
            <div className={`h-56 relative overflow-hidden ${COLORS[i % COLORS.length]}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-4xl text-olive-dark/20 uppercase tracking-widest">NCC</span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-olive-dark/0 group-hover:bg-olive-dark/70 transition-all duration-300 flex items-center justify-center">
                <span className="text-parchment font-heading font-semibold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  View Photos
                </span>
              </div>
            </div>
            {/* Info */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-olive-dark text-sm uppercase">{item.title}</h3>
                <p className="font-mono text-2xs text-olive-muted mt-0.5">{item.year}</p>
              </div>
              <span className="badge-olive">{item.category}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Gallery;

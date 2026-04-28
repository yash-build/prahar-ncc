import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// ── 6 distinct grid layouts (easily extendable to 30) ──────────────────
const LAYOUTS = [
  { id: 'A', label: 'Grid 4-Col',     cols: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', card: 'portrait' },
  { id: 'B', label: 'Grid 3-Col',     cols: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', card: 'landscape' },
  { id: 'C', label: 'Grid 2-Col',     cols: 'grid-cols-1 md:grid-cols-2',                card: 'wide' },
  { id: 'D', label: 'Masonry Wide',   cols: 'grid-cols-2 md:grid-cols-3',                card: 'masonry' },
  { id: 'E', label: 'Command List',   cols: 'grid-cols-1',                                card: 'list' },
  { id: 'F', label: 'Compact Grid',   cols: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6', card: 'compact' },
];

const RANK_COLOR = { SUO: '#d4af37', JUO: '#c2b280', SGT: '#4a5a48', CPL: '#6b7a69', LCPL: '#6b7a69', CADET: '#a8b8a5' };
const WING_BADGE = { SD: { bg: 'rgba(46,59,44,0.12)', color: '#2e3b2c' }, SW: { bg: 'rgba(194,178,128,0.18)', color: '#a89060' } };

// ── Card Variants ────────────────────────────────────────────────────────
const PortraitCard = ({ cadet, i, onClick }) => (
  <motion.div onClick={onClick} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }} whileHover={{ y:-5 }}
    className="card overflow-hidden group cursor-pointer">
    <div className="h-48 bg-gradient-to-br from-olive/8 to-khaki/8 relative flex items-center justify-center overflow-hidden">
      {cadet.photoUrl
        ? <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <div className="text-center"><span className="font-display text-6xl text-olive/20">{cadet.name[0]}</span></div>
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-2 left-2 right-2 flex justify-between">
        <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded-sm" style={{ background: WING_BADGE[cadet.wing]?.bg, color: WING_BADGE[cadet.wing]?.color }}>{cadet.wing}</span>
        <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded-sm" style={{ background: `${RANK_COLOR[cadet.rank]}25`, color: RANK_COLOR[cadet.rank] }}>{cadet.rank}</span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="font-heading font-bold text-olive-dark text-base leading-tight">{cadet.name}</h3>
      <div className="font-mono text-2xs text-olive-muted mt-1">Year {cadet.yearOfStudy} · {cadet.wing} Wing</div>
      {cadet.yearbookMessage && <p className="text-xs text-olive-muted italic mt-2 line-clamp-2 border-l-2 border-khaki/40 pl-2">"{cadet.yearbookMessage}"</p>}
    </div>
  </motion.div>
);

const LandscapeCard = ({ cadet, i, onClick }) => (
  <motion.div onClick={onClick} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }} whileHover={{ x:4 }}
    className="card overflow-hidden flex group cursor-pointer">
    <div className="w-36 bg-gradient-to-b from-olive/8 to-khaki/8 relative shrink-0 flex items-center justify-center">
      {cadet.photoUrl
        ? <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover" />
        : <span className="font-display text-5xl text-olive/20">{cadet.name[0]}</span>
      }
    </div>
    <div className="p-5 flex-1 flex flex-col justify-center">
      <div className="flex gap-2 mb-2">
        <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded-sm" style={{ background: WING_BADGE[cadet.wing]?.bg, color: WING_BADGE[cadet.wing]?.color }}>{cadet.wing}</span>
        <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded-sm" style={{ background: `${RANK_COLOR[cadet.rank]}25`, color: RANK_COLOR[cadet.rank] }}>{cadet.rank}</span>
      </div>
      <h3 className="font-heading font-bold text-olive-dark text-xl">{cadet.name}</h3>
      <div className="font-mono text-2xs text-olive-muted mt-1 mb-2">Yr {cadet.yearOfStudy} · {cadet.serviceNumber}</div>
      {cadet.yearbookMessage && <p className="text-xs text-olive-muted italic line-clamp-1">"{cadet.yearbookMessage}"</p>}
    </div>
  </motion.div>
);

const WideCard = ({ cadet, i, onClick }) => (
  <motion.div onClick={onClick} initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.06 }}
    className="card overflow-hidden flex group cursor-pointer" style={{ minHeight: 120 }}>
    <div className="w-28 shrink-0 bg-gradient-to-br from-olive/10 to-khaki/10 flex items-center justify-center">
      {cadet.photoUrl ? <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover" /> : <span className="font-display text-5xl text-olive/20">{cadet.name[0]}</span>}
    </div>
    <div className="flex-1 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-heading font-bold text-olive-dark text-2xl">{cadet.name}</h3>
          <div className="font-mono text-xs text-olive-muted">{cadet.serviceNumber}</div>
        </div>
        <div className="text-right"><div className="rank-pip">{cadet.rank}</div><div className="font-mono text-2xs text-olive-muted mt-1">{cadet.wing} Wing</div></div>
      </div>
      {cadet.yearbookMessage && <p className="mt-3 text-sm text-olive-muted italic border-l-2 border-gold/40 pl-3">"{cadet.yearbookMessage}"</p>}
    </div>
  </motion.div>
);

const ListCard = ({ cadet, i, onClick }) => (
  <motion.div onClick={onClick} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.03 }}
    className="card px-5 py-4 flex items-center gap-5 group hover:border-olive/20 cursor-pointer">
    <div className="w-10 h-10 rounded-sm bg-olive/8 border border-olive/12 flex items-center justify-center shrink-0">
      {cadet.photoUrl ? <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover rounded-sm" /> : <span className="font-display text-xl text-olive/30">{cadet.name[0]}</span>}
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-heading font-bold text-olive-dark">{cadet.name}</div>
      <div className="font-mono text-2xs text-olive-muted">{cadet.serviceNumber} · Yr {cadet.yearOfStudy}</div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span className="font-mono text-2xs font-bold px-2 py-0.5 rounded-sm" style={{ background: WING_BADGE[cadet.wing]?.bg, color: WING_BADGE[cadet.wing]?.color }}>{cadet.wing}</span>
      <div className="rank-pip">{cadet.rank}</div>
    </div>
    {cadet.yearbookMessage && <p className="hidden lg:block text-xs text-olive-muted italic max-w-xs truncate">"{cadet.yearbookMessage}"</p>}
  </motion.div>
);

const CompactCard = ({ cadet, i, onClick }) => (
  <motion.div onClick={onClick} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.03 }} whileHover={{ scale:1.04 }}
    className="card overflow-hidden group cursor-pointer aspect-square flex flex-col">
    <div className="flex-1 bg-gradient-to-br from-olive/8 to-khaki/8 flex items-center justify-center overflow-hidden">
      {cadet.photoUrl ? <img src={cadet.photoUrl} alt={cadet.name} className="w-full h-full object-cover" /> : <span className="font-display text-3xl text-olive/20">{cadet.name[0]}</span>}
    </div>
    <div className="px-2 py-2 text-center border-t border-stone-100">
      <div className="font-heading font-bold text-olive-dark text-xs truncate">{cadet.name.split(' ')[0]}</div>
      <div className="font-mono text-2xs text-olive-muted">{cadet.rank}</div>
    </div>
  </motion.div>
);

const CARD_COMP = { portrait:'portrait', landscape:'landscape', wide:'wide', masonry:'portrait', list:'list', compact:'compact' };

const renderCard = (type, cadet, i, navigate) => {
  const onClick = () => navigate(`/cadets/${cadet._id}`);
  if (type === 'landscape') return <LandscapeCard key={cadet._id} cadet={cadet} i={i} onClick={onClick} />;
  if (type === 'wide')      return <WideCard      key={cadet._id} cadet={cadet} i={i} onClick={onClick} />;
  if (type === 'list')      return <ListCard      key={cadet._id} cadet={cadet} i={i} onClick={onClick} />;
  if (type === 'compact')   return <CompactCard   key={cadet._id} cadet={cadet} i={i} onClick={onClick} />;
  return <PortraitCard key={cadet._id} cadet={cadet} i={i} onClick={onClick} />;
};

// ── Main Yearbook Page ───────────────────────────────────────────────────
const Yearbook = () => {
  const [cadets,    setCadets]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [layout,    setLayout]    = useState(LAYOUTS[0]);
  const [activeYear, setYear]     = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cadets/public')
      .then(r => { if (r.data.success) setCadets(r.data.cadets); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const years    = ['ALL', '1', '2', '3'];
  const filtered = activeYear === 'ALL' ? cadets : cadets.filter(c => String(c.yearOfStudy) === activeYear);

  const seniorOfficers = cadets.filter(c => c.isSUOPosition || c.isJUOPosition);
  const byYear = (y) => filtered.filter(c => c.yearOfStudy === y && !c.isSUOPosition && !c.isJUOPosition);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="text-center mb-12">
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-3">LCIT NCC · 2024-25</div>
        <h1 className="font-display text-7xl text-olive-dark uppercase tracking-wide mb-3">Cadet Yearbook</h1>
        <div className="gold-divider mx-auto mb-4" />
        <p className="text-olive-muted font-sans max-w-lg mx-auto">The official record of our NCC cadets — their service, rank, and legacy.</p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between">
        {/* Year filter */}
        <div className="flex gap-2">
          {years.map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border rounded-sm transition-all
                ${activeYear===y ? 'bg-olive text-parchment border-olive' : 'bg-white text-olive-muted border-stone-200 hover:border-olive/30'}`}>
              {y === 'ALL' ? 'All Years' : `Year ${y}`}
            </button>
          ))}
        </div>

        {/* Layout switcher */}
        <div className="flex gap-1.5 bg-white border border-stone-200 rounded-sm p-1">
          {LAYOUTS.map(l => (
            <button key={l.id} onClick={() => setLayout(l)}
              className={`px-3 py-1.5 font-mono text-2xs uppercase tracking-wide rounded-sm transition-all
                ${layout.id===l.id ? 'bg-olive text-parchment' : 'text-olive-muted hover:bg-stone-50'}`}>
              {l.id}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_,i) => <div key={i} className="card"><div className="skeleton h-48 mb-3" /><div className="p-4 space-y-2"><div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" /></div></div>)}
        </div>
      ) : cadets.length === 0 ? (
        <div className="text-center py-20"><div className="text-5xl mb-4 opacity-30">👤</div><div className="font-heading font-semibold text-olive-muted text-xl">No cadets found in database</div><div className="font-mono text-xs text-olive-muted/70 mt-2">Run the seed script or add cadets from the admin dashboard.</div></div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={layout.id + activeYear} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}>

            {/* Senior Officers section — always show if ALL */}
            {activeYear === 'ALL' && seniorOfficers.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="gold-divider" /><h2 className="font-display text-3xl text-olive-dark tracking-wider">Senior Officers</h2><div className="flex-1 h-px bg-gradient-to-r from-khaki/30 to-transparent" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {seniorOfficers.map((c,i) => <PortraitCard key={c._id} cadet={c} i={i} onClick={() => navigate(`/cadets/${c._id}`)} />)}
                </div>
              </section>
            )}

            {/* Year sections */}
            {activeYear === 'ALL' ? [3,2,1].map(y => byYear(y).length > 0 && (
              <section key={y} className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="gold-divider" />
                  <h2 className="font-display text-3xl text-olive-dark tracking-wider">{y === 3 ? 'Senior Batch' : y === 2 ? 'Intermediate Batch' : 'Junior Batch'}</h2>
                  <span className="font-mono text-2xs text-olive-muted">Year {y}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-stone-200 to-transparent" />
                </div>
                <div className={`grid ${layout.cols} gap-5`}>
                  {byYear(y).map((c,i) => renderCard(layout.card, c, i, navigate))}
                </div>
              </section>
            )) : (
              <div className={`grid ${layout.cols} gap-5`}>
                {filtered.map((c,i) => renderCard(layout.card, c, i, navigate))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Yearbook;

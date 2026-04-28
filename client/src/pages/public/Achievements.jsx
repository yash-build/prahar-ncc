import { motion } from 'framer-motion';

const ACHIEVEMENTS = [
  { title: 'Best Cadet — RDC New Delhi 2024', category: 'National', level: 'NATIONAL', cadet: 'SUO Example Name', date: 'Jan 26, 2024', desc: 'Awarded for outstanding discipline, drill, and leadership during the Republic Day Camp.' },
  { title: 'Gold Medal — State Shooting Championship', category: 'State', level: 'STATE', cadet: 'JUO R. Sharma', date: 'Mar 12, 2024', desc: 'First place in the small arms category at the state-level shooting competition.' },
  { title: 'Best Troop — Annual NCC Day Parade', category: 'Institutional', level: 'UNIT', cadet: 'PRAHAR Unit', date: 'Nov 27, 2023', desc: 'Awarded for best drill performance and uniform presentation during NCC Day.' },
];

const LEVEL_BADGES = {
  NATIONAL:    'badge-gold',
  STATE:       'badge-blue',
  UNIT:        'badge-olive',
};

const Achievements = () => {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-3">INSTITUTIONAL RECORD</div>
        <h1 className="font-display text-6xl text-olive-dark uppercase tracking-wide mb-3">Wall of Honor</h1>
        <div className="gold-divider mb-4" />
        <p className="text-olive-muted max-w-xl font-sans">Exceptional accomplishments of our cadets at national, state, and institutional levels.</p>
      </motion.div>

      <div className="space-y-5">
        {ACHIEVEMENTS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ x: 4 }}
            className="card p-0 overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row">
              {/* Left accent */}
              <div className="hidden md:flex w-2 shrink-0 bg-gradient-to-b from-gold to-khaki" />
              {/* Medal icon */}
              <div className="md:hidden h-1.5 bg-gradient-to-r from-gold to-khaki" />
              <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-14 h-14 rounded-sm border border-khaki/40 bg-gold/10 flex items-center justify-center text-2xl shrink-0 group-hover:bg-gold/20 transition-colors">
                  🎖️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={LEVEL_BADGES[item.level]}>{item.level}</span>
                    <span className="font-mono text-2xs text-olive-muted">{item.date}</span>
                  </div>
                  <h3 className="font-heading font-bold text-olive-dark text-xl mb-1">{item.title}</h3>
                  <p className="text-olive-muted text-sm mb-2">{item.desc}</p>
                  <div className="font-mono text-2xs text-khaki-dark">Awarded to: {item.cadet}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default Achievements;

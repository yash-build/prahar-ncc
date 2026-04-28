import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '👤', title: 'Cadet Registry',    desc: 'Centralized management of all cadet records, rank, and wing assignments.' },
  { icon: '📋', title: 'Attendance System', desc: 'Bulk daily attendance marking with override capabilities and audit trails.' },
  { icon: '🎖️', title: 'Honor Roll',        desc: 'Automated recognition for cadets with outstanding attendance and performance.' },
  { icon: '🏕️', title: 'Events & Camps',    desc: 'Track RDC, TSC, national and state camps across all training cycles.' },
  { icon: '📢', title: 'Notice Board',      desc: 'Priority-flagged official communications with audience targeting.' },
  { icon: '📊', title: 'Analytics',         desc: 'Real-time attendance trends, rank distribution, and performance insights.' },
];

const STATS = [
  { value: '200+', label: 'Enrolled Cadets' },
  { value: '98%',  label: 'Data Accuracy' },
  { value: '3',    label: 'Wings Managed' },
  { value: '24/7', label: 'System Uptime' },
];

const Landing = () => {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative bg-olive-dark min-h-screen flex items-center overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, white 40px, white 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, white 40px, white 41px)' }}
        />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-khaki/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-gold/4 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-khaki/10 border border-khaki/25 px-3 py-1.5 rounded-sm mb-8">
              <span className="status-dot-active" />
              <span className="font-mono text-2xs text-khaki tracking-widest">SYSTEM ONLINE · LCIT BILASPUR</span>
            </div>

            <h1 className="font-display text-7xl md:text-8xl text-parchment leading-none tracking-wide mb-2">
              PRAHAR
            </h1>
            <div className="gold-divider mb-6 w-20" />
            <h2 className="font-heading text-xl text-khaki/80 font-medium mb-6 tracking-wide">
              LCIT NCC Digital Command System
            </h2>
            <p className="text-olive-faint/60 font-sans text-base leading-relaxed mb-10 max-w-lg">
              A production-grade institutional platform for managing cadets, attendance, 
              events, and communications — built for discipline, built for scale.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="btn-gold text-sm px-7 py-3">
                Enter Command Portal →
              </Link>
              <Link to="/yearbook" className="btn-ghost text-sm px-7 py-3 border-olive-faint/30 text-olive-faint/70 hover:text-parchment hover:bg-white/5">
                View Yearbook
              </Link>
            </div>
          </motion.div>

          {/* Right — stats grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="card-dark p-6 text-center hover-lift"
                style={{ boxShadow: '0 0 20px rgba(212,175,55,0.05)' }}
              >
                <div className="font-display text-5xl text-gradient-gold mb-2">{stat.value}</div>
                <div className="font-mono text-2xs text-olive-faint/50 uppercase tracking-military">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <div className="font-mono text-2xs text-olive-faint tracking-widest">SCROLL</div>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-khaki to-transparent"
          />
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="bg-smoke py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="font-mono text-2xs text-olive-muted tracking-military mb-4">CAPABILITIES</div>
            <h2 className="font-display text-5xl text-olive-dark uppercase tracking-wide mb-4">Command Features</h2>
            <div className="gold-divider mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="card p-6 group"
              >
                <div className="w-12 h-12 bg-olive-dark/6 border border-olive/15 flex items-center justify-center rounded-sm mb-5 text-2xl group-hover:border-khaki/40 transition-colors">
                  {feat.icon}
                </div>
                <h3 className="font-heading font-semibold text-olive-dark text-lg mb-2 uppercase tracking-wide">{feat.title}</h3>
                <p className="text-olive-muted text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-olive-dark py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, white 40px, white 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, white 40px, white 41px)' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="font-display text-6xl text-parchment mb-4">READY TO SERVE</div>
            <div className="gold-divider mx-auto mb-6" />
            <p className="text-olive-faint/50 font-mono text-sm mb-10">
              Authorized NCC personnel may access the command system below.
            </p>
            <Link to="/login" className="btn-gold px-10 py-4 text-base">
              Access Portal →
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

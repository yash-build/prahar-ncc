import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';

/* ─── Static copy ─────────────────────────────────── */
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

const inView = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

/* ─── Landing Page ───────────────────────────────── */
const Landing = () => {
  const [cadets,       setCadets]       = useState([]);
  const [notices,      setNotices]      = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [settings,     setSettings]     = useState(null);
  const [apiLoaded,    setApiLoaded]    = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get('/cadets/public').then(r => { if (r.data?.success) setCadets(r.data.cadets || []); }),
      api.get('/notices', { params: { isPublic: true, limit: 4 } }).then(r => { if (r.data?.success) setNotices(r.data.notices || []); }),
      api.get('/achievements/public').then(r => { if (r.data?.success) setAchievements(r.data.achievements || []); }),
      api.get('/settings/public').then(r => { if (r.data?.success) setSettings(r.data.settings || null); }),
    ]).finally(() => setApiLoaded(true));
  }, []);

  /* Derived data */
  const ano         = cadets.find(c => c.role === 'ANO') || null;
  const suo         = cadets.find(c => c.isSUOPosition);
  const juos        = cadets.filter(c => c.isJUOPosition);
  const rankHolders = cadets.filter(c => c.isHonorRoll).slice(0, 8);
  const byYear      = (y) => cadets.filter(c => c.yearOfStudy === y).slice(0, 5);

  const statsList = [
    { value: settings?.stats?.cadets || '200+', label: 'Enrolled Cadets' },
    { value: settings?.stats?.accuracy || '98%',  label: 'Data Accuracy' },
    { value: settings?.stats?.wings || '3',    label: 'Wings Managed' },
    { value: settings?.stats?.uptime || '24/7', label: 'System Uptime' },
  ];

  return (
    <div className="min-h-screen">

      {/* ═══ 1. HERO ══════════════════════════════════════════ */}
      <section className="relative bg-olive-dark min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,white 40px,white 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,white 40px,white 41px)' }}
        />
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-khaki/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-gold/4 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-khaki/10 border border-khaki/25 px-3 py-1.5 rounded-sm mb-8">
              <span className="status-dot-active" />
              <span className="font-mono text-2xs text-khaki tracking-widest">SYSTEM ONLINE · {settings?.stats?.college?.toUpperCase() || 'LCIT BILASPUR'}</span>
            </div>
            <h1 className="font-display text-7xl md:text-8xl text-gold leading-none tracking-wide mb-2">PRAHAR</h1>
            <div className="gold-divider mb-6 w-20" />
            <h2 className="font-heading text-xl text-khaki font-medium mb-6 tracking-wide">Digital Command System</h2>
            <p className="text-yellow-100/90 font-sans text-base leading-relaxed mb-10 max-w-lg">
              A production-grade institutional platform for managing cadets, attendance, events, and communications — built for discipline, built for scale.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login" className="btn-gold text-sm px-7 py-3">Enter Command Portal →</Link>
              {settings?.visibility?.yearbook !== false && (
                <Link to="/yearbook" className="btn-ghost text-sm px-7 py-3 border-khaki/30 text-khaki hover:text-gold hover:bg-transparent/5">View Yearbook</Link>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="grid grid-cols-2 gap-4">
            {statsList.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }} className="card-dark p-6 text-center hover-lift"
                style={{ boxShadow: '0 0 20px rgba(212,175,55,0.05)' }}>
                <div className="font-display text-5xl text-gradient-gold mb-2">{stat.value}</div>
                <div className="font-mono text-2xs text-yellow-500/80 uppercase tracking-military">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <div className="font-mono text-2xs text-khaki tracking-widest">SCROLL</div>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* ═══ 2. ANO SECTION ══════════════════════════════════ */}
      <section className="bg-transparent py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...inView} transition={{ duration: 0.5 }} className="text-center mb-14">
            <div className="font-mono text-2xs text-khaki-dark tracking-military mb-3">COMMANDING OFFICER</div>
            <h2 className="font-display text-4xl text-yellow-400 uppercase tracking-wide">Associate NCC Officer</h2>
            <div className="gold-divider mx-auto mt-3" />
          </motion.div>
          <motion.div {...inView} transition={{ duration: 0.5, delay: 0.1 }} className="max-w-2xl mx-auto">
            <div className="card-dark p-8 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
              <div className="w-32 h-32 rounded-sm bg-gradient-to-br from-olive/20 to-khaki/10 border-2 border-khaki/30 flex items-center justify-center shrink-0 overflow-hidden">
                {ano?.photoUrl
                  ? <img src={ano.photoUrl} alt={ano.name} className="w-full h-full object-cover" />
                  : <span className="font-display text-5xl text-yellow-500/25">🎖</span>
                }
              </div>
              <div>
                <div className="font-mono text-2xs text-khaki-dark tracking-military mb-1">LT. / CAPT.</div>
                <div className="font-display text-3xl text-yellow-400 mb-1">{ano?.name || 'PRAHAR ANO'}</div>
                <div className="font-mono text-sm text-khaki-dark mb-4">{ano?.rank || 'Associate NCC Officer'} · {settings?.stats?.battalion || '17 CG BN NCC'}</div>
                <p className="font-sans text-sm text-yellow-400 italic leading-relaxed border-l-2 border-khaki/60 pl-4">
                  {ano?.yearbookMessage || '"Discipline is the soul of an army. It makes small numbers formidable; procures success to the weak, and esteem to all."'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. COMMAND HIERARCHY ════════════════════════════ */}
      {(suo || juos.length > 0) && (
        <section className="bg-transparent py-20 border-t border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...inView} className="text-center mb-14">
              <div className="font-mono text-2xs text-khaki-dark tracking-military mb-3">CADET COMMAND</div>
              <h2 className="font-display text-4xl text-yellow-400 uppercase tracking-wide">Command Hierarchy</h2>
              <div className="gold-divider mx-auto mt-3" />
            </motion.div>
            <div className="flex flex-col items-center gap-6">
              {/* SUO */}
              {suo && (
                <motion.div {...inView} transition={{ delay: 0.1 }} className="card-dark p-6 flex items-center gap-6 w-full max-w-md">
                  <div className="w-16 h-16 rounded-sm bg-gold/10 border-2 border-gold/40 flex items-center justify-center overflow-hidden shrink-0">
                    {suo.photoUrl ? <img src={suo.photoUrl} alt={suo.name} className="w-full h-full object-cover" /> : <span className="font-display text-3xl text-gold/50">S</span>}
                  </div>
                  <div>
                    <div className="font-mono text-2xs text-gold tracking-widest mb-0.5">SENIOR UNDER OFFICER</div>
                    <div className="font-heading font-bold text-yellow-400 text-xl">{suo.name}</div>
                    <div className="font-mono text-2xs text-khaki-dark">{suo.wing} Wing · Yr {suo.yearOfStudy}</div>
                  </div>
                  <div className="ml-auto">
                    <span className="font-mono text-2xs font-bold px-2 py-1 bg-gold/20 text-gold border border-gold/30 rounded-sm">SUO</span>
                  </div>
                </motion.div>
              )}
              {/* JUOs */}
              {juos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {juos.slice(0, 2).map((juo, i) => (
                    <motion.div key={juo._id} {...inView} transition={{ delay: 0.2 + i * 0.1 }} className="card-dark p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-sm bg-khaki/10 border border-khaki/30 flex items-center justify-center overflow-hidden shrink-0">
                        {juo.photoUrl ? <img src={juo.photoUrl} alt={juo.name} className="w-full h-full object-cover" /> : <span className="font-display text-xl text-khaki/40">J</span>}
                      </div>
                      <div>
                        <div className="font-mono text-2xs text-khaki-dark tracking-widest mb-0.5">JUO</div>
                        <div className="font-heading font-semibold text-yellow-400">{juo.name}</div>
                        <div className="font-mono text-2xs text-khaki-dark">{juo.wing} Wing</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 4. HONOR ROLL / RANK HOLDERS ════════════════════ */}
      {rankHolders.length > 0 && (
        <section className="bg-transparent py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...inView} className="text-center mb-14">
              <div className="font-mono text-2xs text-khaki-dark tracking-military mb-3">RECOGNITION</div>
              <h2 className="font-display text-4xl text-yellow-400 uppercase tracking-wide">Honor Roll</h2>
              <div className="gold-divider mx-auto mt-3" />
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {rankHolders.map((c, i) => (
                <motion.div key={c._id} {...inView} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }} className="card-dark overflow-hidden group">
                  <div className="h-32 bg-gradient-to-br from-olive/8 to-khaki/8 flex items-center justify-center relative overflow-hidden">
                    {c.photoUrl
                      ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <span className="font-display text-4xl text-yellow-500/20">{c.name[0]}</span>
                    }
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-gold/90 rounded-full flex items-center justify-center shadow">
                      <span className="text-[10px] text-yellow-400">✦</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="font-heading font-bold text-yellow-400 text-sm truncate">{c.name}</div>
                    <div className="font-mono text-2xs text-khaki-dark">{c.rank} · {c.wing}</div>
                    {c.honorRollReason && <div className="font-mono text-xs text-olive-dark mt-1 truncate">{c.honorRollReason}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
            {settings?.visibility?.yearbook !== false && (
              <div className="text-center mt-10">
                <Link to="/yearbook" className="btn-ghost px-8 py-3">View Full Yearbook →</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ 5. YEARBOOK PREVIEW (3 batch tabs) ══════════════ */}
      {cadets.length > 0 && settings?.visibility?.yearbook !== false && (
        <YearbookPreview byYear={byYear} />
      )}

      {/* ═══ 6. ACHIEVEMENTS WALL ════════════════════════════ */}
      {achievements.length > 0 && settings?.visibility?.achievements !== false && (
        <section className="bg-transparent py-20 border-t border-stone-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...inView} className="text-center mb-14">
              <div className="font-mono text-2xs text-khaki-dark tracking-military mb-3">EXCELLENCE</div>
              <h2 className="font-display text-4xl text-yellow-400 uppercase tracking-wide">Achievements Wall</h2>
              <div className="gold-divider mx-auto mt-3" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {achievements.slice(0, 6).map((a, i) => (
                <motion.div key={a._id} {...inView} transition={{ delay: i * 0.07 }} whileHover={{ y: -3 }} className="card-dark p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-sm flex items-center justify-center shrink-0 text-2xl">🏆</div>
                    <div className="min-w-0">
                      <span className={`font-mono text-2xs font-bold px-2 py-0.5 rounded-sm mb-2 inline-block
                        ${a.level === 'NATIONAL' ? 'bg-red-50 text-red-700 border border-red-200' :
                          a.level === 'STATE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-stone-50 text-stone-600 border border-stone-200'}`}>
                        {a.level}
                      </span>
                      <div className="font-heading font-bold text-yellow-400">{a.name}</div>
                      {a.result && <div className="font-mono text-xs text-khaki-dark mt-0.5">{a.result}</div>}
                      {a.cadetId?.name && <div className="font-mono text-2xs text-yellow-200 mt-1">{a.cadetId.name}</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 7. NOTICE BOARD ═════════════════════════════════ */}
      {notices.length > 0 && settings?.visibility?.notices !== false && (
        <section className="bg-transparent py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...inView} className="flex items-end justify-between mb-14">
              <div>
                <div className="font-mono text-2xs text-khaki-dark tracking-military mb-3">COMMUNICATIONS</div>
                <h2 className="font-display text-4xl text-yellow-400 uppercase tracking-wide">Latest Notices</h2>
                <div className="gold-divider mt-3" />
              </div>
              <Link to="/notices" className="btn-ghost text-xs px-5 py-2 hidden sm:block">View All →</Link>
            </motion.div>
            <div className="space-y-4">
              {notices.slice(0, 4).map((n, i) => (
                <motion.div key={n._id} {...inView} transition={{ delay: i * 0.07 }}
                  className="card-dark px-6 py-4 flex items-center gap-5">
                  <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.7)] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold text-yellow-400 truncate">{n.title}</div>
                    <div className="font-mono text-2xs text-khaki-dark mt-0.5">{n.priority && <span className="mr-2 text-amber-600">{n.priority}</span>}{new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <Link to="/notices" className="font-mono text-2xs text-khaki-dark hover:text-yellow-400 uppercase tracking-wider shrink-0">Read →</Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link to="/notices" className="btn-ghost px-8 py-3">All Notices →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══ CAPABILITIES ════════════════════════════════════ */}
      <section className="bg-transparent py-24 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...inView} className="text-center mb-16">
            <div className="font-mono text-2xs text-khaki-dark tracking-military mb-4">CAPABILITIES</div>
            <h2 className="font-display text-5xl text-yellow-400 uppercase tracking-wide mb-4">Command Features</h2>
            <div className="gold-divider mx-auto" />
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div key={feat.title} {...inView} transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }} className="card-dark p-6 group">
                <div className="w-12 h-12 bg-khaki/10 border border-khaki/30 flex items-center justify-center rounded-sm mb-5 text-2xl group-hover:border-gold/60 transition-colors">{feat.icon}</div>
                <h3 className="font-heading font-semibold text-yellow-400 text-lg mb-2 uppercase tracking-wide">{feat.title}</h3>
                <p className="text-yellow-400/80 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═════════════════════════════════════════════ */}
      <section className="relative bg-olive-dark py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 40px,white 40px,white 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,white 40px,white 41px)' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div {...inView}>
            <div className="font-display text-6xl text-gold mb-4">READY TO SERVE</div>
            <div className="gold-divider mx-auto mb-6" />
            <p className="text-khaki font-mono text-sm mb-10">Authorized NCC personnel may access the command system below.</p>
            <Link to="/login" className="btn-gold px-10 py-4 text-base">Access Portal →</Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

/* ─── Yearbook Preview sub-component (batch tabs) ─── */
const YearbookPreview = ({ byYear }) => {
  const [tab, setTab] = useState(3);
  const cadets = byYear(tab);

  return (
    <section className="bg-transparent py-20 border-t border-stone-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div {...inView} className="text-center mb-14">
          <div className="font-mono text-2xs text-yellow-200 tracking-military mb-3">CLASS OF 2024-25</div>
          <h2 className="font-display text-4xl text-yellow-400 uppercase tracking-wide">Cadet Yearbook Preview</h2>
          <div className="gold-divider mx-auto mt-3" />
        </motion.div>
        {/* Batch tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {[3, 2, 1].map(y => (
            <button key={y} onClick={() => setTab(y)}
              className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider border rounded-sm transition-all
                ${tab === y ? 'bg-olive-dark text-parchment border-olive-dark' : 'bg-transparent text-yellow-200 border-stone-200 hover:border-olive/30'}`}>
              {y === 3 ? 'Senior Batch' : y === 2 ? 'Intermediate' : 'Junior Batch'}
            </button>
          ))}
        </div>
        {cadets.length === 0 ? (
          <div className="text-center py-10 font-mono text-xs text-yellow-200">No cadets in this batch</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cadets.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} whileHover={{ y: -3 }} className="card-dark overflow-hidden group">
                <div className="aspect-square bg-gradient-to-br from-olive/8 to-khaki/8 flex items-center justify-center overflow-hidden">
                  {c.photoUrl
                    ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <span className="font-display text-4xl text-yellow-500/20">{c.name[0]}</span>
                  }
                </div>
                <div className="p-3 text-center">
                  <div className="font-heading font-bold text-yellow-400 text-xs truncate">{c.name}</div>
                  <div className="font-mono text-2xs text-yellow-200">{c.rank}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link to="/yearbook" className="btn-gold px-8 py-3">Full Yearbook →</Link>
        </div>
      </div>
    </section>
  );
};

export default Landing;

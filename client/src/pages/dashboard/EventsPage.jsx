import { motion } from 'framer-motion';
import AnimatedPage from '../../components/layout/AnimatedPage';

const EventsPage = () => {
  const events = [
    { title: 'Annual Training Camp', type: 'CAMP', date: 'Dec 15–25, 2024', location: 'Raipur NCC Camp', status: 'UPCOMING', desc: 'Annual 10-day residential training camp. All active cadets are required to attend.' },
    { title: 'Republic Day Parade', type: 'PARADE', date: 'Jan 26, 2025', location: 'Bilaspur District Ground', status: 'UPCOMING', desc: 'Selected cadets will participate in the district-level Republic Day parade.' },
    { title: 'B-Certificate Examination', type: 'EXAM', date: 'Dec 10, 2024', location: 'LCIT Campus', status: 'UPCOMING', desc: 'B-Certificate written and practical examination for second-year cadets.' },
    { title: 'NCC Day Celebration', type: 'EVENT', date: 'Nov 27, 2024', location: 'LCIT Campus', status: 'COMPLETED', desc: 'Annual NCC Day parade and cultural programme at the college ground.' },
  ];

  const STATUS_COLOR = { UPCOMING: 'badge-blue', ONGOING: 'badge-amber', COMPLETED: 'badge-green' };
  const TYPE_COLOR   = { CAMP: 'badge-olive', PARADE: 'badge-gold', EXAM: 'badge-red', EVENT: 'badge-blue' };

  return (
    <AnimatedPage className="page-shell">
      <div><div className="font-mono text-2xs text-olive-muted tracking-military mb-1">CALENDAR</div><h1 className="section-title">Events & Camps</h1></div>
      <div className="space-y-4">
        {events.map((e, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="card p-5 flex flex-col md:flex-row gap-5 items-start">
            <div className="shrink-0 w-20 h-20 bg-olive/6 border border-olive/15 flex flex-col items-center justify-center rounded-sm">
              <span className="font-display text-3xl text-olive-dark">{e.date.split(' ')[0].slice(0,3).toUpperCase()}</span>
              <span className="font-mono text-2xs text-olive-muted">{e.date.split(',')[0].split(' ').pop()}</span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={STATUS_COLOR[e.status]}>{e.status}</span>
                <span className={TYPE_COLOR[e.type]}>{e.type}</span>
              </div>
              <h3 className="font-heading font-bold text-olive-dark text-xl mb-1">{e.title}</h3>
              <div className="font-mono text-2xs text-olive-muted mb-2">📅 {e.date} &nbsp;·&nbsp; 📍 {e.location}</div>
              <p className="text-sm text-olive-muted">{e.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </AnimatedPage>
  );
};
export default EventsPage;

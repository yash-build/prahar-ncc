import { motion } from 'framer-motion';

const NOTICES = [
  { title: 'B-Certificate Examination Schedule', priority: 'HIGH',   date: 'Oct 12, 2024', audience: 'All Cadets',    preview: 'The dates for the upcoming B-Certificate examinations have been finalized. All second-year cadets must report to...' },
  { title: 'Republic Day Camp Selection Trials', priority: 'HIGH',   date: 'Oct 8, 2024',  audience: 'SD Wing',       preview: 'Selection trials for RDC candidates will be held on 20 Oct 2024. Interested cadets must register with their SUO...' },
  { title: 'Annual NCC Day Celebration',         priority: 'MEDIUM', date: 'Oct 5, 2024',  audience: 'All Cadets',    preview: 'NCC Day will be celebrated on 27 November 2024. All cadets are expected to be present in full uniform...' },
  { title: 'Uniform Maintenance Notice',         priority: 'LOW',    date: 'Sep 30, 2024', audience: 'Junior Cadets', preview: 'All first-year cadets are reminded to ensure their uniforms are clean and pressed for the upcoming parade...' },
];

const PRIORITY_BADGE = {
  HIGH:   'badge-red',
  MEDIUM: 'badge-amber',
  LOW:    'badge-olive',
};

const PRIORITY_BORDER = {
  HIGH:   'border-l-red-500',
  MEDIUM: 'border-l-amber-500',
  LOW:    'border-l-olive/40',
};

const PublicNotices = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
        <div className="font-mono text-2xs text-olive-muted tracking-military mb-3">OFFICIAL COMMUNICATIONS</div>
        <h1 className="font-display text-6xl text-olive-dark uppercase tracking-wide mb-3">Notice Board</h1>
        <div className="gold-divider mb-4" />
        <p className="text-olive-muted max-w-xl font-sans">Official announcements, exam schedules, and important updates for all cadets.</p>
      </motion.div>

      <div className="space-y-4">
        {NOTICES.map((notice, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 3 }}
            className={`card border-l-4 ${PRIORITY_BORDER[notice.priority]} p-0 overflow-hidden group cursor-pointer`}
          >
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className={PRIORITY_BADGE[notice.priority]}>{notice.priority} PRIORITY</span>
                <span className="badge-olive">{notice.audience}</span>
                <span className="ml-auto font-mono text-2xs text-olive-muted">{notice.date}</span>
              </div>
              <h3 className="font-heading font-bold text-olive-dark text-lg mb-2 group-hover:text-khaki-dark transition-colors">{notice.title}</h3>
              <p className="text-olive-muted text-sm line-clamp-2">{notice.preview}</p>
              <div className="mt-3 font-mono text-2xs text-khaki-dark font-semibold uppercase tracking-wider">Read Full Notice →</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
export default PublicNotices;

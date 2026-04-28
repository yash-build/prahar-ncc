import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6">← Back to Events</button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="flex gap-2 mb-3">
          <span className="badge-blue">UPCOMING / PAST</span>
          <span className="font-mono text-2xs text-olive-muted mt-1">ID: {id}</span>
        </div>
        <h1 className="font-display text-4xl text-olive-dark uppercase mb-4">Event Details</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="col-span-2 text-olive-muted text-lg leading-relaxed">
            Full description of the event, including schedule, participating wings, reporting times, and requirements.
          </div>
          <div className="bg-olive/5 p-6 rounded-sm border border-olive/10">
            <h3 className="font-heading font-semibold text-olive-dark mb-4">Event Info</h3>
            <ul className="space-y-3 font-mono text-sm text-olive-muted">
              <li><strong className="text-khaki-dark">Date:</strong> TBA</li>
              <li><strong className="text-khaki-dark">Location:</strong> LCIT Ground</li>
              <li><strong className="text-khaki-dark">OIC:</strong> ANO</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default EventDetailPage;

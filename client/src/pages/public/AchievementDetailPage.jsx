import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AchievementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6">← Back to Achievements</button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="flex gap-2 mb-3">
          <span className="badge-gold">ACHIEVEMENT LEVEL</span>
          <span className="font-mono text-2xs text-olive-muted mt-1">ID: {id}</span>
        </div>
        <h1 className="font-display text-4xl text-olive-dark uppercase mb-4">Achievement Record</h1>
        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <div className="flex-1 text-olive-muted text-lg leading-relaxed">
            <p className="mb-4">Full description of the accomplishment. This cadet has shown exemplary performance and dedication.</p>
            <div className="bg-olive/5 p-6 rounded-sm border border-olive/10 mt-6 flex items-center justify-center">
              <span className="text-olive-muted font-mono text-sm">[ Certificate / Medal Image Placeholder ]</span>
            </div>
          </div>
          <div className="w-full md:w-1/3 bg-olive-dark text-parchment p-6 rounded-sm shadow-xl h-max">
            <h3 className="font-heading font-semibold text-khaki mb-4">Details</h3>
            <ul className="space-y-3 font-mono text-sm text-parchment/70">
              <li><strong className="text-khaki-dark">Cadet:</strong> Ranked Name</li>
              <li><strong className="text-khaki-dark">Date:</strong> 2024</li>
              <li><strong className="text-khaki-dark">Category:</strong> Institutional</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default AchievementDetailPage;

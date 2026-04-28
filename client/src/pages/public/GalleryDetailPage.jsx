import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const GalleryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6">← Back to Gallery</button>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-96 bg-olive-dark/10 flex items-center justify-center relative">
          <span className="font-display text-6xl text-olive-dark/20 uppercase tracking-widest">NCC MEDIA</span>
        </div>
        <div className="p-8">
          <div className="flex gap-2 mb-3">
            <span className="badge-olive">CAMP / EVENT</span>
            <span className="font-mono text-2xs text-olive-muted mt-1">ID: {id}</span>
          </div>
          <h1 className="font-display text-4xl text-olive-dark uppercase mb-4">Gallery Event Record</h1>
          <p className="text-olive-muted text-lg leading-relaxed">
            Detailed visual documentation of the selected event. This includes full resolution images, dates, and descriptions of the activities performed by the cadets.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default GalleryDetailPage;

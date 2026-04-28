import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Simple placeholder — account setup is done via seed script
const Setup = () => (
  <div className="min-h-screen bg-olive-dark flex items-center justify-center p-4"
    style={{ background: 'linear-gradient(135deg, #1f2a1d 0%, #141a13 100%)' }}>
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="glass w-full max-w-md p-10 text-center">
      <div className="font-display text-5xl text-khaki tracking-widest mb-2">PRAHAR</div>
      <div className="font-mono text-xs text-olive-faint/40 tracking-widest mb-8">LCIT NCC SETUP</div>
      <div className="w-16 h-16 mx-auto mb-6 rounded-sm bg-khaki/10 border border-khaki/30 flex items-center justify-center">
        <span className="text-3xl">⚙️</span>
      </div>
      <h2 className="font-heading font-bold text-parchment text-xl mb-3">System Already Initialized</h2>
      <p className="font-mono text-xs text-olive-faint/50 leading-relaxed mb-8">
        Admin accounts are created via the seed script.<br />
        Please contact your system administrator for access.
      </p>
      <Link to="/login" className="btn-gold w-full">Go to Login →</Link>
    </motion.div>
  </div>
);

export default Setup;

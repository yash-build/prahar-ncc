import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 15, scale: 0.98 },
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const AnimatedPage = ({ children, className = '' }) => (
  <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit" className={className}>
    {children}
  </motion.div>
);

export default AnimatedPage;

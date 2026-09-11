import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 1.05, y: -10 },
};

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20, 
        mass: 0.5 
      }}
    >
      {children}
    </motion.div>
  );
}

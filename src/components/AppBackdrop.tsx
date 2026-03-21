import React from 'react';
import { motion } from 'framer-motion';

const orbTransition = {
  duration: 16,
  repeat: Infinity,
  ease: 'easeInOut'
};

export const AppBackdrop = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="aurora-orb aurora-orb--one"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={orbTransition}
      />
      <motion.div
        className="aurora-orb aurora-orb--two"
        animate={{ x: [0, -30, 0], y: [0, 35, 0] }}
        transition={{ ...orbTransition, duration: 18 }}
      />
      <motion.div
        className="aurora-orb aurora-orb--three"
        animate={{ x: [0, 25, 0], y: [0, 20, 0] }}
        transition={{ ...orbTransition, duration: 20 }}
      />
      <div className="grid-layer" />
      <div className="noise-layer" />
    </div>
  );
};

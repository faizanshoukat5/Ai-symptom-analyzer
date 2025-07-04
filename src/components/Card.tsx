import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function Card({ children, className = '', animate = true }: CardProps) {
  return animate ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 ${className}`}
    >
      {children}
    </motion.div>
  ) : (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
      {children}
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  showDog?: boolean;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  text = 'Загрузка...', 
  showDog = true,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'caption',
    md: 'body',
    lg: 'title',
  };

  const dogSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <motion.div 
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Физическая анимация загрузки */}
      <div className="relative mb-4">
        <motion.div
          className={`${sizeClasses[size]} mx-auto`}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full border-4 border-surface-2 rounded-full">
            <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </motion.div>
        
        {/* Собака в центре */}
        {showDog && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className={dogSizes[size]}>🐕</span>
          </motion.div>
        )}
      </div>
      
      {text && (
        <motion.p 
          className={`text-secondary ${textSizes[size]}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}
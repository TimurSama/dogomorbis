'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ size = 'md', showLabel = false, className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative ${sizeClasses[size]} 
        flex items-center justify-center
        bg-[var(--surface)] border border-[var(--outline)]
        rounded-xl
        hover:bg-[var(--surface-2)]
        focus:outline-none focus:ring-2 focus:ring-[var(--honey)]/20
        transition-all duration-200 ease-out
        touch-target
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        rotate: isDark ? 180 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: [0.2, 0.8, 0.2, 1],
      }}
      aria-label={`Переключить на ${isDark ? 'светлую' : 'тёмную'} тему`}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          opacity: isDark ? 0 : 1,
          scale: isDark ? 0.8 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: [0.2, 0.8, 0.2, 1],
        }}
      >
        <Sun 
          size={iconSizes[size]} 
          className="text-[var(--warn)]"
        />
      </motion.div>
      
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={{
          opacity: isDark ? 1 : 0,
          scale: isDark ? 1 : 0.8,
        }}
        transition={{
          duration: 0.2,
          ease: [0.2, 0.8, 0.2, 1],
        }}
      >
        <Moon 
          size={iconSizes[size]} 
          className="text-[var(--sky)]"
        />
      </motion.div>

      {showLabel && (
        <span className="ml-2 text-sm font-medium text-[var(--text)]">
          {isDark ? 'Тёмная' : 'Светлая'}
        </span>
      )}
    </motion.button>
  );
}


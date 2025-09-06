'use client';

import { motion } from 'framer-motion';
import { Loader2, Dog } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export function LoadingScreen({ message = 'Загрузка...', showLogo = true }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 from-gray-900 to-gray-800">
      <div className="text-center">
        {showLogo && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <Dog className="h-16 w-16 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-white mb-2">
              Dogymorbis
            </h1>
            <p className="text-gray-600 text-gray-400">
              Сообщество собачников
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="mb-4"
          >
            <Loader2 className="h-8 w-8 text-primary-600" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 text-gray-400 text-lg"
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Дополнительные анимации */}
        <motion.div
          className="mt-8 flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
} 
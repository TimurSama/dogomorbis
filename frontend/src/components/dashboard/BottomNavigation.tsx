'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { DogHouse } from '@/components/icons/DogHouse';
import { Tree } from '@/components/icons/Tree';
import { PawHeart } from '@/components/icons/PawHeart';
import { EarBubble } from '@/components/icons/EarBubble';
import { Medallion } from '@/components/icons/Medallion';

interface BottomNavigationProps {
  activeScreen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';
  onScreenChange: (screen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings') => void;
  isGuest?: boolean;
}

export function BottomNavigation({ activeScreen, onScreenChange, isGuest = false }: BottomNavigationProps) {
  const navigationItems = [
    {
      id: 'map' as const,
      icon: DogHouse,
      label: 'Главная',
    },
    {
      id: 'feed' as const,
      icon: Tree,
      label: 'Карта',
    },
    {
      id: 'profile' as const,
      icon: PawHeart,
      label: 'Лента',
    },
    {
      id: 'wallet' as const,
      icon: EarBubble,
      label: 'Сообщения',
    },
    {
      id: 'shop' as const,
      icon: Medallion,
      label: 'Профиль',
    },
  ];

  return (
    <div className="surface border-t border-outline safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`state-layer flex flex-col items-center gap-1 px-2 py-2 rounded-[var(--radius-sm)] transition-transform ${
                isActive 
                  ? 'bg-[var(--surface-2)] text-[color:var(--text)] elev-1' 
                  : 'text-[color:var(--dim)]'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-6 h-6" />
              </motion.div>
              <span className="text-xs font-medium hidden sm:block">
                {item.label}
              </span>
            </motion.button>
          );
        })}
        
        {/* Кнопка быстрого действия - только для авторизованных */}
        {!isGuest && (
          <motion.button
            className="state-layer flex flex-col items-center justify-center py-2 px-2 md:px-3 rounded-[var(--radius-md)] bg-[var(--honey)] text-[#1C1A19] elev-1"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            aria-label="Добавить"
          >
            <Plus className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-xs mt-1 font-medium hidden sm:block">Добавить</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
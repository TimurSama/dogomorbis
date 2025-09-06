'use client';

import { motion } from 'framer-motion';
import { Map, Rss, User, Wallet, Plus, ShoppingBag, UserPlus, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeScreen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';
  onScreenChange: (screen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings') => void;
  isGuest?: boolean;
}

export function BottomNavigation({ activeScreen, onScreenChange, isGuest = false }: BottomNavigationProps) {
  const navigationItems = [
    {
      id: 'map' as const,
      icon: Map,
      label: 'Карта',
      color: 'text-blue-600',
    },
    {
      id: 'feed' as const,
      icon: Rss,
      label: 'Лента',
      color: 'text-green-600',
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Профиль',
      color: 'text-purple-600',
    },
    {
      id: 'wallet' as const,
      icon: Wallet,
      label: 'Кошелёк',
      color: 'text-yellow-600',
    },
    {
      id: 'shop' as const,
      icon: ShoppingBag,
      label: 'Магазин',
      color: 'text-orange-600',
    },
    {
      id: 'friends' as const,
      icon: UserPlus,
      label: 'Друзья',
      color: 'text-pink-600',
    },
    {
      id: 'group' as const,
      icon: Users,
      label: 'Группы',
      color: 'text-indigo-600',
    },
    {
      id: 'messages' as const,
      icon: MessageSquare,
      label: 'Сообщения',
      color: 'text-teal-600',
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-pink-200/30 px-2 py-1 md:px-4 md:py-2 safe-area-bottom soft-shadow-lg pencil-border fur-texture">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-2 md:px-3 rounded-2xl transition-all duration-300 min-h-[44px] min-w-[44px] ${
                isActive
                  ? 'bg-gradient-to-r from-pink-200 to-purple-200 text-purple-700 soft-shadow'
                  : 'text-purple-500 hover:bg-pink-100/50 hover:text-purple-600'
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
                <Icon className={`h-5 w-5 md:h-6 md:w-6 ${isActive ? 'text-purple-700' : 'text-purple-500'}`} />
              </motion.div>
              <span className={`text-xs mt-1 font-medium hidden sm:block ${
                isActive ? 'text-purple-700' : 'text-purple-500'
              }`}>
                {item.label}
              </span>
              
              {/* Индикатор активности */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 w-1 h-1 bg-purple-500 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
        
        {/* Кнопка быстрого действия - только для авторизованных */}
        {!isGuest && (
          <motion.button
            className="flex flex-col items-center justify-center py-2 px-2 md:px-3 rounded-2xl bg-gradient-to-r from-pink-300 to-purple-400 text-purple-800 hover:from-pink-400 hover:to-purple-500 transition-all duration-300 min-h-[44px] min-w-[44px] soft-shadow"
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            <Plus className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-xs mt-1 font-medium hidden sm:block">Добавить</span>
          </motion.button>
        )}
      </div>
    </div>
  );
} 
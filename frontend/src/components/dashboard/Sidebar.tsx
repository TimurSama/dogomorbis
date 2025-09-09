'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Map, 
  Rss, 
  User, 
  Wallet, 
  Settings, 
  HelpCircle, 
  Info,
  Users,
  Calendar,
  BookOpen,
  Award,
  Gift,
  MessageSquare,
  ShoppingBag,
  UserPlus
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onScreenChange: (screen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings') => void;
  activeScreen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';
  isGuest?: boolean;
  onShowAuth?: () => void;
}

export function Sidebar({ isOpen, onClose, onScreenChange, activeScreen, isGuest = false, onShowAuth }: SidebarProps) {
  const navigationItems = [
    {
      id: 'map' as const,
      icon: Map,
      label: 'Карта',
    },
    {
      id: 'feed' as const,
      icon: Rss,
      label: 'Лента',
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Профиль',
    },
    {
      id: 'wallet' as const,
      icon: Wallet,
      label: 'Кошелёк',
    },
    {
      id: 'shop' as const,
      icon: ShoppingBag,
      label: 'Магазин',
    },
    {
      id: 'friends' as const,
      icon: UserPlus,
      label: 'Друзья',
    },
    {
      id: 'group' as const,
      icon: Users,
      label: 'Группы',
    },
    {
      id: 'messages' as const,
      icon: MessageSquare,
      label: 'Сообщения',
    },
  ];

  const additionalItems = [
    {
      id: 'events',
      icon: Calendar,
      label: 'События',
    },
    {
      id: 'community',
      icon: Users,
      label: 'Сообщество',
    },
    {
      id: 'diary',
      icon: BookOpen,
      label: 'Дневник',
    },
    {
      id: 'achievements',
      icon: Award,
      label: 'Достижения',
    },
    {
      id: 'referrals',
      icon: Gift,
      label: 'Рефералы',
    },
    {
      id: 'support',
      icon: MessageSquare,
      label: 'Поддержка',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="sidebar-content fixed left-0 top-0 h-full w-80 z-50 bg-[var(--surface)] border-r border-[var(--outline)] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--outline)]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--honey)] rounded-[var(--radius-lg)] flex items-center justify-center">
                  <span className="text-[#1C1A19] font-bold text-lg">🐕</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--text)]">
                    Dogymorbis
                  </h2>
                  <p className="text-sm text-[color:var(--dim)]">
                    Сообщество собачников
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-[var(--surface-2)] rounded-[var(--radius-sm)] transition-colors touch-target"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Закрыть меню"
              >
                <X className="w-6 h-6 text-[color:var(--dim)]" />
              </motion.button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-[var(--outline)]">
              {isGuest ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[var(--surface-2)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-[color:var(--dim)]" />
                  </div>
                  <h3 className="text-sm font-medium text-[color:var(--text)] mb-1">
                    Гостевой режим
                  </h3>
                  <p className="text-xs text-[color:var(--dim)] mb-3">
                    Войдите для полного доступа
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        onShowAuth?.();
                        onClose();
                      }}
                      className="w-full bg-[var(--honey)] text-[#1C1A19] px-4 py-2 rounded-[var(--radius-md)] border border-[var(--outline)] text-sm"
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => {
                        onShowAuth?.();
                        onClose();
                      }}
                      className="w-full bg-transparent text-[color:var(--text)] border border-[color:var(--line)] px-4 py-2 rounded-[var(--radius-md)] text-sm"
                    >
                      Регистрация
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[var(--surface-2)] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-[color:var(--dim)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[color:var(--text)]">
                      Пользователь
                    </h3>
                    <p className="text-xs text-[color:var(--dim)]">
                      @username
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-[color:var(--dim)] uppercase tracking-wider mb-3">
                Основное
              </h3>
              
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeScreen === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onScreenChange(item.id);
                        onClose();
                      }}
                      className={`sidebar-item ${isActive ? 'active' : ''}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="sidebar-item-icon" />
                      <span className="text-sm font-medium">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Additional Features */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-[color:var(--dim)] uppercase tracking-wider mb-3">
                Дополнительно
              </h3>
              
              <div className="space-y-1">
                {additionalItems.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => {
                        onScreenChange(item.id as any);
                        onClose();
                      }}
                      className="sidebar-item"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="sidebar-item-icon" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto p-4 border-t border-border">
              <div className="space-y-2">
                <button
                  className="sidebar-item"
                  onClick={() => {
                    onScreenChange('settings');
                    onClose();
                  }}
                >
                  <Settings className="sidebar-item-icon" />
                  <span className="text-sm font-medium">Настройки</span>
                </button>
                
                <button
                  className="sidebar-item"
                  onClick={() => {
                    onScreenChange('support');
                    onClose();
                  }}
                >
                  <HelpCircle className="sidebar-item-icon" />
                  <span className="text-sm font-medium">Помощь</span>
                </button>
                
                <button className="sidebar-item">
                  <Info className="sidebar-item-icon" />
                  <span className="text-sm font-medium">О приложении</span>
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <p className="text-xs text-secondary">
                  Dogymorbis v0.21.0
                </p>
                <ThemeToggle size="sm" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
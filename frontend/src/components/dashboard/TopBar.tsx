'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  Settings, 
  User,
  Map,
  Rss,
  Wallet,
  LogOut,
  ShoppingBag,
  UserPlus,
  Users,
  MessageSquare,
  Calendar,
  BookOpen,
  Award,
  Gift,
  HelpCircle
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { DogHouse } from '@/components/icons/DogHouse';

interface TopBarProps {
  onMenuClick: () => void;
  currentScreen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';
  isGuest?: boolean;
  onShowAuth?: () => void;
}

export function TopBar({ onMenuClick, currentScreen, isGuest = false, onShowAuth }: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const screenTitles = {
    map: 'Карта',
    feed: 'Лента',
    profile: 'Профиль',
    wallet: 'Кошелёк',
    shop: 'Магазин',
    friends: 'Друзья',
    group: 'Группы',
    messages: 'Сообщения',
    events: 'События',
    community: 'Сообщество',
    diary: 'Дневник',
    achievements: 'Достижения',
    referrals: 'Рефералы',
    support: 'Поддержка',
    settings: 'Настройки',
  };

  const screenIcons = {
    map: Map,
    feed: Rss,
    profile: User,
    wallet: Wallet,
    shop: ShoppingBag,
    friends: UserPlus,
    group: Users,
    messages: MessageSquare,
    events: Calendar,
    community: Users,
    diary: BookOpen,
    achievements: Award,
    referrals: Gift,
    support: HelpCircle,
    settings: Settings,
  };

  const CurrentIcon = screenIcons[currentScreen];

  return (
    <div className="surface border-b border-outline px-4 py-3 safe-area-top">
      <div className="flex items-center justify-between">
        {/* Левая часть */}
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={onMenuClick}
            className="state-layer p-2 rounded-[var(--radius-sm)] transition-colors touch-target"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Открыть меню"
          >
            <Menu className="w-6 h-6" />
          </motion.button>

          <div className="flex items-center space-x-2">
            <DogHouse className="w-6 h-6 text-[color:var(--text)]" />
            <h1 className="text-lg font-semibold text-[color:var(--text)]">
              {screenTitles[currentScreen]}
            </h1>
          </div>
        </div>

        {/* Правая часть */}
        <div className="flex items-center space-x-2">
          {isGuest ? (
            /* Гостевой режим */
            <>
              <Button
                variant="ghost"
                onClick={onShowAuth}
              >
                Войти
              </Button>
              <Button
                variant="primary"
                onClick={onShowAuth}
              >
                Регистрация
              </Button>
            </>
          ) : (
            /* Обычный режим */
            <>
              {/* Поиск */}
              <motion.button 
                className="hidden sm:flex p-2 hover:bg-[var(--surface-2)] rounded-[var(--radius-md)] transition-colors touch-target"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Поиск"
              >
                <Search className="w-6 h-6 text-[var(--text)]" />
              </motion.button>

              {/* Уведомления */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-[var(--surface-2)] rounded-[var(--radius-md)] transition-colors touch-target relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Уведомления"
                >
                  <Bell className="w-6 h-6 text-[var(--text)]" />
                  {/* Индикатор непрочитанных */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--danger)] rounded-full border-2 border-[var(--surface)]"></span>
                </motion.button>

                {/* Выпадающее меню уведомлений */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--outline)] rounded-[var(--radius-lg)] shadow-lg z-50"
                    >
                      <div className="p-4 border-b border-[var(--outline)]">
                        <h3 className="text-sm font-medium text-[var(--text)]">
                          Уведомления
                        </h3>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-4 text-center text-[var(--text-secondary)]">
                          Нет новых уведомлений
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Переключатель темы */}
              <ThemeToggle size="sm" />

              {/* Пользовательское меню */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:bg-[var(--surface-2)] rounded-[var(--radius-md)] transition-colors touch-target"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Меню пользователя"
                >
                  <User className="w-6 h-6 text-[var(--text)]" />
                </motion.button>

                {/* Выпадающее меню пользователя */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--outline)] rounded-[var(--radius-lg)] shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-[var(--outline)]">
                        <p className="text-sm font-medium text-[var(--text)]">
                          Пользователь
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          @username
                        </p>
                      </div>

                      <div className="py-1">
                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
                          <Settings className="h-4 w-4" />
                          <span>Настройки</span>
                        </button>

                        <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-[var(--danger)] hover:bg-[var(--surface-2)] transition-colors">
                          <LogOut className="h-4 w-4" />
                          <span>Выйти</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
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
  Shield,
  Crown,
  Users,
  Calendar,
  BookOpen,
  Award,
  Gift,
  MessageSquare,
  ShoppingBag,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onScreenChange: (screen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings') => void;
  activeScreen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';
  isGuest?: boolean;
  onShowAuth?: () => void;
}

export function Sidebar({ isOpen, onClose, onScreenChange, activeScreen, isGuest = false, onShowAuth }: SidebarProps) {
  const { user } = useAuthStore();

  const navigationItems = [
    {
      id: 'map' as const,
      icon: Map,
      label: 'Карта',
      description: 'Найдите собак и предметы поблизости',
    },
    {
      id: 'feed' as const,
      icon: Rss,
      label: 'Лента',
      description: 'Последние публикации сообщества',
    },
    {
      id: 'profile' as const,
      icon: User,
      label: 'Профиль',
      description: 'Управление аккаунтом и собаками',
    },
    {
      id: 'wallet' as const,
      icon: Wallet,
      label: 'Кошелёк',
      description: 'Баланс и транзакции',
    },
    {
      id: 'shop' as const,
      icon: ShoppingBag,
      label: 'Магазин',
      description: 'Товары и награды',
    },
    {
      id: 'friends' as const,
      icon: UserPlus,
      label: 'Друзья',
      description: 'Поиск и знакомства',
    },
    {
      id: 'group' as const,
      icon: Users,
      label: 'Группы',
      description: 'Сообщества и обсуждения',
    },
    {
      id: 'messages' as const,
      icon: MessageSquare,
      label: 'Сообщения',
      description: 'Чаты и уведомления',
    },
  ];

  const additionalItems = [
    {
      id: 'events',
      icon: Calendar,
      label: 'События',
      description: 'Ближайшие мероприятия',
      badge: '3',
    },
    {
      id: 'community',
      icon: Users,
      label: 'Сообщество',
      description: 'Другие собачники',
    },
    {
      id: 'diary',
      icon: BookOpen,
      label: 'Дневник',
      description: 'Записи о прогулках',
    },
    {
      id: 'achievements',
      icon: Award,
      label: 'Достижения',
      description: 'Ваши награды',
    },
    {
      id: 'referrals',
      icon: Gift,
      label: 'Рефералы',
      description: 'Пригласите друзей',
    },
    {
      id: 'support',
      icon: MessageSquare,
      label: 'Поддержка',
      description: 'Помощь и обратная связь',
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-md border-r border-pink-200/30 z-50 overflow-y-auto soft-shadow-lg fur-texture pencil-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-pink-200/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-400 rounded-lg flex items-center justify-center soft-shadow">
                  <span className="text-white font-bold text-lg">🐕</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-purple-600 font-display">
                    Dogymorbis
                  </h2>
                  <p className="text-sm text-pink-500">
                    Сообщество собачников
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-pink-200/30">
              {isGuest ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-3 soft-shadow">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 mb-1">
                    Гостевой режим
                  </h3>
                  <p className="text-xs text-purple-600 mb-3">
                    Войдите для полного доступа
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        onShowAuth?.();
                        onClose();
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      Войти
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onShowAuth?.();
                        onClose();
                      }}
                      className="w-full"
                    >
                      Регистрация
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-xs text-purple-600">
                      @{user?.username}
                    </p>
                    {user?.isPremium && (
                      <div className="flex items-center mt-1">
                        <Crown className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">
                          Premium
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
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
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-purple-50 text-purple-600'
                          : 'text-gray-800 hover:bg-pink-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-purple-600' : 'text-purple-500'}`} />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? 'text-purple-600' : 'text-gray-800'}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-purple-600">
                          {item.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Additional Features */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
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
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-800 hover:bg-pink-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-5 w-5 text-purple-500" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.label}</p>
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-purple-600">
                          {item.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-800 hover:text-purple-600 hover:bg-pink-50"
                  onClick={() => {
                    onScreenChange('settings');
                    onClose();
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Настройки
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-800 hover:text-purple-600 hover:bg-pink-50"
                  onClick={() => {
                    onScreenChange('support');
                    onClose();
                  }}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Помощь
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-800 hover:text-purple-600 hover:bg-pink-50"
                >
                  <Info className="h-4 w-4 mr-2" />
                  О приложении
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-pink-200/30">
                <p className="text-xs text-purple-600 text-center">
                  Dogymorbis v0.21.0
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
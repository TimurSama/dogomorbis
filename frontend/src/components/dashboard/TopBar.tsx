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
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { toast } from 'react-hot-toast';

interface TopBarProps {
  onMenuClick: () => void;
  currentScreen: 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';
  isGuest?: boolean;
  onShowAuth?: () => void;
}

export function TopBar({ onMenuClick, currentScreen, isGuest = false, onShowAuth }: TopBarProps) {
  const { user, logout } = useAuthStore();
  const { unreadCount, notifications, markAsRead } = useNotificationStore();
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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Вы успешно вышли из системы');
    } catch (error) {
      toast.error('Ошибка при выходе из системы');
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
    setShowNotifications(false);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-pink-200/30 px-4 py-3 soft-shadow fur-texture pencil-border">
      <div className="flex items-center justify-between">
        {/* Левая часть */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-pink-100/50 gentle-float"
          >
            <Menu className="h-5 w-5 text-purple-600" />
          </Button>

          <div className="flex items-center space-x-2">
            <CurrentIcon className="h-6 w-6 text-purple-600" />
            <h1 className="text-lg font-semibold text-purple-700 font-display">
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
                variant="outline"
                size="sm"
                onClick={onShowAuth}
                className="text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                Войти
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onShowAuth}
                className="bg-gradient-to-r from-pink-300 to-purple-400 hover:from-pink-400 hover:to-purple-500 text-purple-800"
              >
                Регистрация
              </Button>
            </>
          ) : (
            /* Обычный режим */
            <>
              {/* Поиск */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Уведомления */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Выпадающее меню уведомлений */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Уведомления
                        </h3>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Нет новых уведомлений
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id)}
                              className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                    {new Date(notification.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {notifications.length > 5 && (
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-primary-600 hover:text-primary-700"
                          >
                            Показать все уведомления
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Пользовательское меню */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>

                {/* Выпадающее меню пользователя */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          @{user?.username}
                        </p>
                      </div>
                      
                      <div className="py-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start px-3 py-2"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Настройки
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLogout}
                          className="w-full justify-start px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Выйти
                        </Button>
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
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { MapScreen } from './MapScreen';
import { FeedScreen } from './FeedScreen';
import { ProfileScreen } from './ProfileScreen';
import { WalletScreen } from './WalletScreen';
import { ShopScreen } from './ShopScreen';
import { FriendsScreen } from './FriendsScreen';
import { GroupScreen } from './GroupScreen';
import { MessagesScreen } from './MessagesScreen';
import { EventsScreen } from './EventsScreen';
import { CommunityScreen } from './CommunityScreen';
import { DiaryScreen } from './DiaryScreen';
import { AchievementsScreen } from './AchievementsScreen';
import { ReferralsScreen } from './ReferralsScreen';
import { SupportScreen } from './SupportScreen';
import { SettingsScreen } from './SettingsScreen';
import { BottomNavigation } from './BottomNavigation';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

type Screen = 'map' | 'feed' | 'profile' | 'wallet' | 'shop' | 'friends' | 'group' | 'messages' | 'events' | 'community' | 'diary' | 'achievements' | 'referrals' | 'support' | 'settings';

interface GuestDashboardProps {
  onShowAuth: () => void;
}

export function GuestDashboard({ onShowAuth }: GuestDashboardProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>('map');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Обработчик свайпа для закрытия sidebar
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    onSwipedLeft: () => {
      if (sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    trackMouse: true,
  });

  // Закрытие sidebar при клике на overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen) {
        const target = event.target as Element;
        if (!target.closest('.sidebar-content')) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const screens = {
    map: <MapScreen />,
    feed: <FeedScreen />,
    profile: <ProfileScreen isGuest={true} onShowAuth={onShowAuth} />,
    wallet: <WalletScreen isGuest={true} onShowAuth={onShowAuth} />,
    shop: <ShopScreen />,
    friends: <FriendsScreen />,
    group: <GroupScreen />,
    messages: <MessagesScreen />,
    events: <EventsScreen />,
    community: <CommunityScreen />,
    diary: <DiaryScreen />,
    achievements: <AchievementsScreen />,
    referrals: <ReferralsScreen />,
    support: <SupportScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div 
      className="h-screen flex flex-col bg-[var(--bg)] overflow-hidden"
      {...swipeHandlers}
    >
      {/* Верхняя панель */}
      <TopBar 
        onMenuClick={() => setSidebarOpen(true)}
        currentScreen={activeScreen}
        isGuest={true}
        onShowAuth={onShowAuth}
      />

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Боковая панель - скрыта по умолчанию, открывается по клику на гамбургер */}
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onScreenChange={setActiveScreen}
          activeScreen={activeScreen}
          isGuest={true}
          onShowAuth={onShowAuth}
        />

        {/* Контент экрана */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
              className="h-full overflow-hidden"
            >
              {screens[activeScreen]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Нижняя навигация - только на мобильных */}
      <div className="lg:hidden">
        <BottomNavigation
          activeScreen={activeScreen}
          onScreenChange={setActiveScreen}
          isGuest={true}
        />
      </div>
    </div>
  );
}
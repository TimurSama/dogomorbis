'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { GuestDashboard } from '@/components/dashboard/GuestDashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function HomePage() {
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const { isLoading: userLoading } = useUserStore();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Показываем загрузку пока инициализируем приложение
  if (authLoading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        {isAuthenticated ? (
          <Dashboard />
        ) : showAuth ? (
          <AuthScreen onBackToGuest={() => setShowAuth(false)} />
        ) : (
          <GuestDashboard onShowAuth={() => setShowAuth(true)} />
        )}
      </div>
    </ErrorBoundary>
  );
} 
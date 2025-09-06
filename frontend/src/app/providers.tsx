'use client';

import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useMapStore } from '@/stores/map';
import { useNotificationStore } from '@/stores/notification';
import { useWebSocketStore } from '@/stores/websocket';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут
            cacheTime: 10 * 60 * 1000, // 10 минут
            retry: (failureCount, error: any) => {
              // Не повторяем запросы для 4xx ошибок
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <MapProvider>
            <NotificationProvider>
              <WebSocketProvider>
                {children}
              </WebSocketProvider>
            </NotificationProvider>
          </MapProvider>
        </UserProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

// Провайдер для аутентификации
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  // Инициализируем аутентификацию при загрузке приложения
  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

// Провайдер для пользователя
function UserProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useUserStore();

  // Инициализируем данные пользователя
  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

// Провайдер для карты
function MapProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useMapStore();

  // Инициализируем карту
  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

// Провайдер для уведомлений
function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { initialize } = useNotificationStore();

  // Инициализируем уведомления
  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

// Провайдер для WebSocket
function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { connect, disconnect } = useWebSocketStore();

  // Подключаемся к WebSocket при загрузке приложения
  useEffect(() => {
    connect();
    
    // Отключаемся при размонтировании
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return <>{children}</>;
} 
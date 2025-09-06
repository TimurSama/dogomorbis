import { create } from 'zustand';

// Типы уведомлений
export interface Notification {
  id: string;
  type: 'MATCH' | 'INVITE' | 'ACHIEVEMENT' | 'LEVEL_UP' | 'REFERRAL' | 'DAO' | 'SYSTEM' | 'PARTNER';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  isSent: boolean;
  createdAt: string;
  readAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  // Инициализация
  initialize: () => Promise<void>;
  
  // Загрузка уведомлений
  fetchNotifications: () => Promise<void>;
  
  // Управление уведомлениями
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  
  // Добавление уведомления
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  
  // Состояние
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Сброс состояния
  reset: () => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Начальное состояние
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Инициализация
  initialize: async () => {
    // Пока ничего не делаем, можно добавить логику инициализации позже
  },

  // Загрузка уведомлений
  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Заменить на реальный API вызов
      // const response = await notificationAPI.getNotifications();
      
      // Временные данные для демонстрации
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'MATCH',
          title: 'Новое совпадение!',
          message: 'Найдена собака для прогулки поблизости',
          isRead: false,
          isSent: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'ACHIEVEMENT',
          title: 'Достижение разблокировано!',
          message: 'Вы получили бейдж "Первая прогулка"',
          isRead: false,
          isSent: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      
      set({
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.isRead).length,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка загрузки уведомлений',
        isLoading: false,
      });
    }
  },

  // Отметить как прочитанное
  markAsRead: async (id) => {
    try {
      // TODO: API вызов для отметки как прочитанное
      // await notificationAPI.markAsRead(id);
      
      set((state) => ({
        notifications: state.notifications.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка обновления уведомления',
      });
    }
  },

  // Отметить все как прочитанные
  markAllAsRead: async () => {
    try {
      // TODO: API вызов для отметки всех как прочитанные
      // await notificationAPI.markAllAsRead();
      
      set((state) => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка обновления уведомлений',
      });
    }
  },

  // Удалить уведомление
  deleteNotification: async (id) => {
    try {
      // TODO: API вызов для удаления уведомления
      // await notificationAPI.deleteNotification(id);
      
      set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: state.unreadCount - (notification?.isRead ? 0 : 1),
        };
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка удаления уведомления',
      });
    }
  },

  // Добавить уведомление
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + (newNotification.isRead ? 0 : 1),
    }));
  },

  // Управление состоянием
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Сброс состояния
  reset: () => set({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  }),
})); 
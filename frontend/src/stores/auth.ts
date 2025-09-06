import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isPremium: boolean;
  isVerified: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  // Инициализация
  initialize: () => Promise<void>;
  
  // Аутентификация
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  
  // Управление токенами
  refreshTokens: () => Promise<void>;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  
  // Управление пользователем
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  clearUser: () => void;
  
  // Обработка ошибок
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Состояние загрузки
  setLoading: (loading: boolean) => void;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Инициализация
      initialize: async () => {
        const { tokens } = get();
        
        if (tokens?.accessToken) {
          try {
            set({ isLoading: true });
            
            // Проверяем валидность токена
            const response = await authAPI.verify();
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // Токен недействителен, очищаем состояние
            get().clearTokens();
            get().clearUser();
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },

      // Вход
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authAPI.login({
            email,
            password,
          });
          
          const { user, tokens } = response.data;
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Ошибка входа',
            isLoading: false,
          });
          throw error;
        }
      },

      // Регистрация
      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authAPI.register(userData);
          
          const { user, tokens } = response.data;
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Ошибка регистрации',
            isLoading: false,
          });
          throw error;
        }
      },

      // Выход
      logout: async () => {
        try {
          const { tokens } = get();
          
          if (tokens?.accessToken) {
            await authAPI.logout();
          }
        } catch (error) {
          // Игнорируем ошибки при выходе
          console.error('Logout error:', error);
        } finally {
          get().clearTokens();
          get().clearUser();
        }
      },

      // Обновление токенов
      refreshTokens: async () => {
        const { tokens } = get();
        
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const response = await authAPI.refresh({
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens = response.data;
          set({ tokens: newTokens });
        } catch (error) {
          // Не удалось обновить токены, очищаем состояние
          get().clearTokens();
          get().clearUser();
          throw error;
        }
      },

      // Установка токенов
      setTokens: (tokens: AuthTokens) => {
        set({ tokens });
      },

      // Очистка токенов
      clearTokens: () => {
        set({ tokens: null });
      },

      // Установка пользователя
      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      // Обновление пользователя
      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },

      // Очистка пользователя
      clearUser: () => {
        set({ user: null, isAuthenticated: false });
      },

      // Установка ошибки
      setError: (error: string | null) => {
        set({ error });
      },

      // Очистка ошибки
      clearError: () => {
        set({ error: null });
      },

      // Установка состояния загрузки
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 
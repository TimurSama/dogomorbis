import { create } from 'zustand';
import { userAPI, dogAPI } from '@/lib/api';

// Типы данных
interface Dog {
  id: string;
  name: string;
  breed?: string;
  age?: number;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  psychotype: 'EXTROVERT' | 'INTROVERT' | 'AMBIVERT' | 'UNKNOWN';
  isPremium: boolean;
  isVerified: boolean;
  isParent: boolean;
  parentModeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  profile: UserProfile | null;
  dogs: Dog[];
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  // Инициализация
  initialize: () => Promise<void>;
  
  // Загрузка профиля
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  
  // Управление собаками
  fetchDogs: () => Promise<void>;
  createDog: (data: any) => Promise<void>;
  updateDog: (id: string, data: any) => Promise<void>;
  deleteDog: (id: string) => Promise<void>;
  
  // Состояние
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Сброс состояния
  reset: () => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set, get) => ({
  // Начальное состояние
  profile: null,
  dogs: [],
  isLoading: false,
  error: null,

  // Инициализация
  initialize: async () => {
    // Пока ничего не делаем, можно добавить логику инициализации позже
  },

  // Загрузка профиля пользователя
  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await userAPI.getProfile();
      
      set({
        profile: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка загрузки профиля',
        isLoading: false,
      });
    }
  },

  // Обновление профиля
  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await userAPI.updateProfile(data);
      
      set({
        profile: { ...get().profile, ...response.data },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка обновления профиля',
        isLoading: false,
      });
    }
  },

  // Загрузка собак пользователя
  fetchDogs: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dogAPI.getDogs();
      
      set({
        dogs: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка загрузки собак',
        isLoading: false,
      });
    }
  },

  // Создание новой собаки
  createDog: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dogAPI.createDog(data);
      
      set({
        dogs: [...get().dogs, response.data],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка создания собаки',
        isLoading: false,
      });
    }
  },

  // Обновление собаки
  updateDog: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await dogAPI.updateDog(id, data);
      
      set({
        dogs: get().dogs.map(dog => 
          dog.id === id ? { ...dog, ...response.data } : dog
        ),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка обновления собаки',
        isLoading: false,
      });
    }
  },

  // Удаление собаки
  deleteDog: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      await dogAPI.deleteDog(id);
      
      set({
        dogs: get().dogs.filter(dog => dog.id !== id),
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка удаления собаки',
        isLoading: false,
      });
    }
  },

  // Управление состоянием
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Сброс состояния
  reset: () => set({
    profile: null,
    dogs: [],
    isLoading: false,
    error: null,
  }),
})); 
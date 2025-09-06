import { create } from 'zustand';
import { mapAPI } from '@/lib/api';

// Типы данных
interface Location {
  lat: number;
  lng: number;
}

interface NearbyUser {
  id: string;
  username: string;
  avatar?: string;
  location: Location;
  lastActive: string;
  dogs: Array<{
    name: string;
    breed?: string;
  }>;
  distance: number;
}

interface Collectible {
  id: string;
  type: 'BONE' | 'YARN_BALL' | 'TOY' | 'TREAT' | 'SPECIAL';
  location: Location;
  amount: number;
  maxAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  distance: number;
}

interface MapState {
  userLocation: Location | null;
  nearbyUsers: NearbyUser[];
  collectibles: Collectible[];
  isLoading: boolean;
  error: string | null;
  showUsers: boolean;
  showCollectibles: boolean;
}

interface MapActions {
  // Инициализация
  initialize: () => Promise<void>;
  
  // Геолокация
  setUserLocation: (location: Location) => void;
  getCurrentLocation: () => Promise<void>;
  
  // Пользователи поблизости
  fetchNearbyUsers: (location: Location) => Promise<void>;
  toggleShowUsers: () => void;
  
  // Коллекционные предметы
  fetchCollectibles: (location: Location) => Promise<void>;
  collectItem: (spawnId: string) => Promise<void>;
  toggleShowCollectibles: () => void;
  
  // Состояние
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Сброс состояния
  reset: () => void;
}

type MapStore = MapState & MapActions;

export const useMapStore = create<MapStore>((set, get) => ({
  // Начальное состояние
  userLocation: null,
  nearbyUsers: [],
  collectibles: [],
  isLoading: false,
  error: null,
  showUsers: true,
  showCollectibles: true,

  // Инициализация
  initialize: async () => {
    // Пока ничего не делаем, можно добавить логику инициализации позже
  },

  // Установка местоположения пользователя
  setUserLocation: (location) => {
    set({ userLocation: location });
  },

  // Получение текущего местоположения
  getCurrentLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      
      if (!navigator.geolocation) {
        throw new Error('Геолокация не поддерживается');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      set({ userLocation: location, isLoading: false });
      
      // Автоматически загружаем данные для нового местоположения
      await get().fetchNearbyUsers(location);
      await get().fetchCollectibles(location);
      
    } catch (error: any) {
      set({
        error: error.message || 'Ошибка получения местоположения',
        isLoading: false,
      });
    }
  },

  // Загрузка пользователей поблизости
  fetchNearbyUsers: async (location) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await mapAPI.getNearbyUsers(location);
      
      set({
        nearbyUsers: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка загрузки пользователей',
        isLoading: false,
      });
    }
  },

  // Переключение отображения пользователей
  toggleShowUsers: () => {
    set((state) => ({ showUsers: !state.showUsers }));
  },

  // Загрузка коллекционных предметов
  fetchCollectibles: async (location) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await mapAPI.getSpawns(location);
      
      set({
        collectibles: response.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка загрузки предметов',
        isLoading: false,
      });
    }
  },

  // Сбор предмета
  collectItem: async (spawnId) => {
    try {
      set({ isLoading: true, error: null });
      
      await mapAPI.collectItem(spawnId);
      
      // Удаляем собранный предмет из списка
      set((state) => ({
        collectibles: state.collectibles.filter(item => item.id !== spawnId),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Ошибка сбора предмета',
        isLoading: false,
      });
    }
  },

  // Переключение отображения коллекционных предметов
  toggleShowCollectibles: () => {
    set((state) => ({ showCollectibles: !state.showCollectibles }));
  },

  // Управление состоянием
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Сброс состояния
  reset: () => set({
    userLocation: null,
    nearbyUsers: [],
    collectibles: [],
    isLoading: false,
    error: null,
    showUsers: true,
    showCollectibles: true,
  }),
})); 
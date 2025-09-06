import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth';

// Базовый URL API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Типы для API ответов
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// Создаем экземпляр axios
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Если ошибка 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { tokens, refreshTokens } = useAuthStore.getState();
        
        if (tokens?.refreshToken) {
          await refreshTokens();
          
          // Повторяем оригинальный запрос с новым токеном
          const newTokens = useAuthStore.getState().tokens;
          if (newTokens?.accessToken) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Если обновление токена не удалось, выходим из системы
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Базовые функции для работы с API
export const apiClient = {
  // GET запрос
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.get(url, config).then(response => response.data);
  },

  // POST запрос
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.post(url, data, config).then(response => response.data);
  },

  // PUT запрос
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.put(url, data, config).then(response => response.data);
  },

  // PATCH запрос
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.patch(url, data, config).then(response => response.data);
  },

  // DELETE запрос
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.delete(url, config).then(response => response.data);
  },

  // Загрузка файлов
  upload: <T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    return api.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data);
  },
};

// API endpoints
export const endpoints = {
  // Аутентификация
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    verify: '/api/auth/verify',
    forgotPassword: '/api/auth/forgot-password',
    changePassword: '/api/auth/change-password',
  },

  // Пользователи
  users: {
    me: '/api/users/me',
    profile: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    search: '/api/users/search',
  },

  // Собаки
  dogs: {
    list: '/api/dogs',
    create: '/api/dogs',
    get: (id: string) => `/api/dogs/${id}`,
    update: (id: string) => `/api/dogs/${id}`,
    delete: (id: string) => `/api/dogs/${id}`,
    photos: (id: string) => `/api/dogs/${id}/photos`,
    goals: (id: string) => `/api/dogs/${id}/goals`,
  },

  // Совпадения
  matches: {
    suggestions: '/api/matches/suggestions',
    invite: '/api/matches/invite',
    accept: (id: string) => `/api/matches/${id}/accept`,
    decline: (id: string) => `/api/matches/${id}/decline`,
    history: '/api/matches/history',
  },

  // Карта
  map: {
    spawns: '/api/map/spawns',
    collect: '/api/map/collect',
    leaderboard: '/api/map/leaderboard',
    nearbyUsers: '/api/map/nearby-users',
  },

  // Лента
  feed: {
    posts: '/api/feed/posts',
    stories: '/api/feed/stories',
    like: (id: string) => `/api/feed/posts/${id}/like`,
    comment: (id: string) => `/api/feed/posts/${id}/comments`,
  },

  // Дневник
  journal: {
    entries: '/api/journal/entries',
    create: '/api/journal/entries',
    get: (id: string) => `/api/journal/entries/${id}`,
    update: (id: string) => `/api/journal/entries/${id}`,
    delete: (id: string) => `/api/journal/entries/${id}`,
  },

  // Цели
  goals: {
    list: '/api/goals',
    create: '/api/goals',
    get: (id: string) => `/api/goals/${id}`,
    update: (id: string) => `/api/goals/${id}`,
    delete: (id: string) => `/api/goals/${id}`,
    progress: (id: string) => `/api/goals/${id}/progress`,
  },

  // Кошелёк
  wallet: {
    balance: '/api/wallet/balance',
    transactions: '/api/wallet/transactions',
    redeem: '/api/wallet/redeem',
  },

  // Рефералы
  referral: {
    code: '/api/referral/code',
    claim: '/api/referral/claim',
    history: '/api/referral/history',
  },

  // DAO
  dao: {
    proposals: '/api/dao/proposals',
    create: '/api/dao/proposals',
    get: (id: string) => `/api/dao/proposals/${id}`,
    vote: (id: string) => `/api/dao/proposals/${id}/vote`,
    treasury: '/api/dao/treasury',
    stakes: '/api/dao/stakes',
  },

  // Партнёры
  partners: {
    profile: '/api/partners/profile',
    offers: '/api/partners/offers',
    analytics: '/api/partners/analytics',
  },

  // Админ
  admin: {
    users: '/api/admin/users',
    content: '/api/admin/content',
    partners: '/api/admin/partners',
    dao: '/api/admin/dao',
  },

  // AI Assistant
  ai: {
    query: '/api/ai/query',
    recommendations: '/api/ai/recommendations',
  },
};

// Специализированные API функции
export const authAPI = {
  register: (data: any) => apiClient.post(endpoints.auth.register, data),
  login: (data: any) => apiClient.post(endpoints.auth.login, data),
  logout: () => apiClient.post(endpoints.auth.logout),
  refresh: (data: any) => apiClient.post(endpoints.auth.refresh, data),
  verify: () => apiClient.get(endpoints.auth.verify),
  forgotPassword: (data: any) => apiClient.post(endpoints.auth.forgotPassword, data),
  changePassword: (data: any) => apiClient.post(endpoints.auth.changePassword, data),
};

export const userAPI = {
  getProfile: () => apiClient.get(endpoints.users.me),
  updateProfile: (data: any) => apiClient.patch(endpoints.users.me, data),
  searchUsers: (query: string) => apiClient.get(endpoints.users.search, { params: { q: query } }),
};

export const dogAPI = {
  getDogs: () => apiClient.get(endpoints.dogs.list),
  createDog: (data: any) => apiClient.post(endpoints.dogs.create, data),
  getDog: (id: string) => apiClient.get(endpoints.dogs.get(id)),
  updateDog: (id: string, data: any) => apiClient.put(endpoints.dogs.update(id), data),
  deleteDog: (id: string) => apiClient.delete(endpoints.dogs.delete(id)),
  uploadPhoto: (id: string, formData: FormData) => apiClient.upload(endpoints.dogs.photos(id), formData),
};

export const matchAPI = {
  getSuggestions: () => apiClient.get(endpoints.matches.suggestions),
  sendInvite: (data: any) => apiClient.post(endpoints.matches.invite, data),
  acceptMatch: (id: string) => apiClient.post(endpoints.matches.accept(id)),
  declineMatch: (id: string) => apiClient.post(endpoints.matches.decline(id)),
  getHistory: () => apiClient.get(endpoints.matches.history),
};

export const mapAPI = {
  getSpawns: (location: { lat: number; lng: number }) => 
    apiClient.get(endpoints.map.spawns, { params: location }),
  collectItem: (spawnId: string) => apiClient.post(endpoints.map.collect, { spawnId }),
  getLeaderboard: () => apiClient.get(endpoints.map.leaderboard),
  getNearbyUsers: (location: { lat: number; lng: number }) => 
    apiClient.get(endpoints.map.nearbyUsers, { params: location }),
};

export const feedAPI = {
  getPosts: (page = 1, limit = 10) => 
    apiClient.get(endpoints.feed.posts, { params: { page, limit } }),
  createPost: (data: any) => apiClient.post(endpoints.feed.posts, data),
  likePost: (id: string) => apiClient.post(endpoints.feed.like(id)),
  commentPost: (id: string, data: any) => apiClient.post(endpoints.feed.comment(id), data),
};

export const journalAPI = {
  getEntries: () => apiClient.get(endpoints.journal.entries),
  createEntry: (data: any) => apiClient.post(endpoints.journal.create, data),
  getEntry: (id: string) => apiClient.get(endpoints.journal.get(id)),
  updateEntry: (id: string, data: any) => apiClient.put(endpoints.journal.update(id), data),
  deleteEntry: (id: string) => apiClient.delete(endpoints.journal.delete(id)),
};

export const goalAPI = {
  getGoals: () => apiClient.get(endpoints.goals.list),
  createGoal: (data: any) => apiClient.post(endpoints.goals.create, data),
  getGoal: (id: string) => apiClient.get(endpoints.goals.get(id)),
  updateGoal: (id: string, data: any) => apiClient.put(endpoints.goals.update(id), data),
  deleteGoal: (id: string) => apiClient.delete(endpoints.goals.delete(id)),
  updateProgress: (id: string, progress: number) => 
    apiClient.patch(endpoints.goals.progress(id), { progress }),
};

export const walletAPI = {
  getBalance: () => apiClient.get(endpoints.wallet.balance),
  getTransactions: (page = 1, limit = 20) => 
    apiClient.get(endpoints.wallet.transactions, { params: { page, limit } }),
  redeemReward: (data: any) => apiClient.post(endpoints.wallet.redeem, data),
};

export const referralAPI = {
  getCode: () => apiClient.get(endpoints.referral.code),
  claimBonus: (code: string) => apiClient.post(endpoints.referral.claim, { code }),
  getHistory: () => apiClient.get(endpoints.referral.history),
};

export const daoAPI = {
  getProposals: () => apiClient.get(endpoints.dao.proposals),
  createProposal: (data: any) => apiClient.post(endpoints.dao.create, data),
  getProposal: (id: string) => apiClient.get(endpoints.dao.get(id)),
  vote: (id: string, vote: 'YES' | 'NO' | 'ABSTAIN') => 
    apiClient.post(endpoints.dao.vote(id), { vote }),
  getTreasury: () => apiClient.get(endpoints.dao.treasury),
  getStakes: () => apiClient.get(endpoints.dao.stakes),
};

export const partnerAPI = {
  getProfile: () => apiClient.get(endpoints.partners.profile),
  getOffers: () => apiClient.get(endpoints.partners.offers),
  getAnalytics: () => apiClient.get(endpoints.partners.analytics),
};

export const adminAPI = {
  getUsers: () => apiClient.get(endpoints.admin.users),
  getContent: () => apiClient.get(endpoints.admin.content),
  getPartners: () => apiClient.get(endpoints.admin.partners),
  getDao: () => apiClient.get(endpoints.admin.dao),
};

export const aiAPI = {
  query: (data: any) => apiClient.post(endpoints.ai.query, data),
  getRecommendations: () => apiClient.get(endpoints.ai.recommendations),
};

export { api };
export default api; 
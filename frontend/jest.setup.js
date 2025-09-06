import '@testing-library/jest-dom';

// Мокаем Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Мокаем Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Мокаем Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    img: ({ ...props }) => <img {...props} />,
  },
  AnimatePresence: ({ children }) => children,
}));

// Мокаем react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Мокаем zustand stores
jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    setUser: jest.fn(),
    updateUser: jest.fn(),
    clearUser: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    setLoading: jest.fn(),
  })),
}));

jest.mock('@/stores/user', () => ({
  useUserStore: jest.fn(() => ({
    user: null,
    dogs: [],
    isLoading: false,
    error: null,
    fetchUser: jest.fn(),
    fetchDogs: jest.fn(),
    updateUser: jest.fn(),
    addDog: jest.fn(),
    updateDog: jest.fn(),
    deleteDog: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
    setLoading: jest.fn(),
  })),
}));

jest.mock('@/stores/map', () => ({
  useMapStore: jest.fn(() => ({
    userLocation: null,
    nearbyUsers: [],
    collectibles: [],
    isLoading: false,
    error: null,
    lastUpdated: null,
    initialize: jest.fn(),
    setUserLocation: jest.fn(),
    updateUserLocation: jest.fn(),
    fetchNearbyUsers: jest.fn(),
    fetchCollectibles: jest.fn(),
    refreshData: jest.fn(),
    collectItem: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn(),
  })),
}));

// Мокаем API
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  authApi: {
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
    verify: jest.fn(),
    forgotPassword: jest.fn(),
    changePassword: jest.fn(),
  },
  usersApi: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
  },
  dogsApi: {
    getDogs: jest.fn(),
    getDog: jest.fn(),
    createDog: jest.fn(),
    updateDog: jest.fn(),
    deleteDog: jest.fn(),
    uploadDogPhoto: jest.fn(),
  },
  mapApi: {
    getNearbyUsers: jest.fn(),
    getCollectibles: jest.fn(),
    collectItem: jest.fn(),
    updateLocation: jest.fn(),
  },
  feedApi: {
    getPosts: jest.fn(),
    createPost: jest.fn(),
    likePost: jest.fn(),
    unlikePost: jest.fn(),
    commentPost: jest.fn(),
    getComments: jest.fn(),
  },
  walletApi: {
    getBalance: jest.fn(),
    getTransactions: jest.fn(),
    redeemReward: jest.fn(),
    getReferralCode: jest.fn(),
    claimReferral: jest.fn(),
  },
  daoApi: {
    getProposals: jest.fn(),
    createProposal: jest.fn(),
    getProposal: jest.fn(),
    voteProposal: jest.fn(),
    getTreasury: jest.fn(),
    stakeTokens: jest.fn(),
  },
  aiApi: {
    getRecommendations: jest.fn(),
    analyzeMood: jest.fn(),
    getTips: jest.fn(),
  },
}));

// Мокаем утилиты
jest.mock('@/lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  formatDate: jest.fn((date) => '2024-01-01'),
  formatTime: jest.fn((date) => '12:00'),
  formatNumber: jest.fn((num) => num.toLocaleString()),
  truncateText: jest.fn((text, maxLength) => 
    text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
  ),
  generateId: jest.fn(() => 'test-id'),
  isValidEmail: jest.fn((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  isValidPassword: jest.fn((password) => password.length >= 8),
  calculateDistance: jest.fn(() => 1.5),
  formatDistance: jest.fn((distance) => distance < 1 ? `${Math.round(distance * 1000)} м` : `${distance.toFixed(1)} км`),
  debounce: jest.fn((func, wait) => func),
  throttle: jest.fn((func, limit) => func),
  copyToClipboard: jest.fn(() => Promise.resolve(true)),
  downloadFile: jest.fn(),
  isPWA: jest.fn(() => false),
  isAppFocused: jest.fn(() => true),
  getScreenSize: jest.fn(() => 'md'),
  isMobile: jest.fn(() => false),
  isTouchDevice: jest.fn(() => false),
  getSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
  formatFileSize: jest.fn((bytes) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }),
  supportsWebP: jest.fn(() => Promise.resolve(true)),
  getColorFromGradient: jest.fn(() => '#000000'),
  createImageUrl: jest.fn((url, params) => {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.set(key, String(value));
    });
    return urlObj.toString();
  }),
  isElementInViewport: jest.fn(() => true),
  scrollToElement: jest.fn(),
  getRandomElement: jest.fn((array) => array[Math.floor(Math.random() * array.length)]),
  shuffleArray: jest.fn((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }),
  groupBy: jest.fn((array, key) => {
    return array.reduce((groups, item) => {
      const group = key(item);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }),
  removeDuplicates: jest.fn((array) => [...new Set(array)]),
  range: jest.fn((start, end, step = 1) => {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }),
  delay: jest.fn((ms) => new Promise(resolve => setTimeout(resolve, ms))),
  repeat: jest.fn((fn, interval) => {
    const id = setInterval(fn, interval);
    return () => clearInterval(id);
  }),
}));

// Мокаем WebSocket
global.WebSocket = class {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    
    // Симулируем подключение
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 100);
  }
  
  send(data) {
    // Симулируем отправку сообщения
    console.log('WebSocket send:', data);
  }
  
  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose();
  }
};

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

// Мокаем IntersectionObserver
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    // Симулируем наблюдение
    this.callback([{ isIntersecting: true }]);
  }
  
  unobserve() {}
  disconnect() {}
};

// Мокаем ResizeObserver
global.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Мокаем matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Мокаем navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn((success) => 
      success({
        coords: {
          latitude: 55.7558,
          longitude: 37.6176,
          accuracy: 10,
        },
      })
    ),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Мокаем localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Мокаем sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Мокаем URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Мокаем URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// Мокаем FileReader
global.FileReader = class {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL(blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock-data';
      if (this.onload) this.onload();
    }, 100);
  }
  
  readAsText(blob) {
    setTimeout(() => {
      this.result = 'mock-text';
      if (this.onload) this.onload();
    }, 100);
  }
};

// Мокаем fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Мокаем console для подавления предупреждений в тестах
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
}); 
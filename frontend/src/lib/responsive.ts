// Утилиты для responsive дизайна

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const deviceTypes = {
  mobile: 'mobile',
  tablet: 'tablet',
  desktop: 'desktop',
} as const;

export type DeviceType = typeof deviceTypes[keyof typeof deviceTypes];

// Хук для определения типа устройства
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Хук для определения размера экрана
export function getScreenSize(): 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  if (typeof window === 'undefined') return 'lg';
  
  const width = window.innerWidth;
  
  if (width < 640) return 'sm';
  if (width < 768) return 'md';
  if (width < 1024) return 'lg';
  if (width < 1280) return 'xl';
  return '2xl';
}

// Утилиты для адаптивных классов
export const responsive = {
  // Адаптивные отступы
  padding: {
    mobile: 'p-4',
    tablet: 'md:p-6',
    desktop: 'lg:p-8',
  },
  
  // Адаптивные размеры текста
  text: {
    mobile: 'text-sm',
    tablet: 'md:text-base',
    desktop: 'lg:text-lg',
  },
  
  // Адаптивные размеры заголовков
  heading: {
    mobile: 'text-xl',
    tablet: 'md:text-2xl',
    desktop: 'lg:text-3xl',
  },
  
  // Адаптивные сетки
  grid: {
    mobile: 'grid-cols-1',
    tablet: 'md:grid-cols-2',
    desktop: 'lg:grid-cols-3',
  },
  
  // Адаптивные flex направления
  flex: {
    mobile: 'flex-col',
    tablet: 'md:flex-row',
    desktop: 'lg:flex-row',
  },
  
  // Адаптивные размеры кнопок
  button: {
    mobile: 'w-full',
    tablet: 'md:w-auto',
    desktop: 'lg:w-auto',
  },
};

// Утилиты для мобильных устройств
export const mobile = {
  // Безопасные зоны для мобильных устройств
  safeArea: 'pb-safe-area-inset-bottom pt-safe-area-inset-top',
  
  // Высота viewport для мобильных
  viewportHeight: 'h-screen mobile:h-[100dvh]',
  
  // Адаптивные размеры для мобильных
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  },
  
  // Размеры для touch элементов
  touchTarget: 'min-h-[44px] min-w-[44px]',
};

// Утилиты для планшетов
export const tablet = {
  // Адаптивные размеры для планшетов
  spacing: {
    xs: 'md:p-3',
    sm: 'md:p-4',
    md: 'md:p-6',
    lg: 'md:p-8',
  },
  
  // Адаптивные сетки для планшетов
  grid: {
    cols2: 'md:grid-cols-2',
    cols3: 'md:grid-cols-3',
    cols4: 'md:grid-cols-4',
  },
};

// Утилиты для десктопа
export const desktop = {
  // Адаптивные размеры для десктопа
  spacing: {
    xs: 'lg:p-4',
    sm: 'lg:p-6',
    md: 'lg:p-8',
    lg: 'lg:p-12',
  },
  
  // Адаптивные сетки для десктопа
  grid: {
    cols3: 'lg:grid-cols-3',
    cols4: 'lg:grid-cols-4',
    cols5: 'lg:grid-cols-5',
    cols6: 'lg:grid-cols-6',
  },
  
  // Hover эффекты только для десктопа
  hover: 'lg:hover:shadow-lg lg:hover:scale-105',
};

// Комбинированные утилиты
export const adaptive = {
  // Адаптивные контейнеры
  container: 'container mx-auto px-4 md:px-6 lg:px-8',
  
  // Адаптивные карточки
  card: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6',
  
  // Адаптивные кнопки
  button: 'px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors',
  
  // Адаптивные формы
  form: 'space-y-4 md:space-y-6',
  
  // Адаптивные модальные окна
  modal: 'w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto',
  
  // Адаптивные навигации
  navigation: 'flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4',
};

// Утилиты для accessibility
export const a11y = {
  // Focus стили
  focus: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  
  // Screen reader only
  srOnly: 'sr-only',
  
  // Skip links
  skipLink: 'absolute -top-40 left-6 bg-primary-600 text-white px-4 py-2 rounded focus:top-6',
  
  // High contrast
  highContrast: 'border-2 border-gray-900 dark:border-white',
};

// Утилиты для производительности
export const performance = {
  // Lazy loading
  lazy: 'loading-lazy',
  
  // Will change для анимаций
  willChange: 'will-change-transform',
  
  // GPU acceleration
  gpu: 'transform-gpu',
  
  // Contain layout
  contain: 'contain-layout',
};


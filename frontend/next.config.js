/** @type {import('next').NextConfig} */
const nextConfig = {
  // Оптимизация для продакшн
  compress: true,
  poweredByHeader: false,
  
  // PWA настройки
  experimental: {
    // optimizeCss: true, // Отключено из-за проблем с critters
  },
  
  // Оптимизация изображений
  images: {
    domains: ['localhost', 'api.dogymorbis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Переменные окружения
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_NAME: 'Dogymorbis',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
  
  // Настройки для продакшн
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    swcMinify: true,
    compiler: {
      removeConsole: {
        exclude: ['error'],
      },
    },
  }),
  
  // Настройки для разработки
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
  }),
  
  // Настройки безопасности (отключены для статического экспорта)
  ...(process.env.NODE_ENV !== 'production' && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'Referrer-Policy',
              value: 'origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=(self)',
            },
          ],
        },
      ];
    },
  }),
  
  // Редиректы (отключены для статического экспорта)
  ...(process.env.NODE_ENV !== 'production' && {
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
      ];
    },
    
    // Переписывание URL (отключено для статического экспорта)
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
        },
      ];
    },
  }),
};

module.exports = nextConfig;
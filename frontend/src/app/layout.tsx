import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Dogymorbis - Социальная сеть для владельцев собак',
    template: '%s | Dogymorbis',
  },
  description: 'Мобильное приложение для владельцев собак с социальными функциями, геймификацией и AI-помощником',
  keywords: ['собаки', 'питомцы', 'социальная сеть', 'прогулки', 'геймификация'],
  authors: [{ name: 'Dogymorbis Team' }],
  creator: 'Dogymorbis Team',
  publisher: 'Dogymorbis',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    title: 'Dogymorbis - Социальная сеть для владельцев собак',
    description: 'Мобильное приложение для владельцев собак с социальными функциями, геймификацией и AI-помощником',
    siteName: 'Dogymorbis',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dogymorbis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dogymorbis - Социальная сеть для владельцев собак',
    description: 'Мобильное приложение для владельцев собак с социальными функциями, геймификацией и AI-помощником',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2751a' },
    { media: '(prefers-color-scheme: dark)', color: '#e35d10' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Dogymorbis',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="application-name" content="Dogymorbis" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dogymorbis" />
        <meta name="description" content="Мобильное приложение для владельцев собак" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#f2751a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#f2751a" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f2751a" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://dogymorbis.com" />
        <meta name="twitter:title" content="Dogymorbis" />
        <meta name="twitter:description" content="Мобильное приложение для владельцев собак" />
        <meta name="twitter:image" content="https://dogymorbis.com/og-image.jpg" />
        <meta name="twitter:creator" content="@dogymorbis" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Dogymorbis" />
        <meta property="og:description" content="Мобильное приложение для владельцев собак" />
        <meta property="og:site_name" content="Dogymorbis" />
        <meta property="og:url" content="https://dogymorbis.com" />
        <meta property="og:image" content="https://dogymorbis.com/og-image.jpg" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
} 
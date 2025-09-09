import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dogymorbis - Сообщество собачников',
  description: 'Приложение для владельцев собак с картой, лентой, магазином и социальными функциями',
  keywords: 'собаки, питомцы, сообщество, карта, магазин, социальная сеть',
  authors: [{ name: 'Dogymorbis Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Dogymorbis - Сообщество собачников',
    description: 'Приложение для владельцев собак с картой, лентой, магазином и социальными функциями',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dogymorbis - Сообщество собачников',
    description: 'Приложение для владельцев собак с картой, лентой, магазином и социальными функциями',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#87CEEB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#87CEEB" />
      </head>
      <body className={`${inter.className} bg-noise`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
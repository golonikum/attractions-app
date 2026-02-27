import { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';

import { AuthContextProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

import PWALayout from '@/components/pwa/PWALayout';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Attractions App',
  description: 'Приложение для создания и управления группами достопримечательностей с интерактивной картой',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Attractions',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Attractions App',
    title: 'Attractions App',
    description: 'Приложение для создания и управления группами достопримечательностей с интерактивной картой.',
  },
  twitter: {
    card: 'summary',
    title: 'Attractions App',
    description: 'Приложение для создания и управления группами достопримечательностей с интерактивной картой.',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src={`https://api-maps.yandex.ru/v3/?apikey=${process.env.YA_MAPS_API_KEY}&lang=ru_RU`}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider defaultTheme="light">
          <AuthContextProvider>
            <DataProvider>
              <PWALayout>
                <Suspense>{children}</Suspense>
                <Toaster position="top-right" richColors />
              </PWALayout>
            </DataProvider>
          </AuthContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

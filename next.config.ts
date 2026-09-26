import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.mds.yandex.net',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'avatars.mds.yandex.net',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'kareliya.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'sobory.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'sun9-77.userapi.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'museum-izborsk.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'core-pht-proxy.maps.yandex.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.tursar.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '35photo.pro',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 's1.fotokto.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'a1.drive-data.ru',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'pic.rutubelist.ru',
        port: '',
      },
    ],
  },
};

export default nextConfig;

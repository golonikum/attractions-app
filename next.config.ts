import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
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
    ],
  },
};

export default nextConfig;

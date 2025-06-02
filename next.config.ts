import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Capture toutes les requêtes commençant par /api/
        destination: 'https://api-gestiloc.vercel.app/api/:path*', // Redirige vers le backend
      },
    ];
  },
};

export default nextConfig;
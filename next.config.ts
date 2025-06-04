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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gwsosglvvobbfayijeri.supabase.co',
        port: '', // Laissez vide si aucun port spécifique n'est utilisé
        pathname: '/storage/v1/object/public/**', // Spécifiez le chemin si nécessaire
      },
    ],
  },
};

export default nextConfig;
import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins is available in Next.js 16 but not in types yet
  allowedDevOrigins: ['192.168.0.104:3000'],

  // Force trailing slashes everywhere to match Django's expectations
  trailingSlash: true,

  // Turbopack configuration for Next.js 16 - empty object to silence warning
  turbopack: {},

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: isDevelopment ? '*' : process.env.ALLOWED_ORIGIN || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // Don't rewrite /api/parcels/* - we handle it with Next.js API routes
      // Only rewrite other /api/* paths to Django
      {
        source: '/api/users/:path*',
        destination: 'http://127.0.0.1:8080/api/users/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://127.0.0.1:8080/api/admin/:path*',
      },
    ];
  },
};

export default nextConfig;

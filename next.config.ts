import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins is available in Next.js 16 but not in types yet
  allowedDevOrigins: ['172.29.114.0:3000'],

  // Match Django's APPEND_SLASH = False setting
  trailingSlash: false,

  // Optimize compilation speed
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'leaflet',
      'react-leaflet',
      '@radix-ui/react-select',
      '@radix-ui/react-dropdown-menu',
    ],
  },

  // Turbopack configuration for Next.js 16
  turbopack: {
    resolveAlias: {
      // Optimize large dependencies
      canvas: './empty-module.js',
    },
  },

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
      // Proxy all /api/* paths to Django except those handled by Next.js
      // Next.js API routes take precedence over rewrites
      {
        source: '/api/token/:path*',
        destination: 'http://127.0.0.1:8000/api/token/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'http://127.0.0.1:8000/api/users/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://127.0.0.1:8000/api/admin/:path*',
      },
    ];
  },
};

export default nextConfig;

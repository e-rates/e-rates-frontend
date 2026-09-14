import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';
// Never fall back to production: a missing env var must land on localhost, not a live county.
const BACKEND_URL = process.env.INTERNAL_BACKEND_URL || process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

const nextConfig: NextConfig = {
  // Emits .next/standalone so the runtime image ships only what it needs.
  output: 'standalone',

  // @ts-ignore - allowedDevOrigins is available in Next.js 16 but not in types yet
  allowedDevOrigins: ['172.29.114.0:3000'],

  // Match Django's APPEND_SLASH = False setting
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

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

  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'https', hostname: '**' },
    ],
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
        source: '/media/:path*',
        destination: `${BACKEND_URL}/media/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins is available in Next.js 16 but not in types yet
  allowedDevOrigins: ['192.168.0.104:3000'],

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
      ...(isDevelopment
        ? [
            {
              source: '/:path*',
              headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
            },
          ]
        : []),
    ];
  },

  async rewrites() {
    return [
      // {
      //   source: '/python-api/:path*',
      //   destination: 'http://localhost:8000/:path*',
      // },
    ];
  },
};

export default nextConfig;

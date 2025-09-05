/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL_ENV === 'production';

const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Add image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Configure domain routing for nip.io subdomains
  async rewrites() {
    return {
      beforeFiles: [
        // Handle nip.io domain for portal subdomain
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'portal.localhost.nip.io:3000',
            },
          ],
          destination: '/portal/:path*',
        },
      ],
    };
  },
  async redirects() {
    return [
      // Legacy .html/.htm redirects - multiple patterns to ensure comprehensive coverage
      {
        source: '/:path*\\.html',
        destination: '/',
        permanent: false,
      },
      {
        source: '/:path*\\.htm',
        destination: '/',
        permanent: false,
      },
      // Catch any remaining .html/.htm with regex pattern
      {
        source: '/(.+)\\.html',
        destination: '/',
        permanent: false,
      },
      {
        source: '/(.+)\\.htm',
        destination: '/',
        permanent: false,
      },
      // Catch common legacy extensions
      {
        source: '/(.+)\\.php',
        destination: '/',
        permanent: false,
      },
      {
        source: '/(.+)\\.asp',
        destination: '/',
        permanent: false,
      },
      {
        source: '/(.+)\\.aspx',
        destination: '/',
        permanent: false,
      },
      // Specific legacy routes that might exist
      {
        source: '/index.html',
        destination: '/',
        permanent: false,
      },
      {
        source: '/home.html',
        destination: '/',
        permanent: false,
      },
      {
        source: '/default.html',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async headers() {
    return isProd
      ? []
      : [
          {
            source: '/:path*',
            headers: [
              { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
            ],
          },
        ];
  },
};

export default nextConfig;

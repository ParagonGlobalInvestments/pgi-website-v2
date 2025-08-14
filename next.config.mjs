/** @type {import('next').NextConfig} */
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
      {
        source: '/:path*.html',
        destination: '/',
        permanent: false,
      },
      {
        source: '/:path*.htm',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

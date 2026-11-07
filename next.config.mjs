/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Enable package tree-shaking for large dependencies
  // Framer Motion has many features; this removes unused code (-30-40KB)
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  // compiler.removeConsole is only included in production — Turbopack (dev) doesn't support it
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: { exclude: ['error', 'warn'] },
    },
  }),
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  allowedDevOrigins: ['portal.127.0.0.1.sslip.io'],
};

export default nextConfig;

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
  // Disable webpack persistent cache to prevent ENOSPC errors on low disk space
  // This is a safe fallback that doesn't affect functionality, only build speed
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      // Disable persistent cache in production builds to avoid disk space issues
      config.cache = false;
    }
    return config;
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
  // Legacy redirects removed
  async headers() {
    return [];
  },
};

export default nextConfig;

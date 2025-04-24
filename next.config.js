/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  // Configure domain routing for portal
  async rewrites() {
    return {
      beforeFiles: [
        // Handle portal subdomain routing
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "portal.paragon-global.org",
            },
          ],
          destination: "/portal/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;

// app/robots.ts
import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paragoninvestments.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/portal/',
        '/dashboard/',
        '/api/',
        '/_next/',
        '/sign-in/',
        '/sign-up/',
        '/lectures/*.pdf',
        '/News/*.pdf',
        '/*.html$',
        '/*.htm$',
        '/*.php$',
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}

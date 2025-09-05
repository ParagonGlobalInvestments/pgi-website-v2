// app/robots.ts
import type { MetadataRoute } from 'next';

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
    sitemap: 'https://paragoninvestments.org/sitemap.xml',
    // crawlDelay is optional (Google ignores it, Bing respects it)
    crawlDelay: 1,
  };
}

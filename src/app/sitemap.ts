import type { MetadataRoute } from 'next';

const base = 'https://paragoninvestments.org';

// All the real routes based on the app directory structure
const routes = [
  '/',
  '/who-we-are',
  '/investment-strategy',
  '/education',
  '/sponsors',
  '/national-committee',
  '/national-committee/officers',
  '/national-committee/founders',
  '/members',
  '/members/value-team',
  '/members/quant-team',
  '/placements',
  '/apply',
  '/contact',
  '/about',
  '/privacy-policy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map(path => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1.0 : 0.7,
  }));
}

// Force sitemap regeneration

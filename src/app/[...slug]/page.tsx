'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

export default function CatchAllPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Get the full path
    const slug = Array.isArray(params.slug)
      ? params.slug.join('/')
      : params.slug || '';
    const fullPath = `/${slug}`;

    console.log('Catch-all route hit:', fullPath);

    // Exclude sitemap.xml and robots.txt from catch-all handling
    if (fullPath === '/sitemap.xml' || fullPath === '/robots.txt') {
      console.log('Allowing Next.js to handle:', fullPath);
      return;
    }

    // Show 404 for any unmatched routes
    notFound();
  }, [params.slug, router]);

  // Immediate check for SEO files
  const slug = Array.isArray(params.slug)
    ? params.slug.join('/')
    : params.slug || '';
  const fullPath = `/${slug}`;
  
  // Don't render anything for sitemap.xml or robots.txt - let Next.js handle them
  if (fullPath === '/sitemap.xml' || fullPath === '/robots.txt') {
    return null;
  }

  // This should never render as notFound() is called in useEffect
  return null;
}

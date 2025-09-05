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

    // Check if this is a legacy route
    const isLegacyRoute = fullPath.match(/\.(html?|php|asp|aspx|jsp|cfm)$/i);

    if (isLegacyRoute) {
      console.log(`Catch-all redirecting legacy route: ${fullPath} -> /`);
      // Immediate redirect
      window.location.replace('/');
      router.replace('/');
      return;
    }

    // If not a legacy route, show 404
    notFound();
  }, [params.slug, router]);

  // Immediate check for legacy routes
  const slug = Array.isArray(params.slug)
    ? params.slug.join('/')
    : params.slug || '';
  const fullPath = `/${slug}`;
  
  // Don't render anything for sitemap.xml or robots.txt - let Next.js handle them
  if (fullPath === '/sitemap.xml' || fullPath === '/robots.txt') {
    return null;
  }
  
  const isLegacyRoute = fullPath.match(/\.(html?|php|asp|aspx|jsp|cfm)$/i);

  if (isLegacyRoute) {
    return (
      <>
        <meta httpEquiv="refresh" content="0; url=/" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate redirect for legacy routes
              (function() {
                console.log('Immediate redirect from catch-all page for legacy route');
                window.location.replace('/');
              })();
            `,
          }}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Redirecting...
              </h2>
              <p className="text-gray-600 mb-6">
                This legacy page is being redirected to our homepage.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // This should never render for non-legacy routes as notFound() is called in useEffect
  return null;
}

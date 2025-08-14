'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if this is a legacy route that should redirect to homepage
    const isLegacyRoute = pathname.match(/\.(html?|php|asp|aspx|jsp|cfm)$/i);

    if (isLegacyRoute) {
      // Redirect legacy routes to homepage
      console.log(`404 page redirecting legacy route: ${pathname} -> /`);
      router.replace('/');
      return;
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>

          <div className="text-sm text-gray-500">
            <p>Looking for content from our previous site?</p>
            <p>All legacy pages now redirect to our new homepage.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

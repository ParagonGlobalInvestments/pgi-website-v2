'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ResourcesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Resources error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">Failed to load resources</h2>
      <p className="text-sm text-gray-500">
        Could not load resources. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

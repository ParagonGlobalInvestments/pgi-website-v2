'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  logLabel?: string;
}

export default function ErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  logLabel = 'Error',
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error(`${logLabel}:`, error);
  }, [error, logLabel]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">{description}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

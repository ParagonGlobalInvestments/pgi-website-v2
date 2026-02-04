'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function DirectoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Failed to load directory"
      description="Could not load the member directory. Please try again."
      logLabel="Directory error"
    />
  );
}

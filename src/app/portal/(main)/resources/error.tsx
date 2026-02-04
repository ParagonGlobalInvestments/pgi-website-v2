'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function ResourcesError({
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
      title="Failed to load resources"
      description="Could not load resources. Please try again."
      logLabel="Resources error"
    />
  );
}

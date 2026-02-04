'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function ContentError({
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
      title="Failed to load content"
      description="Could not load content management. Please try again."
      logLabel="Content error"
    />
  );
}

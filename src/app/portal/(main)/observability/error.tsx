'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function ObservabilityError({
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
      title="Failed to load observability"
      description="Could not load the observability dashboard. Please try again."
      logLabel="Observability error"
    />
  );
}

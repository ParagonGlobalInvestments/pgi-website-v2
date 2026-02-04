'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function MainError({
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
      description="This page encountered an error. Please try again."
      logLabel="Portal page error"
    />
  );
}

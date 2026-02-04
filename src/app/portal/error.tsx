'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function PortalError({
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
      logLabel="Portal error"
    />
  );
}

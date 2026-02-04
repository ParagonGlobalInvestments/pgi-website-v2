'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export default function SettingsError({
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
      title="Failed to load settings"
      description="Could not load your settings. Please try again."
      logLabel="Settings error"
    />
  );
}

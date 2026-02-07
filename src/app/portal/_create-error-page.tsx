'use client';

import ErrorFallback from '@/components/portal/ErrorFallback';

export function createPortalErrorPage(config: {
  title?: string;
  description?: string;
  logLabel: string;
}) {
  return function PortalError({
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
        title={config.title}
        description={config.description}
        logLabel={config.logLabel}
      />
    );
  };
}

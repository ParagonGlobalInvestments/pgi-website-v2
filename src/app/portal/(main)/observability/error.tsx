'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load observability',
  description: 'Could not load the observability dashboard. Please try again.',
  logLabel: 'Observability error',
});

'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load org chart',
  description: 'Could not load the org chart. Please try again.',
  logLabel: 'Org chart error',
});

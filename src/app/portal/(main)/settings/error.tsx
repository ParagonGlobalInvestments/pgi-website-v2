'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load settings',
  description: 'Could not load your settings. Please try again.',
  logLabel: 'Settings error',
});

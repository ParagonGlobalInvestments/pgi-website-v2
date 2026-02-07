'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load directory',
  description: 'Could not load the member directory. Please try again.',
  logLabel: 'Directory error',
});

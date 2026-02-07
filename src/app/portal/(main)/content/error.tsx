'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load content',
  description: 'Could not load content management. Please try again.',
  logLabel: 'Content error',
});

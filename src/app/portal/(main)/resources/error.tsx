'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load resources',
  description: 'Could not load resources. Please try again.',
  logLabel: 'Resources error',
});

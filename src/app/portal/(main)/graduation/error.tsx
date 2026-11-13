'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load graduation',
  description: 'Could not load the graduation list. Please try again.',
  logLabel: 'Graduation error',
});

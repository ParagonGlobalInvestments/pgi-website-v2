'use client';

import { createPortalErrorPage } from '../_create-error-page';

export default createPortalErrorPage({
  description: 'This page encountered an error. Please try again.',
  logLabel: 'Portal page error',
});

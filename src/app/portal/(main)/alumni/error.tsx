'use client';

import { createPortalErrorPage } from '../../_create-error-page';

export default createPortalErrorPage({
  title: 'Failed to load alumni directory',
  description: 'Could not load the alumni directory. Please try again.',
  logLabel: 'Alumni directory error',
});

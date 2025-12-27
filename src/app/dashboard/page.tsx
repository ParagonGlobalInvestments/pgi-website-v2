import { redirect } from 'next/navigation';
import { portalEnabled } from '@/lib/runtime';

export default function DashboardPage() {
  // Use single source of truth for portal availability
  if (!portalEnabled) {
    redirect('/');
  }

  // Redirect to the portal dashboard which has the sidebar
  redirect('/portal/dashboard');
}

import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // In production, redirect to home page instead of portal
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  // Redirect to the portal dashboard which has the sidebar
  redirect('/portal/dashboard');
}

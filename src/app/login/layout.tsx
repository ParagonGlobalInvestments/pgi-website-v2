import type { Metadata } from 'next';
import { headers } from 'next/headers';
import AuthShellLayout from '@/components/layout/AuthShellLayout';

export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || '';
  const isPortal = host.startsWith('portal.');

  if (isPortal) {
    return {
      title: 'Portal | Paragon Global Investments',
      description: 'PGI member portal — directory, resources, and team tools.',
      openGraph: {
        title: 'Portal | Paragon Global Investments',
        description: 'PGI member portal — directory, resources, and team tools.',
        images: [{ url: '/api/og/portal', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Portal | Paragon Global Investments',
        images: ['/api/og/portal'],
      },
    };
  }

  return {
    title: 'Log In - PGI Member Portal',
    description: 'Log in to access the PGI Member Portal and exclusive resources.',
    alternates: { canonical: '/login' },
  };
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}

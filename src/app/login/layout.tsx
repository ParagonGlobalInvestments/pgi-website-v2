import type { Metadata } from 'next';
import AuthShellLayout from '@/components/layout/AuthShellLayout';

export const metadata: Metadata = {
  title: 'Log In - PGI Member Portal',
  description:
    'Log in to access the PGI Member Portal and exclusive resources.',
  alternates: { canonical: '/login' },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}

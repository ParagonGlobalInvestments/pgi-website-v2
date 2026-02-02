import type { Metadata } from 'next';
import AuthShellLayout from '@/components/layout/AuthShellLayout';

export const metadata: Metadata = {
  title: 'Sign In - PGI Member Portal',
  description:
    'Sign in to access the PGI Member Portal and exclusive resources.',
  alternates: { canonical: '/sign-in' },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShellLayout>{children}</AuthShellLayout>;
}

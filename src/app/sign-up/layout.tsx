import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'Sign Up - PGI Member Portal',
  description:
    'Create an account to access the PGI Member Portal and exclusive resources.',
  alternates: { canonical: '/sign-up' },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

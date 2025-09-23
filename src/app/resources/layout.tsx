import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Access exclusive PGI educational materials, research templates, and resources for value investing and algorithmic trading.',
  alternates: { canonical: '/resources' },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StandaloneLayout>{children}</StandaloneLayout>
    </SessionProvider>
  );
}

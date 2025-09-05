import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'Apply',
  description:
    'Join Paragon Global Investments. Learn about our application process and requirements.',
  alternates: { canonical: '/apply' },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

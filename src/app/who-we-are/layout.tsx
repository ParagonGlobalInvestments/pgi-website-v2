import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'Who We Are',
  description:
    'Learn about Paragon Global Investments, our mission, history, and chapters at 8 top universities.',
  alternates: { canonical: '/who-we-are' },
};

export default function WhoWeAreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

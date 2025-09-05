import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'Sponsors',
  description:
    'Meet our sponsors and partners including Citadel, Jane Street, DRW, and other leading financial institutions.',
  alternates: { canonical: '/sponsors' },
};

export default function SponsorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

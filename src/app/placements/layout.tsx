import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'Placements',
  description:
    'See where our alumni have been placed at top firms including Goldman Sachs, JPMorgan, Citadel, and more.',
  alternates: { canonical: '/placements' },
};

export default function PlacementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

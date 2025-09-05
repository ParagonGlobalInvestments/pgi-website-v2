import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'Investment Strategy',
  description:
    'Discover our investment funds: Paragon Value and Paragon Systematic, combining fundamental and quantitative strategies.',
  alternates: { canonical: '/investment-strategy' },
};

export default function InvestmentStrategyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

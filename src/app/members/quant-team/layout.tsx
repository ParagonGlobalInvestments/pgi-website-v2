import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quant Team',
  description:
    'Meet the Quantitative Team members of Paragon Global Investments specializing in algorithmic trading.',
  alternates: { canonical: '/members/quant-team' },
};

export default function QuantTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

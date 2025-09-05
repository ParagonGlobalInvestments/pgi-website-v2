import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Value Team',
  description:
    'Meet the Value Team members of Paragon Global Investments specializing in fundamental analysis.',
  alternates: { canonical: '/members/value-team' },
};

export default function ValueTeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

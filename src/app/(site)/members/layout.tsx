import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Members',
  description:
    'Discover our talented members across value and quantitative teams at top universities.',
  alternates: { canonical: '/members' },
};

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

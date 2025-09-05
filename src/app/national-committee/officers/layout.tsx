import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Officers',
  description:
    'Meet the current officers of the Paragon Global Investments National Committee.',
  alternates: { canonical: '/national-committee/officers' },
};

export default function OfficersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

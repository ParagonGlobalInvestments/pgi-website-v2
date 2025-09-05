import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'Meet the founders of Paragon Global Investments and learn about our founding story.',
  alternates: { canonical: '/national-committee/founders' },
};

export default function FoundersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

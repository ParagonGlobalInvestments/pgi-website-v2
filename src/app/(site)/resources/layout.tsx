import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Access exclusive PGI educational materials, research templates, and resources for value investing and algorithmic trading.',
  alternates: { canonical: '/resources' },
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Education',
  description:
    'Explore our comprehensive curriculum covering value investing, algorithmic trading, and quantitative finance.',
  alternates: { canonical: '/education' },
};

export default function EducationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

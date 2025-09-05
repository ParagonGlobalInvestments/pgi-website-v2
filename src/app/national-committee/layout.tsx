import type { Metadata } from 'next';
import StandaloneLayout from '@/components/layout/StandaloneLayout';

export const metadata: Metadata = {
  title: 'National Committee',
  description:
    'Meet the National Committee leadership of Paragon Global Investments, including officers and founders.',
  alternates: { canonical: '/national-committee' },
};

export default function NationalCommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StandaloneLayout>{children}</StandaloneLayout>;
}

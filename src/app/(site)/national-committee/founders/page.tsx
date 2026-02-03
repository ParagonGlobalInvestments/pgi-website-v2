import type { Metadata } from 'next';
import { getCmsPeople } from '@/lib/cms/queries';
import FoundersClient from './client';

export const metadata: Metadata = {
  title: 'Founders',
  description:
    'Meet the founders of Paragon Global Investments and learn about our founding story.',
  alternates: { canonical: '/national-committee/founders' },
};

export default async function FoundersPage() {
  const [founders, chapterFounders] = await Promise.all([
    getCmsPeople('founders'),
    getCmsPeople('chapter-founders'),
  ]);

  return <FoundersClient founders={founders} chapterFounders={chapterFounders} />;
}

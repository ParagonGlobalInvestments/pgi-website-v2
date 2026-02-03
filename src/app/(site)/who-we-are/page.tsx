import type { Metadata } from 'next';
import { getCmsTimeline } from '@/lib/cms/queries';
import WhoWeAreClient from './client';

export const metadata: Metadata = {
  title: 'Who We Are',
  description:
    'Learn about Paragon Global Investments, our mission, history, and chapters at 8 top universities.',
  alternates: { canonical: '/who-we-are' },
};

export default async function WhoWeArePage() {
  const timeline = await getCmsTimeline();

  return <WhoWeAreClient timeline={timeline} />;
}

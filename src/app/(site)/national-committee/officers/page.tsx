import type { Metadata } from 'next';
import { getCmsPeople } from '@/lib/cms/queries';
import OfficersClient from './client';

export const metadata: Metadata = {
  title: 'Officers',
  description:
    'Meet the current officers of the Paragon Global Investments National Committee.',
  alternates: { canonical: '/national-committee/officers' },
};

export default async function OfficersPage() {
  const [officers, alumniBoard] = await Promise.all([
    getCmsPeople('officers'),
    getCmsPeople('alumni-board'),
  ]);

  return <OfficersClient officers={officers} alumniBoard={alumniBoard} />;
}

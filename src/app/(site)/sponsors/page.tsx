import type { Metadata } from 'next';
import { getCmsSponsors } from '@/lib/cms/queries';
import SponsorsClient from './client';

export const metadata: Metadata = {
  title: 'Sponsors',
  description:
    'Meet our sponsors and partners including Citadel, Jane Street, DRW, and other leading financial institutions.',
  alternates: { canonical: '/sponsors' },
};

export default async function SponsorsPage() {
  const [sponsors, partners] = await Promise.all([
    getCmsSponsors('sponsor'),
    getCmsSponsors('partner'),
  ]);

  return <SponsorsClient sponsors={sponsors} partners={partners} />;
}

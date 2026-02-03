import type { Metadata } from 'next';
import { getCmsPeople } from '@/lib/cms/queries';
import QuantTeamClient from './client';

export const metadata: Metadata = {
  title: 'Quant Team',
  description:
    'Meet the Quantitative Team members of Paragon Global Investments specializing in algorithmic trading.',
  alternates: { canonical: '/members/quant-team' },
};

export default async function QuantTeamPage() {
  const [researchCommittee, analysts] = await Promise.all([
    getCmsPeople('quant-research-committee'),
    getCmsPeople('quant-analysts'),
  ]);

  return (
    <QuantTeamClient researchCommittee={researchCommittee} analysts={analysts} />
  );
}

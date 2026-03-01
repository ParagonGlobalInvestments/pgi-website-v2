import type { Metadata } from 'next';
import { getCmsPeople } from '@/lib/cms/queries';
import ValueTeamClient from './client';

export const metadata: Metadata = {
  title: 'Value Team',
  description:
    'Meet the Value Team members of Paragon Global Investments specializing in fundamental analysis.',
  alternates: { canonical: '/members/value-team' },
};

export default async function ValueTeamPage() {
  const [investmentCommittee, portfolioManagers, analysts] = await Promise.all([
    getCmsPeople('investment-committee', {
      includeAlumni: false,
      usersOnly: true,
      fallbackToCmsPeople: false,
    }),
    getCmsPeople('portfolio-managers', {
      includeAlumni: false,
      usersOnly: true,
      fallbackToCmsPeople: false,
    }),
    getCmsPeople('value-analysts', {
      includeAlumni: false,
      usersOnly: true,
      fallbackToCmsPeople: false,
    }),
  ]);

  return (
    <ValueTeamClient
      investmentCommittee={investmentCommittee}
      portfolioManagers={portfolioManagers}
      analysts={analysts}
    />
  );
}

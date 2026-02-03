import type { Metadata } from 'next';
import { getCmsPeople, getCmsRecruitment } from '@/lib/cms/queries';
import ApplyClient from './client';

export const metadata: Metadata = {
  title: 'Apply',
  description:
    'Join Paragon Global Investments. Learn about our application process and requirements.',
  alternates: { canonical: '/apply' },
};

export default async function ApplyPage() {
  const [recruitmentTeam, recruitmentConfig] = await Promise.all([
    getCmsPeople('recruitment-team'),
    getCmsRecruitment(),
  ]);

  return (
    <ApplyClient
      recruitmentTeam={recruitmentTeam}
      recruitmentConfig={recruitmentConfig}
    />
  );
}

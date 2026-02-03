import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import { getCmsStatistics, getCmsSponsors } from '@/lib/cms/queries';

const AboutSection = dynamic(() => import('@/components/home/AboutSection'));
const ChaptersSection = dynamic(() => import('@/components/home/ChaptersSection'));
const PlacementsSection = dynamic(() => import('@/components/home/PlacementsSection'));
const EducationInvestmentSection = dynamic(() => import('@/components/home/EducationInvestmentSection'));
const SponsorsPartnersSection = dynamic(() => import('@/components/home/SponsorsPartnersSection'));

export default async function Home() {
  const [statistics, sponsors, partners] = await Promise.all([
    getCmsStatistics(),
    getCmsSponsors('sponsor'),
    getCmsSponsors('partner'),
  ]);

  // Convert stats array to a lookup object by key
  const statsMap = Object.fromEntries(
    statistics.map((s) => [s.key, { value: s.value, label: s.label }])
  );

  return (
    <div className="scrollbar-none">
      <HeroSection />
      <AboutSection stats={statsMap} />
      <ChaptersSection />
      <PlacementsSection />
      <EducationInvestmentSection />
      <SponsorsPartnersSection sponsors={sponsors} partners={partners} />
    </div>
  );
}

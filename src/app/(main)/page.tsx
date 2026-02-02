import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';

const AboutSection = dynamic(() => import('@/components/home/AboutSection'));
const ChaptersSection = dynamic(() => import('@/components/home/ChaptersSection'));
const PlacementsSection = dynamic(() => import('@/components/home/PlacementsSection'));
const EducationInvestmentSection = dynamic(() => import('@/components/home/EducationInvestmentSection'));
const SponsorsPartnersSection = dynamic(() => import('@/components/home/SponsorsPartnersSection'));

export default function Home() {
  return (
    <div className="scrollbar-none">
      <HeroSection />
      <AboutSection />
      <ChaptersSection />
      <PlacementsSection />
      <EducationInvestmentSection />
      <SponsorsPartnersSection />
    </div>
  );
}

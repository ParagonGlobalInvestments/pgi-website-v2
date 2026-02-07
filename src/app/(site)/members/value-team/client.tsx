'use client';

import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import TeamMemberGrid from '@/components/ui/TeamMemberGrid';
import { fadeIn } from '@/lib/animations';
import type { CmsPerson } from '@/lib/cms/types';

interface ValueTeamClientProps {
  investmentCommittee: CmsPerson[];
  portfolioManagers: CmsPerson[];
  analysts: CmsPerson[];
}

export default function ValueTeamClient({
  investmentCommittee,
  portfolioManagers,
  analysts,
}: ValueTeamClientProps) {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
              <ShinyText
                text="Value Team"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Our Value Team focuses on fundamental analysis and long-term
              investment strategies. The team is composed of our Investment
              Committee, Portfolio Managers, and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      <TeamMemberGrid
        title="Investment Committee"
        members={investmentCommittee}
        darkBg
      />
      <TeamMemberGrid title="Portfolio Managers" members={portfolioManagers} />
      <TeamMemberGrid title="Analysts" members={analysts} darkBg compact />
    </div>
  );
}

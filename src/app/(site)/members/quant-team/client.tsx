'use client';

import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import type { CmsPerson } from '@/lib/cms/types';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const memberItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

interface QuantTeamClientProps {
  researchCommittee: CmsPerson[];
  analysts: CmsPerson[];
}

export default function QuantTeamClient({
  researchCommittee,
  analysts,
}: QuantTeamClientProps) {
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
                text="Quant Team"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Our Quantitative Team focuses on algorithmic trading strategies
              and data-driven investment approaches. The team is composed of our
              Quantitative Research Committee and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Research Committee Section */}
      <section className="py-16 md:py-24 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Quantitative Research Committee"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {researchCommittee.map((member) => (
              <motion.div
                key={member.id}
                variants={memberItem}
                className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-lg md:text-xl font-medium mb-2 text-white">
                  {member.name}
                </h3>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {member.school}
                </p>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white hover:text-white transition-colors text-sm md:text-base"
                  >
                    <Linkedin className="text-lg md:text-xl mr-2" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analysts Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Analysts"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {analysts.map((analyst) => (
              <motion.div
                key={analyst.id}
                variants={memberItem}
                className="bg-darkNavy p-4 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <h3 className="text-base md:text-lg font-medium text-white">
                  {analyst.name}
                </h3>
                <p className="text-gray-300 text-sm md:text-base font-light">
                  {analyst.school}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

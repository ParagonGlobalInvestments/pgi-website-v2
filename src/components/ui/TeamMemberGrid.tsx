'use client';

import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import { fadeIn, staggerContainer, memberItem } from '@/lib/animations';
import type { CmsPerson } from '@/lib/cms/types';

interface TeamMemberGridProps {
  title: string;
  members: CmsPerson[];
  /** Whether to use the darker background variant */
  darkBg?: boolean;
  /** Use compact card styling (less padding, smaller hover offset) */
  compact?: boolean;
}

export default function TeamMemberGrid({
  title,
  members,
  darkBg = false,
  compact = false,
}: TeamMemberGridProps) {
  return (
    <section
      className={`py-16 md:py-24 px-4 ${darkBg ? 'bg-pgi-dark-blue' : ''}`}
    >
      <div className="container mx-auto">
        <motion.h2
          className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <DecryptedText
            text={title}
            sequential={true}
            revealDirection="start"
            animateOn="view"
            speed={50}
            useOriginalCharsOnly={true}
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
          />
        </motion.h2>

        <motion.div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compact ? 'gap-4 md:gap-6' : 'gap-6 md:gap-8'}`}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {members.map(member => (
            <motion.div
              key={member.id}
              variants={memberItem}
              className={`bg-darkNavy ${compact ? 'p-4' : 'p-4 md:p-6'} rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300`}
              whileHover={{
                y: compact ? -3 : -5,
                transition: { duration: 0.2 },
              }}
            >
              <h3
                className={`${compact ? 'text-base md:text-lg' : 'text-lg md:text-xl'} font-medium ${member.linkedin ? 'mb-2' : ''} text-white`}
              >
                {member.name}
              </h3>
              <p
                className={`text-gray-300 ${member.linkedin ? 'mb-4' : ''} text-sm md:text-base font-light`}
              >
                {member.school}
              </p>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white hover:text-pgi-light-blue transition-colors text-sm md:text-base"
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
  );
}

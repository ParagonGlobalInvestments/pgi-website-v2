'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import { fadeIn, staggerContainer, itemFadeIn, buttonHover } from './animations';

const CountUp = dynamic(
  () => import('@/components/reactbits/TextAnimations/CountUp/CountUp'),
  { ssr: false }
);

interface StatItem {
  value: string;
  label: string;
}

interface AboutSectionProps {
  stats?: Record<string, StatItem>;
}

// Parse numeric value from stat string (e.g., "$70,000" -> 70, "300+" -> 300)
function parseStatValue(value: string): number {
  const numericPart = value.replace(/[^0-9.]/g, '');
  return parseFloat(numericPart) || 0;
}

// Format value with appropriate prefix/suffix
function formatStatDisplay(key: string, value: string): { prefix?: string; suffix?: string; numericValue: number } {
  if (key === 'fund_size' || value.startsWith('$')) {
    return { prefix: '$', suffix: 'K', numericValue: parseStatValue(value) / 1000 };
  }
  if (value.includes('+')) {
    return { suffix: '+', numericValue: parseStatValue(value) };
  }
  return { numericValue: parseStatValue(value) };
}

// Default stats if CMS data is unavailable
const DEFAULT_STATS: Record<string, StatItem> = {
  fund_size: { value: '$70,000', label: 'AUM' },
  sponsors_partners: { value: '27', label: 'Sponsors & Partners' },
  active_students: { value: '300+', label: 'Active Members' },
  chapters: { value: '8', label: 'Chapters' },
};

export default function AboutSection({ stats }: AboutSectionProps) {
  const displayStats = stats && Object.keys(stats).length > 0 ? stats : DEFAULT_STATS;

  // Define the order and keys we want to display
  const statKeys = ['fund_size', 'sponsors_partners', 'active_students', 'chapters'];

  return (
    <motion.section
      id="about-section"
      className="py-16 md:py-24 lg:py-32 px-4 bg-navy"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeIn}
    >
      <div className="container mx-auto">
        <motion.h2
          variants={fadeIn}
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-8 md:mb-12 lg:mb-16 text-center text-white"
        >
          <ShinyText
            text="PGI At a Glance"
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
          />
        </motion.h2>
        <div className="max-w-5xl mx-auto">
          <motion.p
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg lg:text-lg xl:text-lg mb-12 md:mb-16 lg:mb-20 text-gray-300 text-center font-light leading-relaxed"
          >
            Paragon Global Investments (PGI) is an intercollegiate,
            student-run fund with chapters at 8 top U.S. universities.
            Combining fundamental and systematic strategies, we manage a
            $70,000 portfolio. With 300+ active members, PGI annually attracts
            nearly 2,000 interested students nationwide.
          </motion.p>

          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mt-8 md:mt-12 lg:mt-16 text-center"
          >
            {statKeys.map((key) => {
              const stat = displayStats[key];
              if (!stat) return null;

              const { prefix, suffix, numericValue } = formatStatDisplay(key, stat.value);

              return (
                <motion.div
                  key={key}
                  variants={itemFadeIn}
                  className="p-6 md:p-8 lg:p-10 bg-pgi-light-blue border border-gray-700 rounded-lg"
                >
                  <p className="text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4">
                    {prefix}<CountUp to={numericValue} duration={1.5} delay={0.3} />{suffix}
                  </p>
                  <p className="text-gray-300 font-light text-sm md:text-base lg:text-lg">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* About Section CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 md:mt-16 lg:mt-20"
          >
            <Link href="/who-we-are">
              <motion.button
                className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                Learn More About Us
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

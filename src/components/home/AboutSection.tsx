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

export default function AboutSection() {
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
            <motion.div
              variants={itemFadeIn}
              className="p-6 md:p-8 lg:p-10 bg-pgi-light-blue border border-gray-700 rounded-lg"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4">
                $<CountUp to={70} duration={1} delay={0.3} />K
              </p>
              <p className="text-gray-300 font-light text-sm md:text-base lg:text-lg">
                AUM
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-6 md:p-8 lg:p-10 bg-pgi-light-blue border border-gray-700 rounded-lg"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4">
                <CountUp to={27} duration={1.5} delay={0.5} />
              </p>
              <p className="text-gray-300 font-light text-sm md:text-base lg:text-lg">
                Sponsors & Partners
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-6 md:p-8 lg:p-10 bg-pgi-light-blue border border-gray-700 rounded-lg"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4">
                <CountUp to={300} duration={1.5} delay={0.5} />+
              </p>
              <p className="text-gray-300 font-light text-sm md:text-base lg:text-lg">
                Active Members
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-6 md:p-8 lg:p-10 bg-pgi-light-blue border border-gray-700 rounded-lg"
            >
              <p className="text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4">
                <CountUp to={8} duration={1.5} delay={0.5} />
              </p>
              <p className="text-gray-300 font-light text-sm md:text-base lg:text-lg">
                Chapters
              </p>
            </motion.div>
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

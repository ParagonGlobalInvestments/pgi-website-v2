'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import { UNIVERSITIES } from '@/lib/constants/universities';
import { fadeIn, buttonHover } from './animations';

const AnimatedUniversityMasonry = dynamic(
  () => import('@/components/ui/AnimatedUniversityMasonry'),
  { ssr: false }
);

export default function ChaptersSection() {
  return (
    <motion.section
      className="py-16 md:py-24 bg-pgi-dark-blue px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeIn}
    >
      <div className="container mx-auto">
        <motion.h2
          variants={fadeIn}
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
        >
          <ShinyText
            text="Our Chapters"
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
          />
        </motion.h2>

        {/* Masonry Layout for Universities */}
        <motion.div variants={fadeIn} className="max-w-6xl mx-auto">
          <AnimatedUniversityMasonry
            universities={UNIVERSITIES}
            animateFrom="bottom"
            stagger={0.1}
            scaleOnHover={true}
            hoverScale={1.05}
            blurToFocus={true}
            colorShiftOnHover={false}
            threshold={0.3}
          />
        </motion.div>

        {/* Chapters Section CTA */}
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 md:mt-16 lg:mt-20"
        >
          <Link href="/contact">
            <motion.button
              className="bg-[#ced4da] text-darkNavy px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
              whileHover={buttonHover}
              whileTap={{ scale: 0.95 }}
            >
              Contact Your Chapter
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

'use client';

import Link from 'next/link';
import ScrollButton from '@/components/ui/ScrollButton';
import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  fadeIn,
  buttonContainer,
  buttonFadeIn,
  buttonHover,
  secondaryButtonHover,
} from './animations';

export default function HeroSection() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="text-white min-h-[100vh] flex flex-col justify-start lg:justify-center items-center relative scrollbar-none"
    >
      <div className="container mx-auto px-4 text-center lg:pt-0 pt-32">
        <motion.h1
          variants={fadeIn}
          className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extralight tracking-wide text-gray-300/50 mb-2 lg:mb-4 leading-tight"
        >
          <DecryptedText
            text="Paragon Global Investments"
            sequential={true}
            revealDirection="start"
            animateOn="view"
            speed={40}
            useOriginalCharsOnly={true}
            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white tracking-wide leading-tight"
          />
        </motion.h1>
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.4 }}
          style={{ color: '#d8d8d8' }}
          className="text-base md:text-lg lg:text-xl xl:text-2xl mb-8 mx-auto font-normal tracking-wide max-w-7xl leading-relaxed"
        >
          <ShinyText
            text="Intercollegiate quantitative investment fund focused on value investing and algorithmic trading"
            className="text-base md:text-lg lg:text-xl xl:text-2xl font-normal tracking-wide leading-relaxed"
          />
        </motion.div>

        {/* Hero CTAs */}
        <motion.div
          variants={buttonContainer}
          className="flex flex-wrap gap-4 md:gap-6 justify-center items-center mb-16 md:mb-20"
        >
          <motion.div variants={buttonFadeIn}>
            <Link href="/education">
              <motion.button
                className="bg-pgi-light-blue text-white md:px-8 lg:px-10 md:py-2 lg:py-3 py-2 px-4 rounded-lg font-semibold text-sm lg:text-sm tracking-wide hover:text-white"
                whileHover={secondaryButtonHover}
                whileTap={{ scale: 0.95 }}
              >
                View Our Programs
              </motion.button>
            </Link>
          </motion.div>
          <motion.div variants={buttonFadeIn}>
            <Link href="/apply">
              <motion.button
                className="bg-pgi-light-blue text-white md:px-8 lg:px-10 md:py-2 lg:py-3 py-2 px-4 rounded-lg font-semibold text-sm lg:text-sm tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                Join PGI
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        variants={fadeIn}
        transition={{ delay: 0.6 }}
        className="mx-auto text-center"
      >
        <ScrollButton targetId="about-section">
          <span className="mb-3 md:mb-4 font-light text-sm md:text-base">
            Learn More
          </span>
          <svg
            className="w-6 h-6 md:w-8 md:h-8 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </ScrollButton>
      </motion.div>
    </motion.section>
  );
}

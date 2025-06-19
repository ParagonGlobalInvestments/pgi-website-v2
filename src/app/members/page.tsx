'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';

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

const teamCardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  hover: {
    y: -10,
    backgroundColor: '#1f4287',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.3,
    },
  },
};

export default function MembersPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16 md:mb-20 lg:mb-24"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
              <ShinyText
                text="Our Members"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Meet the talented individuals who make up Paragon Global
              Investments. Our members are selected from top universities across
              the nation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
            {/* Value Team Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="rounded-lg"
              variants={teamCardVariant}
            >
              <Link href="/members/value-team" className="block">
                <div className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-all duration-300 h-full">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6 text-white">
                    <DecryptedText
                      text="Value Team"
                      sequential={true}
                      revealDirection="start"
                      animateOn="view"
                      speed={50}
                      useOriginalCharsOnly={true}
                      className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                    />
                  </h2>
                  <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-base lg:text-lg font-light leading-relaxed">
                    Our Value Team focuses on fundamental analysis and long-term
                    investment strategies. Meet our Investment Committee,
                    Portfolio Managers, and Analysts.
                  </p>
                  <span className="text-pgi-light-blue font-medium text-sm md:text-base">
                    View Team →
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Quant Team Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="rounded-lg"
              variants={teamCardVariant}
            >
              <Link href="/members/quant-team" className="block">
                <div className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-all duration-300 h-full">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6 text-white">
                    <DecryptedText
                      text="Quant Team"
                      sequential={true}
                      revealDirection="start"
                      animateOn="view"
                      speed={50}
                      useOriginalCharsOnly={true}
                      className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                    />
                  </h2>
                  <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-base lg:text-lg font-light leading-relaxed">
                    Our Quant Team specializes in data-driven investment
                    strategies and algorithmic trading. Meet our Quantitative
                    Research Committee and Analysts.
                  </p>
                  <span className="text-pgi-light-blue font-medium text-sm md:text-base">
                    View Team →
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

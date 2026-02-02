'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  fadeIn,
  staggerContainer,
  itemFadeIn,
  buttonHover,
  tabVariants,
} from './animations';

export default function EducationInvestmentSection() {
  const [activeTab, setActiveTab] = useState<'education' | 'investment'>(
    'investment'
  );

  return (
    <motion.section
      className="py-16 md:py-24 lg:py-32 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeIn}
    >
      <div className="container mx-auto">
        {/* Sliding Tab Toggle */}
        <motion.div
          variants={fadeIn}
          className="flex flex-row justify-center mb-8 md:mb-12 lg:mb-16"
        >
          <div className="relative bg-gray-800/50 rounded-full p-1 border border-gray-700">
            {/* Sliding Background */}
            <motion.div
              className="absolute top-1 bottom-1 bg-pgi-light-blue rounded-full"
              animate={{
                left: activeTab === 'investment' ? '4px' : '50%',
                right: activeTab === 'investment' ? '50%' : '4px',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />

            {/* Tab Buttons */}
            <div className="relative z-10 flex">
              <button
                onClick={() => setActiveTab('investment')}
                className={`px-6 py-3 text-xs md:text-base font-medium rounded-full transition-colors duration-200 ${
                  activeTab === 'investment'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Our Funds
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`px-6 py-3 text-xs md:text-base font-medium rounded-full transition-colors duration-200 ${
                  activeTab === 'education'
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Education
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Title */}
        <motion.h2
          variants={fadeIn}
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <ShinyText
                text={
                  activeTab === 'education'
                    ? 'Paragon Education Program'
                    : 'Investment Funds'
                }
                className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
              />
            </motion.div>
          </AnimatePresence>
        </motion.h2>

        {/* Content Area */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full"
            >
              {activeTab === 'education' ? (
                // Education Content
                <div className={`${activeTab === 'education' ? '' : 'bg-navy'}`}>
                  <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
                  >
                    <motion.div
                      variants={itemFadeIn}
                      className="p-4 md:p-6 lg:p-8 bg-darkNavy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
                    >
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6 text-white">
                        <DecryptedText
                          text="Value Investment"
                          sequential={true}
                          revealDirection="start"
                          animateOn="view"
                          speed={40}
                          useOriginalCharsOnly={true}
                          className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                        />
                      </h3>
                      <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                        Learn about the basic of accounting, valuation, modeling,
                        and bottom-up analysis of companies. Students will learn
                        to develop value-based investment research on publicly
                        traded companies.
                      </p>
                    </motion.div>
                    <motion.div
                      variants={itemFadeIn}
                      className="p-4 md:p-6 lg:p-8 bg-darkNavy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
                    >
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6 text-white">
                        <DecryptedText
                          text="Algorithmic Trading"
                          sequential={true}
                          revealDirection="start"
                          animateOn="view"
                          speed={40}
                          useOriginalCharsOnly={true}
                          className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                        />
                      </h3>
                      <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                        Students will learn about quantitative analysis in python,
                        modern portfolio theory and quantitative portfolio
                        allocation, and how to research, design, and implement
                        systematic algorithmic trading strategies.
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Education CTA */}
                  <motion.div
                    variants={fadeIn}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-8 md:mt-12 lg:mt-16"
                  >
                    <Link href="/education">
                      <motion.button
                        className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                        whileHover={buttonHover}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Full Curriculum
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              ) : (
                // Investment Funds Content
                <div className="">
                  <motion.div
                    variants={staggerContainer}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
                  >
                    <motion.div
                      variants={itemFadeIn}
                      className="p-4 md:p-6 lg:p-8 bg-pgi-light-blue border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
                    >
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6 text-white">
                        <DecryptedText
                          text="Paragon Value"
                          sequential={true}
                          revealDirection="start"
                          animateOn="view"
                          speed={50}
                          useOriginalCharsOnly={true}
                          className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                        />
                      </h3>
                      <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                        The Paragon Value Fund is a well-diversified, long-only
                        fund focused on identifying mispriced assets using a
                        bottom-up, value-based approach. Total portfolio risk and
                        return are optimized through quantitative portfolio
                        allocation measures.
                      </p>
                    </motion.div>
                    <motion.div
                      variants={itemFadeIn}
                      className="p-4 md:p-6 lg:p-8 bg-pgi-light-blue border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
                    >
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 md:mb-6 text-white">
                        <DecryptedText
                          text="Paragon Systematic"
                          sequential={true}
                          revealDirection="start"
                          animateOn="view"
                          speed={50}
                          useOriginalCharsOnly={true}
                          className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                        />
                      </h3>
                      <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                        The Paragon Systematic Fund employs systematic algorithmic
                        trading strategies that utilize quantitative analysis of
                        public securities. Students develop algorithms using
                        advanced mathematical analysis to identify strategies with
                        uncorrelated returns.
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Investment Funds CTA */}
                  <motion.div
                    variants={fadeIn}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-8 md:mt-12 lg:mt-16"
                  >
                    <Link href="/investment-strategy">
                      <motion.button
                        className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                        whileHover={buttonHover}
                        whileTap={{ scale: 0.95 }}
                      >
                        Learn About Our Funds
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import ScrollButton from '@/components/ui/ScrollButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import CountUp from '@/components/reactbits/TextAnimations/CountUp/CountUp';
import InfiniteScroll from '@/components/reactbits/Components/InfiniteScroll/InfiniteScroll';
import AnimatedUniversityMasonry from '@/components/ui/AnimatedUniversityMasonry';
import {
  INVESTMENT_BANKING_COMPANIES,
  QUANT_TECH_COMPANIES,
  ASSET_MGMT_CONSULTING_COMPANIES,
  SPONSORS_COMPANIES,
  PARTNERS_COMPANIES,
  type Company,
} from '@/lib/constants/companies';
import { UNIVERSITIES, type University } from '@/lib/constants/universities';
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

const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const logoAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
};

// Button animation variants
const buttonContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.8,
    },
  },
};

const buttonFadeIn = {
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

const buttonHover = {
  scale: 1.05,
  backgroundColor: '#1f4287',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

const secondaryButtonHover = {
  scale: 1.05,
  backgroundColor: '#2a5298',
  borderColor: '#ffffff',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

// Company Logo Component
const CompanyLogo = ({ company }: { company: Company }) => (
  <a
    href={company.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group w-full"
  >
    <div className="bg-transparent rounded-lg p-2 transition-all duration-300 group-hover:scale-105">
      <div className="h-12 w-full flex items-center justify-center">
        <Image
          src={company.imagePath}
          alt={company.displayName}
          width={100}
          height={100}
          className="object-contain max-w-full max-h-full"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '200px',
            maxHeight: '200px',
          }}
        />
      </div>
    </div>
  </a>
);

// Sponsor/Partner Logo Component
const SponsorLogo = ({ company }: { company: Company }) => (
  <a
    href={company.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group"
  >
    <div className=" flex items-center justify-center transition-all duration-300 group-hover:scale-105">
      <Image
        src={company.imagePath}
        alt={company.displayName}
        width={200}
        height={200}
        className="object-contain max-w-full max-h-full"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '200px',
          maxHeight: '200px',
        }}
      />
    </div>
  </a>
);

// Enhanced Sponsor/Partner Logo Component with optimized sizing
const EnhancedSponsorLogo = ({ company }: { company: Company }) => (
  <a
    href={company.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group"
  >
    <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-105 ">
      <Image
        src={company.imagePath}
        alt={company.displayName}
        width={120}
        height={120}
        className="object-contain max-w-full max-h-full"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '120px',
          maxHeight: '80px',
        }}
      />
    </div>
  </a>
);

// Combined Sponsors & Partners Section Component
const CombinedSponsorsPartnersSection = () => {
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

  const logoAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  const buttonHover = {
    scale: 1.05,
    backgroundColor: '#1f4287',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  };

  // Select top 5 sponsors and partners with priority to sponsors
  const selectedSponsors = SPONSORS_COMPANIES.slice(0, 5);
  const selectedPartners = PARTNERS_COMPANIES.slice(0, 5);

  return (
    <>
      {/* Main Title */}
      <motion.h2
        variants={fadeIn}
        className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
      >
        <ShinyText
          text="Our Sponsors & Partners"
          className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
        />
      </motion.h2>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 relative">
        {/* Animated Vertical Divider - Hidden on mobile */}
        <motion.div
          className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pgi-light-blue to-transparent transform -translate-x-1/2"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Sponsors Section - Left Half */}
        <motion.div variants={fadeIn} className="flex-1 lg:pr-8">
          <motion.h3
            variants={fadeIn}
            className="text-xl md:text-2xl lg:text-3xl font-medium mb-8 text-center text-white"
          >
            <DecryptedText
              text="Sponsors"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
            />
          </motion.h3>

          {/* Sponsors Grid - 3 top, 2 bottom */}
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-lg mx-auto"
          >
            {selectedSponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                variants={logoAnimation}
                className={`flex items-center justify-center ${
                  index < 3
                    ? 'w-[calc(33.333%-0.5rem)] md:w-[calc(33.333%-1rem)]'
                    : 'w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)]'
                }`}
              >
                <EnhancedSponsorLogo company={sponsor} />
              </motion.div>
            ))}
          </motion.div>

          {/* Sponsors CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Link href="/sponsors">
              <motion.button
                className="bg-pgi-light-blue text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                View All Sponsors
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Partners Section - Right Half */}
        <motion.div variants={fadeIn} className="flex-1 lg:pl-8">
          <motion.h3
            variants={fadeIn}
            className="text-xl md:text-2xl lg:text-3xl font-medium mb-8 text-center text-white"
          >
            <DecryptedText
              text="Partners"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
            />
          </motion.h3>

          {/* Partners Grid - 3 top, 2 bottom */}
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-lg mx-auto"
          >
            {selectedPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                variants={logoAnimation}
                className={`flex items-center justify-center ${
                  index < 3
                    ? 'w-[calc(33.333%-0.5rem)] md:w-[calc(33.333%-1rem)]'
                    : 'w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)]'
                }`}
              >
                <EnhancedSponsorLogo company={partner} />
              </motion.div>
            ))}
          </motion.div>

          {/* Partners CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <Link href="/sponsors">
              <motion.button
                className="bg-pgi-light-blue text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                View All Partners
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

// Combined Education & Investment Section Component
const CombinedEducationInvestmentSection = () => {
  const [activeTab, setActiveTab] = useState<'education' | 'investment'>(
    'investment'
  );

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
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

  const itemFadeIn = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

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

  const buttonHover = {
    scale: 1.05,
    backgroundColor: '#1f4287',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  };

  return (
    <>
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
    </>
  );
};

export default function Home() {
  return (
    <div className="scrollbar-none">
      {/* Hero Section */}
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

      {/* About Section */}
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
              $40,000 portfolio. With 300+ active members, PGI annually attracts
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
                  $<CountUp to={40} duration={1} delay={0.3} />K
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
                  <CountUp to={21} duration={1.5} delay={0.5} />
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

      {/* Chapters Section */}
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

      {/* Our Placements Section */}
      <motion.section
        className="bg-navy py-16 md:py-24 lg:py-32 px-4 lg:min-h-screen"
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
              text="Our Placements"
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h2>

          {/* Three Column Layout - Stack on mobile, side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 ">
            {/* Quantitative Trading & Technology Column */}
            <motion.div
              variants={itemFadeIn}
              className="flex-1 flex flex-col items-center"
            >
              <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white mb-6 text-center">
                <DecryptedText
                  text="Quantitative Trading & Technology"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                />
              </h3>
              <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-bl from-darkNavy via-pgi-dark-blue to-darkNavy shadow-xl">
                <style>
                  {`
                      .quant-tech-scroll .infinite-scroll-wrapper {
                        max-height: 300px;
                      }
                      @media (min-width: 1024px) {
                        .quant-tech-scroll .infinite-scroll-wrapper {
                          max-height: 400px;
                        }
                      }
                    `}
                </style>
                <div className="quant-tech-scroll">
                  <InfiniteScroll
                    width="200px"
                    maxHeight="300px"
                    items={QUANT_TECH_COMPANIES.map(company => ({
                      content: <CompanyLogo company={company} />,
                    }))}
                    itemMinHeight={80}
                    isTilted={false}
                    tiltDirection="left"
                    autoplay={true}
                    autoplaySpeed={2}
                    autoplayDirection="down"
                    pauseOnHover={true}
                    negativeMargin="-5px"
                  />
                </div>
              </div>
            </motion.div>

            {/* Investment Banking Column */}
            <motion.div
              variants={itemFadeIn}
              className="flex-1 flex flex-col items-center"
            >
              <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white mb-6 text-center">
                <DecryptedText
                  text="Investment Banking"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                />
              </h3>
              <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-br from-darkNavy via-pgi-dark-blue to-darkNavy shadow-xl">
                <style>
                  {`
                      .investment-banking-scroll .infinite-scroll-wrapper {
                        max-height: 300px;
                      }
                      @media (min-width: 1024px) {
                        .investment-banking-scroll .infinite-scroll-wrapper {
                          max-height: 400px;
                        }
                      }
                    `}
                </style>
                <div className="investment-banking-scroll">
                  <InfiniteScroll
                    width="200px"
                    maxHeight="300px"
                    items={INVESTMENT_BANKING_COMPANIES.map(company => ({
                      content: <CompanyLogo company={company} />,
                    }))}
                    itemMinHeight={80}
                    isTilted={false}
                    tiltDirection="right"
                    autoplay={true}
                    autoplaySpeed={2}
                    autoplayDirection="down"
                    pauseOnHover={true}
                    negativeMargin="-5px"
                  />
                </div>
              </div>
            </motion.div>

            {/* Asset Management & Consulting Column */}
            <motion.div
              variants={itemFadeIn}
              className="flex-1 flex flex-col items-center"
            >
              <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white mb-6 text-center">
                <DecryptedText
                  text="Asset Management & Consulting"
                  sequential={true}
                  revealDirection="start"
                  animateOn="view"
                  speed={20}
                  useOriginalCharsOnly={true}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                />
              </h3>
              <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-bl from-darkNavy via-pgi-dark-blue to-darkNavy shadow-xl">
                <style>
                  {`
                      .asset-mgmt-scroll .infinite-scroll-wrapper {
                        max-height: 300px;
                      }
                      @media (min-width: 1024px) {
                        .asset-mgmt-scroll .infinite-scroll-wrapper {
                          max-height: 400px;
                        }
                      }
                    `}
                </style>
                <div className="asset-mgmt-scroll">
                  <InfiniteScroll
                    width="200px"
                    maxHeight="300px"
                    items={ASSET_MGMT_CONSULTING_COMPANIES.map(company => ({
                      content: <CompanyLogo company={company} />,
                    }))}
                    itemMinHeight={80}
                    isTilted={false}
                    tiltDirection="left"
                    autoplay={true}
                    autoplaySpeed={2}
                    autoplayDirection="down"
                    pauseOnHover={true}
                    negativeMargin="-5px"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 md:mt-16 lg:mt-20"
          >
            <Link href="/placements">
              <motion.button
                className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                View All Placements
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Combined Education & Investment Funds Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <CombinedEducationInvestmentSection />
        </div>
      </motion.section>

      {/* Combined Sponsors & Partners Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4 bg-navy"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <CombinedSponsorsPartnersSection />
        </div>
      </motion.section>
    </div>
  );
}

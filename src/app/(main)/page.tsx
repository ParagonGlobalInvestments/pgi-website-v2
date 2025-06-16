'use client';

import Image from 'next/image';
import ScrollButton from '@/components/ui/ScrollButton';
import { motion } from 'framer-motion';

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

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-white min-h-[100vh] flex flex-col justify-start lg:justify-center items-center relative"
      >
        <div className="container mx-auto px-4 text-center py-32">
          <motion.h1
            variants={fadeIn}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-wide mb-6 md:mb-10 lg:mb-12 leading-tight"
          >
            Paragon Global Investments
          </motion.h1>
          <motion.h2
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            style={{ color: '#d8d8d8' }}
            className="text-xl md:text-3xl lg:text-4xl xl:text-5xl mb-4 md:mb-6 lg:mb-8 font-normal tracking-wide max-w-5xl mx-auto leading-relaxed"
          >
            Intersecting Value Investing and Quantitative Finance
          </motion.h2>
          <motion.p
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            style={{ color: '#d8d8d8' }}
            className="text-base md:text-lg lg:text-xl xl:text-2xl mb-12 md:mb-16 lg:mb-20 mx-auto font-light tracking-wide max-w-4xl leading-relaxed"
          >
            Student-run intercollegiate investment fund focused on value
            investing and algorithmic trading
          </motion.p>
        </div>
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.6 }}
          className="absolute bottom-[20vh] text-center"
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
        className="py-16 md:py-24 lg:py-32 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
          >
            PGI At a Glance
          </motion.h2>
          <div className="max-w-5xl mx-auto">
            <motion.p
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl xl:text-2xl mb-12 md:mb-16 lg:mb-20 text-gray-300 text-center font-light leading-relaxed"
            >
              Paragon Global Investments (PGI) is a student-run intercollegiate
              investment fund with 8 chapters at top universities in the United
              States. We utilize both fundamental and systematic trading
              strategies to invest into our $40,000 investment fund. Since our
              inception, we have grown to 300+ active students and every year we
              receive close to 2,000 students interested in joining organization
              nationally.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 mt-8 md:mt-12 lg:mt-16 text-center"
            >
              <motion.div
                variants={itemFadeIn}
                className="p-6 md:p-8 lg:p-10 bg-pgi-light-blue border border-gray-700 rounded-lg"
              >
                <p className="text-2xl md:text-3xl lg:text-4xl font-normal mb-3 md:mb-4">
                  $40K
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
                  21
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
                  8
                </p>
                <p className="text-gray-300 font-light text-sm md:text-base lg:text-lg">
                  Chapters
                </p>
              </motion.div>
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
            Our Chapters
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-10"
          >
            {/* Brown University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/brown.png"
                alt="Brown University"
                width={148}
                height={148}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* Columbia University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/columbia.png"
                alt="Columbia University"
                width={156}
                height={156}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* Cornell University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/cornell.png"
                alt="Cornell University"
                width={128}
                height={128}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* University of Pennsylvania */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/upenn.png"
                alt="University of Pennsylvania"
                width={216}
                height={216}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* University of Chicago */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/uchicago.png"
                alt="University of Chicago"
                width={100}
                height={100}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* Princeton University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/princeton.png"
                alt="Princeton University"
                width={250}
                height={250}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* NYU */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/nyu.png"
                alt="NYU"
                width={128}
                height={128}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>

            {/* Yale University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 md:p-8 lg:p-10 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
            >
              <Image
                src="/images/universities/yale.png"
                alt="Yale University"
                width={128}
                height={128}
                className="object-contain max-w-full h-auto"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Sponsors Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4"
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
            Sponsors
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10"
          >
            {/* Placeholder for sponsor logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={index}
                  variants={logoAnimation}
                  className="p-6 md:p-8 lg:p-10 bg-navy border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
                >
                  <div className="w-24 h-12 md:w-32 md:h-16 lg:w-36 lg:h-18 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 text-xs md:text-sm">
                    Sponsor Logo
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Partners Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 bg-navy px-4 border-t border-b border-gray-800"
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
            Partners
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10"
          >
            {/* Placeholder for partner logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={index}
                  variants={logoAnimation}
                  className="p-6 md:p-8 lg:p-10 bg-navy border border-gray-700 rounded-lg flex items-center justify-center hover:border-gray-600 transition-colors duration-300"
                >
                  <div className="w-24 h-12 md:w-32 md:h-16 lg:w-36 lg:h-18 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300 text-xs md:text-sm">
                    Partner Logo
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4"
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
            Education
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
          >
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-navy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
            >
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 text-white">
                Value Investment
              </h3>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                Learn about the basic of accounting, valuation, modeling, and
                bottom-up analysis of companies. Students will learn to develop
                value-based investment research on publicly traded companies.
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-navy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
            >
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 text-white">
                Algorithmic Trading
              </h3>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                Students will learn about quantitative analysis in python,
                modern portfolio theory and quantitative portfolio allocation,
                and how to research, design, and implement systematic
                algorithmic trading strategies.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Investment Funds Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 bg-navy px-4 border-t border-b border-gray-800"
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
            Investment Funds
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
          >
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-navy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
            >
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 text-white">
                Paragon Value
              </h3>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                The Paragon Value Fund is a well-diversified, long-only fund
                focused on identifying mispriced assets using a bottom-up,
                value-based approach. Total portfolio risk and return are
                optimized through quantitative portfolio allocation measures.
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-navy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
            >
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 text-white">
                Paragon Systematic
              </h3>
              <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                The Paragon Systematic Fund employs systematic algorithmic
                trading strategies that utilize quantitative analysis of public
                securities. Students develop algorithms using advanced
                mathematical analysis to identify strategies with uncorrelated
                returns.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

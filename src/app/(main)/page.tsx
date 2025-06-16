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
        className=" text-white min-h-[90vh] flex flex-col justify-center items-center relative"
      >
        <div className="container mx-auto px-4 text-center py-20">
          <motion.h1
            variants={fadeIn}
            className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-wide mb-8"
          >
            Paragon Global Investments
          </motion.h1>
          <motion.h2
            variants={fadeIn}
            transition={{ delay: 0.2 }}
            style={{ color: '#d8d8d8' }}
            className="text-2xl md:text-3xl lg:text-4xl mb-2 font-normal tracking-wide"
          >
            Intersecting Value Investing and Quantitative Finance
          </motion.h2>
          <motion.p
            variants={fadeIn}
            transition={{ delay: 0.4 }}
            style={{ color: '#d8d8d8' }}
            className="text-lg md:text-xl mb-10 mx-auto font-light tracking-wide"
          >
            Student-run intercollegiate investment fund focused on value
            investing and algorithmic trading
          </motion.p>
        </div>
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.6 }}
          className="absolute bottom-12 text-center"
        >
          <ScrollButton targetId="about-section">
            <span className="mb-2 font-light">Learn More</span>
            <svg
              className="w-8 h-8 animate-bounce"
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
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-light mb-10 text-center text-white"
          >
            PGI At a Glance
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.p
              variants={fadeIn}
              transition={{ delay: 0.2 }}
              className="text-lg mb-6 text-gray-300 text-center font-light"
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
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-center"
            >
              <motion.div
                variants={itemFadeIn}
                className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg"
              >
                <p className="text-3xl font-normal mb-2">$40K</p>
                <p className="text-gray-300 font-light">AUM</p>
              </motion.div>
              <motion.div
                variants={itemFadeIn}
                className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg"
              >
                <p className="text-3xl font-normal mb-2">21</p>
                <p className="text-gray-300 font-light">Sponsors & Partners</p>
              </motion.div>
              <motion.div
                variants={itemFadeIn}
                className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg"
              >
                <p className="text-3xl font-normal mb-2">8</p>
                <p className="text-gray-300 font-light">Chapters</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Chapters Section */}
      <motion.section
        className="py-4 bg-pgi-dark-blue px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-light mb-10 text-center text-white"
          >
            Our Chapters
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {/* Brown University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/brown.png"
                alt="Brown University"
                width={148}
                height={148}
                className="object-contain"
              />
            </motion.div>

            {/* Columbia University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/columbia.png"
                alt="Columbia University"
                width={156}
                height={156}
                className="object-contain"
              />
            </motion.div>

            {/* Cornell University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/cornell.png"
                alt="Cornell University"
                width={128}
                height={128}
                className="object-contain"
              />
            </motion.div>

            {/* University of Pennsylvania */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/upenn.png"
                alt="University of Pennsylvania"
                width={216}
                height={216}
                className="object-contain"
              />
            </motion.div>

            {/* University of Chicago */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/uchicago.png"
                alt="University of Chicago"
                width={100}
                height={100}
                className="object-contain"
              />
            </motion.div>

            {/* Princeton University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/princeton.png"
                alt="Princeton University"
                width={250}
                height={250}
                className="object-contain"
              />
            </motion.div>

            {/* NYU */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/nyu.png"
                alt="NYU"
                width={128}
                height={128}
                className="object-contain"
              />
            </motion.div>

            {/* Yale University */}
            <motion.div
              variants={logoAnimation}
              className="p-6 bg-pgi-dark-blue border border-gray-700 rounded-lg flex items-center justify-center"
            >
              <Image
                src="/images/universities/yale.png"
                alt="Yale University"
                width={128}
                height={128}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Sponsors Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-light mb-10 text-center text-white"
          >
            Sponsors
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {/* Placeholder for sponsor logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={index}
                  variants={logoAnimation}
                  className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center"
                >
                  <div className="w-32 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
                    Sponsor Logo
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Partners Section */}
      <motion.section
        className="py-16 bg-navy px-4 border-t border-b border-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-bold mb-10 text-center text-white"
          >
            Partners
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {/* Placeholder for partner logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <motion.div
                  key={index}
                  variants={logoAnimation}
                  className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center"
                >
                  <div className="w-32 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
                    Partner Logo
                  </div>
                </motion.div>
              ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Education Section */}
      <motion.section
        className="py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-bold mb-10 text-center text-white"
          >
            Education
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div
              variants={itemFadeIn}
              className="p-8 bg-navy border border-gray-700 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Value Investment</h3>
              <p className="text-gray-300">
                Learn about the basic of accounting, valuation, modeling, and
                bottom-up analysis of companies. Students will learn to develop
                value-based investment research on publicly traded companies.
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-8 bg-navy border border-gray-700 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Algorithmic Trading</h3>
              <p className="text-gray-300">
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
        className="py-16 bg-navy px-4 border-t border-b border-gray-800"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h2
            variants={fadeIn}
            className="text-3xl font-bold mb-10 text-center text-white"
          >
            Investment Funds
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.div
              variants={itemFadeIn}
              className="p-8 bg-navy border border-gray-700 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Paragon Value</h3>
              <p className="text-gray-300">
                The Paragon Value Fund is a well-diversified, long-only fund
                focused on identifying mispriced assets using a bottom-up,
                value-based approach. Total portfolio risk and return are
                optimized through quantitative portfolio allocation measures.
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-8 bg-navy border border-gray-700 rounded-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Paragon Systematic</h3>
              <p className="text-gray-300">
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

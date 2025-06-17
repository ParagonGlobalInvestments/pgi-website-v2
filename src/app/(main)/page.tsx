'use client';

import Image from 'next/image';
import Link from 'next/link';
import ScrollButton from '@/components/ui/ScrollButton';
import { motion } from 'framer-motion';
import CountUp from '@/components/reactbits/TextAnimations/CountUp/CountUp';
import InfiniteScroll from '@/components/reactbits/Components/InfiniteScroll/InfiniteScroll';
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

// University Logo Component
const UniversityLogo = ({ university }: { university: University }) => (
  <a
    href={university.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group"
  >
    <div className=" flex items-center justify-center  transition-colors duration-300 h-40">
      <Image
        src={university.imagePath}
        alt={university.displayName}
        width={120}
        height={120}
        className="object-contain max-w-full max-h-full group-hover:scale-105 transition-transform duration-300"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '120px',
          maxHeight: '120px',
        }}
      />
    </div>
  </a>
);

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
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-wide mb-6 lg:mb-8 leading-tight"
          >
            Paragon Global Investments
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
                  className="bg-gray-200  text-pgi-dark-blue md:px-8 lg:px-10 md:py-3 lg:py-4 py-2 px-4 rounded-lg font-semibold text-sm lg:text-base tracking-wide hover:text-white"
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
                  className="bg-pgi-light-blue text-white md:px-8 lg:px-10 md:py-3 lg:py-4 py-2 px-4 rounded-lg font-semibold text-sm lg:text-base tracking-wide"
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
          className="absolute bottom-[25vh] text-center"
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
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-8 md:mb-12 lg:mb-16 text-center text-white"
          >
            <ShinyText
              text="PGI At a Glance"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
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
              className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10 mt-8 md:mt-12 lg:mt-16 text-center"
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
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-10"
          >
            {UNIVERSITIES.map(university => (
              <motion.div key={university.name} variants={logoAnimation}>
                <UniversityLogo university={university} />
              </motion.div>
            ))}
          </motion.div>

          {/* Chapters Section CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 md:mt-16 lg:mt-20"
          >
            <Link href="/contact">
              <motion.button
                className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
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
        className="bg-pgi-dark-blue py-16 md:py-24 lg:py-32 px-4 lg:min-h-screen"
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
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
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
                  speed={30}
                  useOriginalCharsOnly={true}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                />
              </h3>
              <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-lg bg-gradient-to-bl from-darkNavy via-pgi-dark-blue to-darkNavy shadow-lg">
                <style>
                  {`
                      .quant-tech-scroll .infinite-scroll-wrapper {
                        max-height: 300px;
                      }
                      @media (min-width: 1024px) {
                        .quant-tech-scroll .infinite-scroll-wrapper {
                          max-height: 600px;
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
                    isTilted={true}
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
                  speed={30}
                  useOriginalCharsOnly={true}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                />
              </h3>
              <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-lg bg-gradient-to-br from-darkNavy via-pgi-dark-blue to-darkNavy shadow-lg">
                <style>
                  {`
                      .investment-banking-scroll .infinite-scroll-wrapper {
                        max-height: 300px;
                      }
                      @media (min-width: 1024px) {
                        .investment-banking-scroll .infinite-scroll-wrapper {
                          max-height: 600px;
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
                    isTilted={true}
                    tiltDirection="right"
                    autoplay={true}
                    autoplaySpeed={2}
                    autoplayDirection="up"
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
                  speed={30}
                  useOriginalCharsOnly={true}
                  className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                />
              </h3>
              <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-lg bg-gradient-to-bl from-darkNavy via-pgi-dark-blue to-darkNavy shadow-lg">
                <style>
                  {`
                      .asset-mgmt-scroll .infinite-scroll-wrapper {
                        max-height: 300px;
                      }
                      @media (min-width: 1024px) {
                        .asset-mgmt-scroll .infinite-scroll-wrapper {
                          max-height: 600px;
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
                    isTilted={true}
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

      {/* Education Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 bg-navy px-4"
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
              text="Our Education Program"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
          >
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-darkNavy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
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
                Learn about the basic of accounting, valuation, modeling, and
                bottom-up analysis of companies. Students will learn to develop
                value-based investment research on publicly traded companies.
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-darkNavy border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
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
                modern portfolio theory and quantitative portfolio allocation,
                and how to research, design, and implement systematic
                algorithmic trading strategies.
              </p>
            </motion.div>
          </motion.div>

          {/* Education Section CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 md:mt-16 lg:mt-20"
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
      </motion.section>

      {/* Investment Funds Section */}
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
            <ShinyText
              text="Investment Funds"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
          >
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-pgi-light-blue border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
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
                The Paragon Value Fund is a well-diversified, long-only fund
                focused on identifying mispriced assets using a bottom-up,
                value-based approach. Total portfolio risk and return are
                optimized through quantitative portfolio allocation measures.
              </p>
            </motion.div>
            <motion.div
              variants={itemFadeIn}
              className="p-8 md:p-10 lg:p-12 bg-pgi-light-blue border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-300"
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
                trading strategies that utilize quantitative analysis of public
                securities. Students develop algorithms using advanced
                mathematical analysis to identify strategies with uncorrelated
                returns.
              </p>
            </motion.div>
          </motion.div>

          {/* Investment Funds Section CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.6 }}
            className="text-center mt-12 md:mt-16 lg:mt-20"
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
      </motion.section>

      {/* Sponsors Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 bg-navy px-4"
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
              text="Sponsors"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-10 items-center"
          >
            {SPONSORS_COMPANIES.slice(0, 5).map((sponsor, index) => (
              <motion.div key={sponsor.name} variants={logoAnimation}>
                <SponsorLogo company={sponsor} />
              </motion.div>
            ))}
          </motion.div>

          {/* Sponsors Section CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 "
          >
            <Link href="/sponsors">
              <motion.button
                className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                View All Sponsors
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Partners Section */}
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
            <ShinyText
              text="Partners"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-10 items-center"
          >
            {PARTNERS_COMPANIES.slice(0, 5).map((partner, index) => (
              <motion.div key={partner.name} variants={logoAnimation}>
                <SponsorLogo company={partner} />
              </motion.div>
            ))}
          </motion.div>

          {/* Partners Section CTA */}
          <motion.div
            variants={fadeIn}
            transition={{ delay: 0.8 }}
            className="text-center mt-12 "
          >
            <Link href="/sponsors">
              <motion.button
                className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                whileHover={buttonHover}
                whileTap={{ scale: 0.95 }}
              >
                View All Partners
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

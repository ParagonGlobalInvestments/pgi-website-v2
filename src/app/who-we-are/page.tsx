'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Newspaper } from 'lucide-react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import AnimatedUniversityMasonry from '@/components/ui/AnimatedUniversityMasonry';
import { UNIVERSITIES } from '@/lib/constants/universities';

// Animation variants from home page
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

const buttonHover = {
  scale: 1.05,
  backgroundColor: '#1f4287',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

const timelineItemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function WhoWeAre() {
  // Timeline events data
  const timelineEvents = [
    {
      date: '18th Oct, 2023',
      title: 'Paragon Cornell',
      description:
        'Paragon officially opens its sixth chapter at Cornell University.',
    },
    {
      date: '15th Nov, 2023',
      title: 'BamSEC Partnership',
      description:
        'Paragon and BamSEC partner to provide Paragon students with unparalleled access to financial information.',
    },
    {
      date: '30th Oct, 2023',
      title: 'Paragon Brown',
      description:
        'Paragon officially opens its fifth chapter at Brown University.',
    },
    {
      date: '5th Oct, 2023',
      title: 'Paragon Columbia',
      description:
        'Paragon officially opens its fourth chapter at Columbia University.',
    },
    {
      date: '30th Sep, 2023',
      title: 'CloudQuant/Kershner Partnership',
      description:
        'CloudQuant and Paragon partner, which provides Paragon access to 15,000 alternative data sets to conduct signal research on!',
    },
    {
      date: '30th Aug, 2023',
      title: 'Visible Alpha Partnership',
      description:
        'Visible Alpha, one of the largest financial data providers, partners with Paragon to give our students access to information to aid or investment research.',
    },
    {
      date: '18th Aug, 2023',
      title: 'Paragon NYU',
      description:
        'Paragon officially opens its third chapter at New York University.',
    },
    {
      date: '10th Jul, 2023',
      title: 'Kirkland and Ellis Partnership',
      description:
        'Kirkland and Ellis, one of the largest law firms in the US, becomes the official legal advisor for PNG',
    },
    {
      date: '12th May, 2023',
      title: 'Citadel Sponsorship',
      description:
        'Citadel, one of the largest hedge funds in the world with more than $60bn in AUM, sponsors Paragon.',
    },
    {
      date: '11th May, 2023',
      title: 'DRW Sponsorship',
      description:
        'DRW, one of the top quantitative trading firms in the US, sponsors Paragon.',
    },
    {
      date: '2nd April, 2023',
      title: 'Elevate Partnership',
      description:
        'Paragon partners with Elevate--the largest recruiting platform for Investment Banking, Private Equity, and Hedge Funds--to bring exclusive recruiting opportunities to our students',
    },
    {
      date: '24th March, 2023',
      title: 'Jane Street Sponsorship',
      description:
        'Jane Street, one of the largest quantitative trading firms in the world, officially sponsors Paragon.',
    },
    {
      date: '6th March, 2023',
      title: 'WSO Partnership',
      description:
        'Paragon partners with Wall Street Oasis, the largest community focused on careers in finance, to bring Paragon members exclusive resources and opportunities.',
    },
    {
      date: '12th Oct, 2022',
      title: 'Non-Profit Recognition',
      description:
        'Paragon is officially registered and recognized as a 501(c)(3) tax-exempt not-for-profit organization.',
    },
    {
      date: '2nd Oct, 2022',
      title: 'Paragon UPenn',
      description:
        'Paragon Global Investments officially opens its second chapter at the University of Pennsylvania.',
    },
    {
      date: '10th Sept, 2022',
      title: 'Paragon Investment Fund Launch',
      description:
        'Thanks to generous donors, Paragon Global Investments officially launches its flagship investment fund where students can invest into real publicly traded equities using value investing and quantitative based techniques.',
    },
    {
      date: '26th Dec, 2021',
      title: 'Paragon is Founded',
      description:
        'Paragon Global Investments launches its first chapter with the goal of educating students on the interesection of value investing, software development, and quantitative finance.',
    },
  ];

  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h1
            variants={fadeIn}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
          >
            <ShinyText
              text="Who We Are"
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h1>

          <motion.div
            className="max-w-5xl mx-auto text-center"
            variants={staggerContainer}
          >
            <motion.p
              className="text-base md:text-lg lg:text-xl mb-8 md:mb-12 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Paragon Global Investments (formerly PNG) is a student-led
              intercollegiate investment fund with chapters at Brown University,
              Columbia University, Cornell University, New York University,
              Princeton University, Yale University, the University of Chicago,
              and the University of Pennsylvania. The organization is dedicated
              to the development of students in value investing and algorithmic
              trading.
            </motion.p>

            <motion.p
              className="text-base md:text-lg lg:text-xl mb-8 md:mb-12 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Students admitted to Paragon follow an educational curriculum that
              teaches applied value investing and algorithmic trading. Upon
              completing the education portion, students will join the
              organization either as investment analysts or quantitative
              analysts, working on stock pitches or designing systematic
              algorithms that will be invested into or deployed into Paragon&apos;s
              $70,000 investment funds.
            </motion.p>

            <motion.p
              className="text-base md:text-lg lg:text-xl mb-12 md:mb-16 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Since our inception, we have grown to 300+ active students and
              every year we receive close to 2,000 students interested in
              joining our organization nationally.
            </motion.p>
          </motion.div>

          {/* University Chapters Section */}
          <motion.div className="mt-16 md:mt-24 lg:mt-32" variants={fadeIn}>
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

            {/* CTA Button */}
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
          </motion.div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4 bg-navy"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={fadeIn}
      >
        <div className="container mx-auto">
          {/* Timeline Section Header */}
          <motion.div
            className="text-center mb-12 md:mb-16 lg:mb-20"
            variants={fadeIn}
          >
            <motion.h2
              variants={fadeIn}
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 text-center text-white"
            >
              <ShinyText
                text="News and Timeline"
                className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
              />
            </motion.h2>
            <motion.div
              className="flex items-center justify-center"
              variants={itemFadeIn}
            >
              <Newspaper className="text-pgi-light-blue mr-3 text-xl md:text-2xl" />
              <DecryptedText
                text="Our Journey and Milestones"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={40}
                useOriginalCharsOnly={true}
                className="text-base md:text-lg lg:text-xl text-gray-300 font-light"
              />
            </motion.div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="max-w-6xl mx-auto relative"
            variants={staggerContainer}
          >
            {/* Timeline Center Line - Enhanced for desktop */}
            <div className="absolute left-9 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pgi-light-blue via-gray-500 to-pgi-light-blue transform md:-translate-x-px"></div>

            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                className="relative mb-8 md:mb-16 flex flex-col md:flex-row"
                variants={timelineItemVariants}
                viewport={{ once: true, amount: 0.3 }}
                whileInView="visible"
                initial="hidden"
              >
                {/* Desktop Layout - Alternating sides */}
                <div
                  className={`w-full md:w-5/12 ${
                    index % 2 === 0
                      ? 'md:pr-4 lg:pr-8 md:text-right'
                      : 'md:pl-4 lg:pl-8 md:ml-auto'
                  }`}
                >
                  <motion.div
                    className={`bg-darkNavy p-6 md:p-8 rounded-xl border border-gray-700 shadow-xl transition-all duration-300 hover:border-pgi-light-blue hover:shadow-2xl ${
                      index % 2 === 0 ? '' : 'md:order-1'
                    }`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div
                      className={`flex items-center mb-4 ${index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}
                    >
                      <Calendar className="text-pgi-light-blue mr-2 text-sm md:text-base" />
                      <span className="text-gray-400 text-sm md:text-base font-medium">
                        {event.date}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-white mb-3 md:mb-4">
                      <DecryptedText
                        text={event.title}
                        sequential={true}
                        revealDirection="start"
                        animateOn="view"
                        speed={30}
                        useOriginalCharsOnly={true}
                        className="text-lg md:text-xl lg:text-2xl font-semibold text-white"
                      />
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                      {event.description}
                    </p>
                  </motion.div>
                </div>

                {/* Timeline Node - Enhanced */}
                <motion.div
                  className="absolute left-9 md:left-1/2 top-8 w-3 h-3 md:w-4 md:h-4 rounded-full bg-pgi-light-blue border-4 border-navy transform md:-translate-x-1/2 shadow-lg"
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="absolute inset-0 rounded-full bg-pgi-light-blue animate-ping opacity-75"></div>
                </motion.div>

                {/* Connector line for desktop */}
                <div
                  className={`hidden md:block absolute top-12 w-8 lg:w-12 h-0.5 bg-gradient-to-r ${
                    index % 2 === 1
                      ? 'left-1/2 from-pgi-light-blue to-transparent'
                      : 'right-1/2 from-transparent to-pgi-light-blue'
                  }`}
                ></div>
              </motion.div>
            ))}
          </motion.div>

          {/* Timeline CTA */}
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
                Be Part of Our Story
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

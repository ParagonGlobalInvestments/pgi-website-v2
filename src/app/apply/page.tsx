'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaUserGraduate, FaChartLine, FaClipboardList } from 'react-icons/fa';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import { handleFormClick } from '@/components/analytics/FormTracker';

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

const cardItem = {
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

const buttonVariant = {
  hover: {
    scale: 1.05,
    backgroundColor: '#1f4287',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    transition: {
      duration: 0.2,
    },
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

// Timeline data
const timelineEvents = [
  { date: 'Jan 8, 2025', time: '8:00 PM ET', title: 'Info Session I (Zoom)' },
  { date: 'Jan 9, 2025', time: '8:00 PM ET', title: 'Diversity Event (Zoom)' },
  { date: 'Jan 10, 2025', time: '8:00 PM ET', title: 'Info Session II (Zoom)' },
  { date: 'Jan 11-13, 2025', time: '9:00 AM ET', title: 'Coffee Chats' },
  { date: 'Jan 13, 2025', time: '12:00 AM ET', title: 'Applications Open' },
  { date: 'Jan 14, 2025', time: '8:00 PM ET', title: 'Diversity Event (Zoom)' },
  {
    date: 'Jan 15, 2025',
    time: '8:00 PM ET',
    title: 'PM and ICOMM Event (Zoom)',
  },
  { date: 'Jan 17, 2025', time: '11:59 PM ET', title: 'Applications Close' },
];

// Recruitment team data
const recruitmentTeam = [
  {
    name: 'Sohini Banerjee',
    role: 'Co-Head of Recruitment',
    university: 'University of Chicago',
  },
  {
    name: 'John Otto',
    role: 'Co-Head of Recruitment',
    university: 'University of Pennsylvania',
  },
  {
    name: 'Ann Li',
    role: 'Recruiter',
    university: 'New York University',
  },
  {
    name: 'Aurora Wang',
    role: 'Recruiter',
    university: 'Columbia University',
  },
  {
    name: 'David Chen',
    role: 'Recruiter',
    university: 'Columbia University',
  },
  {
    name: 'Lucas Lu',
    role: 'Recruiter',
    university: 'Cornell University',
  },
  {
    name: 'Nana Agyeman',
    role: 'Recruiter',
    university: 'Princeton University',
  },
  {
    name: 'Daniel Kim',
    role: 'Recruiter',
    university: 'Princeton University',
  },
  {
    name: 'Flynn Kelleher',
    role: 'Recruiter',
    university: 'Cornell University',
  },
  {
    name: 'Jack Stemerman',
    role: 'Recruiter',
    university: 'Yale University',
  },
  {
    name: 'John Yi',
    role: 'Recruiter',
    university: 'New York University',
  },
  {
    name: 'Joshua Donovan',
    role: 'Recruiter',
    university: 'Yale University',
  },
];

export default function ApplyPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
              <ShinyText
                text="PGI Winter 2025 National Recruitment"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Join Paragon Global Investments and be part of a community
              dedicated to excellence in finance and investing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Application Options Section */}
      <section className="py-16 md:py-24 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Education Application */}
            <motion.div
              className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
              initial="hidden"
              animate="visible"
              variants={cardItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <FaUserGraduate className="text-navy text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white">
                  <DecryptedText
                    text="Education Application"
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    speed={50}
                    useOriginalCharsOnly={true}
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                  />
                </h2>
              </div>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                The education application is for admittance to the education
                portion of Paragon. The education is a 6-week curriculum that
                covers both fundamental investing and quantitative finance.
              </p>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                Upon successful completion of the program, students will have
                the opportunity to join their preferred investment fund. For
                further details, please refer to the education application
                below.
              </p>
              <p className="text-white font-medium mb-6 text-sm md:text-base">
                This opportunity is exclusively available to first-year
                students.
              </p>
            </motion.div>

            {/* Direct Fund Application */}
            <motion.div
              className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
              initial="hidden"
              animate="visible"
              variants={cardItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <FaChartLine className="text-navy text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white">
                  <DecryptedText
                    text="Direct Fund Application"
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    speed={50}
                    useOriginalCharsOnly={true}
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                  />
                </h2>
              </div>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                The fund application is for direct admission into Paragon's
                investment research groups, where you will engage in hands-on
                research of companies or algorithms that are either invested in
                or deployed by the investment funds.
              </p>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                Applicants may choose to apply directly to the PGI Value Fund or
                Systematic Fund. Additional information is available on the
                application form.
              </p>
              <p className="text-white font-medium mb-6 text-sm md:text-base">
                This opportunity is exclusively available to second-year
                students.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interest Form Section */}
      <section className="py-20 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="flex justify-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Interest Form */}
            <motion.div
              className="bg-darkNavy p-8 md:p-10 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-all duration-300 flex flex-col w-full max-w-lg shadow-xl"
              variants={cardItem}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="flex items-center mb-8">
                <div className="bg-pgi-light-blue p-4 rounded-full mr-6">
                  <FaClipboardList className="text-navy text-2xl" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white">
                  Interest Form
                </h3>
              </div>
              <p className="text-gray-300 mb-8 text-base md:text-lg font-light leading-relaxed">
                Fill out this form to be notified of updates, events, and
                important recruitment information.
              </p>
              <motion.a
                href="https://docs.google.com/forms/d/e/1FAIpQLSe5Fz3UnIf9S_p5scoFVi5WUL4mhpGWLkG8RG21NXUSgx8-Zw/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-pgi-light-blue text-white text-center py-4 px-8 rounded-lg font-semibold text-base md:text-lg tracking-wide shadow-lg"
                whileHover="hover"
                variants={buttonVariant}
                onClick={() =>
                  handleFormClick({
                    formName: 'interest_form',
                    formType: 'google_form',
                    targetUrl:
                      'https://docs.google.com/forms/d/e/1FAIpQLSe5Fz3UnIf9S_p5scoFVi5WUL4mhpGWLkG8RG21NXUSgx8-Zw/viewform',
                    section: 'apply_page',
                    additionalData: {
                      button_position: 'interest_form_card',
                      page_section: 'application_links',
                    },
                  })
                }
              >
                Submit Interest Form
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      {/* 
      <section className="py-16 md:py-24 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Timeline and Important Dates"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <div className="mb-8 md:mb-12 text-center">
            <span className="inline-flex items-center bg-darkNavy px-4 py-2 rounded-full border border-gray-700">
              <FaCalendarAlt className="mr-2 text-white" />
              <span className="text-gray-300 text-sm md:text-base">
                Time Zone: America/New_York
              </span>
            </span>
          </div>

          <motion.div
            className="relative"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
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
                <div
                  className={`w-full md:w-5/12 ${
                    index % 2 === 0
                      ? 'md:pr-4 lg:pr-8 md:text-right'
                      : 'md:pl-4 lg:pl-8 md:ml-auto'
                  }`}
                >
                  <motion.div
                    className="bg-darkNavy p-6 md:p-8 rounded-xl border border-gray-700 shadow-xl transition-all duration-300 hover:border-pgi-light-blue hover:shadow-2xl"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <h3 className="text-lg md:text-xl lg:text-2xl font-medium mb-2 text-white">
                      <DecryptedText
                        text={event.title}
                        sequential={true}
                        revealDirection="start"
                        animateOn="view"
                        speed={30}
                        useOriginalCharsOnly={true}
                        className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                      />
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base font-light">
                      {event.date}
                    </p>
                    <p className="text-gray-300 text-sm md:text-base font-light">
                      {event.time}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  className="absolute left-9 md:left-1/2 top-8 w-3 h-3 md:w-4 md:h-4 rounded-full bg-pgi-light-blue border-4 border-navy transform md:-translate-x-1/2 shadow-lg"
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <div className="absolute inset-0 rounded-full bg-pgi-light-blue animate-ping opacity-75"></div>
                </motion.div>

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
        </div>
      </section>
      */}

      {/* Recruitment Team Section */}
      <section className="py-20 md:py-28 lg:py-32 px-4 bg-navy">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <ShinyText
              text="Our Recruitment Team"
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {recruitmentTeam.map((member, index) => (
              <motion.div
                key={index}
                variants={cardItem}
                className="bg-darkNavy p-6 md:p-8 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{
                  y: -8,
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  transition: { duration: 0.3 },
                }}
              >
                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 text-white">
                    {member.name}
                  </h3>
                  <p className="text-white text-sm md:text-base mb-2 font-medium">
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-sm md:text-base font-light">
                    {member.university}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            className="text-center mt-16 md:mt-20 lg:mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-300 mb-6 text-base md:text-lg font-light">
              Have questions? Don't hesitate to reach out!
            </p>
            <motion.a
              href="/contact"
              className="inline-block bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide shadow-lg"
              whileHover={{
                scale: 1.05,
                backgroundColor: '#1f4287',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

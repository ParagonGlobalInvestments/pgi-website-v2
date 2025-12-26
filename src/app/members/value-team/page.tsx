'use client';

import { motion } from 'framer-motion';
import { FaLinkedin } from 'react-icons/fa';
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

const memberItem = {
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

// Investment Committee data
const investmentCommittee = [
  {
    name: 'Philip Bardon',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/philip-b-b19570236/',
  },
  {
    name: 'Jayanth Mammen',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/jayanth-mammen/',
  },
  {
    name: 'Clara Ee',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/claraee/',
  },
  {
    name: 'John Otto',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/john-otto1/',
  },
  {
    name: 'Eli Soffer',
    university: 'Princeton University',
    linkedin: 'https://www.linkedin.com/in/elisoffer/',
  },
  {
    name: 'Ashish Pothireddy',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/ashish-pothireddy/',
  },
  {
    name: 'Sean Oh',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/seanoh26/',
  },
  {    name: 'Myles Spiess',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/myles-spiess-304313242/',
  },
  {
    name: 'Matthew Weng',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/matthewweng/',
  },
  {
    name: 'Jason Ciptonugroho',
    university: 'Princeton University',
    linkedin: 'https://www.linkedin.com/in/jason-ciptonugroho/',
  },
  {
    name: 'Stoyan Angelov',
    university: 'New York University',
    linkedin: 'https://www.linkedin.com/in/stoyan-angelov/',
  },
  {
    name: 'John Yi',
    university: 'New York University',
    linkedin: 'https://www.linkedin.com/in/john-hong-yi/',
  },
];

// Portfolio Managers data
const portfolioManagers = [
  {
    name: 'Philip Weaver',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/philip-weaver-28b097232/',
  },
  {
    name: 'Aryaman Rakhecha',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/aryaman-rakhecha/',
  },
  {
    name: 'Matthew Geiling',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/matthew-geiling-7981a8212/',
  },
  {
    name: 'Benson Wang',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/bensonw/',
  },
  {
    name: 'Joshua Donovan',
    university: 'Yale University',
    linkedin: 'https://www.linkedin.com/in/joshua-donovan-b98632237/',
  },
  {
    name: 'Jack Stemerman',
    university: 'Yale University',
    linkedin: 'https://www.linkedin.com/in/jack-stemerman-1768a3211/',
  },
  {
    name: 'Aetant Prakash',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/aetantprakash/',
  },
];

// Analysts data
const analysts = [
  { name: 'Risha Bhat', university: 'University of Pennsylvania' },
  { name: 'Aparna Vagvala', university: 'New York University' },
  { name: 'Braden Queen', university: 'University of Chicago' },
  { name: 'Justin Burks', university: 'Columbia University' },
  { name: 'Siena Verprauskus', university: 'University of Chicago' },
  { name: 'Aurian Azghandi', university: 'University of Chicago' },
  { name: 'Nicolas Tchkotoua', university: 'University of Chicago' },
  { name: 'Noor Kaur', university: 'University of Chicago' },
  { name: 'Tommy Soltanian', university: 'Columbia University' },
  { name: 'Nana Agyeman', university: 'Princeton University' },
  { name: 'Daniel Kim', university: 'Princeton University' },
  { name: 'Seoyun Kang', university: 'Princeton University' },
  { name: 'Bill Zhang', university: 'Columbia University' },
  { name: 'Sarang Kothari', university: 'University of Chicago' },
  { name: 'Julian Sweet', university: 'University of Chicago' },
  { name: 'Oliver Treen', university: 'University of Chicago' },
  { name: 'Marcella Rogerson', university: 'University of Chicago' },
  { name: 'Lucas Lu', university: 'Cornell University' },
  { name: 'Kartik Arora', university: 'New York University' },
  { name: 'Joshua Lou', university: 'University of Chicago' },
  { name: 'Andrew Chen', university: 'Columbia University' },
  { name: 'Max Ting', university: 'University of Chicago' },
  { name: 'Ivan Mikhaylov', university: 'University of Chicago' },
  { name: 'Riley Gilsenan', university: 'University of Chicago' },
  { name: 'Finnur Christianson', university: 'Brown University' },
  { name: 'Samuel Hwang', university: 'University of Chicago' },
  { name: 'David Chen', university: 'Columbia University' },
  { name: 'Nicholas Simon', university: 'Columbia University' },
  { name: 'Jessica Wang', university: 'Columbia University' },
  { name: 'Dylan Berretta', university: 'Princeton University' },
  { name: 'Robert Zhang', university: 'University of Chicago' },
  { name: 'Raghav Mohindra', university: 'University of Chicago' },
];

export default function ValueTeamPage() {
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
                text="Value Team"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Our Value Team focuses on fundamental analysis and long-term
              investment strategies. The team is composed of our Investment
              Committee, Portfolio Managers, and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Investment Committee Section */}
      <section className="py-16 md:py-24 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Investment Committee"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {investmentCommittee.map((member, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-lg md:text-xl font-medium mb-2 text-white">
                  {member.name}
                </h3>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {member.university}
                </p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white hover:text-pgi-light-blue transition-colors text-sm md:text-base"
                >
                  <FaLinkedin className="text-lg md:text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portfolio Managers Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Portfolio Managers"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {portfolioManagers.map((manager, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-lg md:text-xl font-medium mb-2 text-white">
                  {manager.name}
                </h3>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {manager.university}
                </p>
                <a
                  href={manager.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white hover:text-pgi-light-blue transition-colors text-sm md:text-base"
                >
                  <FaLinkedin className="text-lg md:text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analysts Section */}
      <section className="py-16 md:py-24 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Analysts"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {analysts.map((analyst, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-darkNavy p-4 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <h3 className="text-base md:text-lg font-medium text-white">
                  {analyst.name}
                </h3>
                <p className="text-gray-300 text-sm md:text-base font-light">
                  {analyst.university}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

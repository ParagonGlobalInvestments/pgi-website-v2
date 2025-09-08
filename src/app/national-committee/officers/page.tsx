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

const cardAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Officer data
const officers = [
  {
    name: 'Philip Bardon',
    title: 'Chairman',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/philipbardon/',
  },
  {
    name: 'Myles Spiess',
    title: 'Chief Executive Officer',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/myles-spiess-304313242/',
  },
  {
    name: 'Sohini Banerjee',
    title: 'Co-Chief Operating Officer',
    university: 'University of Chicago',
    linkedin: '#',
  },
  {
    name: 'Souptik De',
    title: 'Co-Chief Operating Officer',
    university: 'University of Chicago',
    linkedin: '#',
  },
  {
    name: 'Clara Ee',
    title: 'Co-Chief Investment Officer',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/claraee/',
  },
  {
    name: 'Jayanth Mammen',
    title: 'Co-Chief Investment Officer',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/jayanth-mammen/',
  },
  {
    name: 'Dominic Olaguera-Delogu',
    title: 'Co-Chief Quantitative Researcher',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/dominic-olaguera-delogu/',
  },
  {
    name: 'Samuel Henriques',
    title: 'Co-Chief Quantitative Researcher',
    university: 'Princeton University',
    linkedin: 'https://www.linkedin.com/in/samuelhhenriques/',
  },
  {
    name: 'Alejandro Alonso',
    title: 'Co-Chief Technology Officer',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/alejandro-alonso-38344020b/',
  },
  {
    name: 'Anirudh Pottammal',
    title: 'Co-Chief Technology Officer',
    university: 'New York University',
    linkedin: 'https://www.linkedin.com/in/anirudh-pottammal-01b186216/',
  },
];

// Alumni Board
const alumniBoard = [
  {
    name: 'Jay Sivadas',
    company: 'Morgan Stanley',
    linkedin: 'https://www.linkedin.com/in/jaysivadas/',
  },
  {
    name: 'Daniel Labrador-Plata',
    company: 'Bank of America',
    linkedin: 'https://www.linkedin.com/in/daniellabrador-plata/',
  },
  {
    name: 'Erin Ku',
    company: 'RBC Capital Markets',
    linkedin: 'https://www.linkedin.com/in/erinku/',
  },
  {
    name: 'Bradley Yu',
    company: 'Eschaton Trading',
    linkedin: 'https://www.linkedin.com/in/bradley-yu-124537181/',
  },
  {
    name: 'Advay Mohindra',
    company: 'Citadel',
    linkedin: 'https://www.linkedin.com/in/advay-mohindra-a18663231/',
  },
  {
    name: 'Harrison Wang',
    company: 'Arrowstreet Capital',
    linkedin: 'https://www.linkedin.com/in/harrison-wang-591b95214/',
  },
];

export default function OfficersPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Officers Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto">
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <ShinyText
              text="Officers"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20 lg:mb-24"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {officers.map((officer, index) => (
              <motion.div
                key={index}
                className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-lg md:text-xl lg:text-2xl font-medium mb-2 text-white">
                  {officer.name}
                </h2>
                <p className="text-pgi-light-blue font-medium mb-2 text-sm md:text-base">
                  {officer.title}
                </p>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {officer.university}
                </p>
                <a
                  href={officer.linkedin}
                  className="inline-flex items-center text-white hover:text-pgi-light-blue transition-colors text-sm md:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-lg md:text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>

          {/* Alumni Board Section */}
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            <DecryptedText
              text="Alumni Board"
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
            transition={{ delayChildren: 0.7 }}
          >
            {alumniBoard.map((alumni, index) => (
              <motion.div
                key={index}
                className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-lg md:text-xl font-medium mb-2 text-white">
                  {alumni.name}
                </h3>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {alumni.company}
                </p>
                <a
                  href={alumni.linkedin}
                  className="inline-flex items-center text-white hover:text-pgi-light-blue transition-colors text-sm md:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-lg md:text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { FaLinkedin } from 'react-icons/fa';

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
    name: 'Sean Oh',
    title: 'Co-Chief Operating Officer',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/seanoh26/',
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
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.h1
            className="text-4xl font-bold mb-16 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Officers
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {officers.map((officer, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 hover:border-secondary transition-colors"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-2xl font-semibold mb-1">{officer.name}</h2>
                <p className="text-secondary font-medium mb-1">
                  {officer.title}
                </p>
                <p className="text-gray-400 mb-4">{officer.university}</p>
                <a
                  href={officer.linkedin}
                  className="inline-flex items-center text-white hover:text-secondary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>

          {/* Alumni Board Section */}
          <motion.h2
            className="text-3xl font-bold mb-10 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            Alumni Board
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.7 }}
          >
            {alumniBoard.map((alumni, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-5 rounded-lg border border-gray-700 hover:border-secondary transition-colors"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-xl font-semibold mb-1">{alumni.name}</h3>
                <p className="text-gray-400 mb-4">{alumni.company}</p>
                <a
                  href={alumni.linkedin}
                  className="inline-flex items-center text-white hover:text-secondary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-xl mr-2" />
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

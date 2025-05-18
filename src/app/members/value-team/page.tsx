'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
  {
    name: 'Myles Spiess',
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
      <section className="py-36 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl font-bold mb-6">Value Team</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our Value Team focuses on fundamental analysis and long-term
              investment strategies. The team is composed of our Investment
              Committee, Portfolio Managers, and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Investment Committee Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Investment Committee
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {investmentCommittee.map((member, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-navy p-6 rounded-lg border border-gray-700 hover:border-secondary transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-400 mb-3">{member.university}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaLinkedin />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portfolio Managers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Portfolio Managers
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {portfolioManagers.map((manager, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 hover:border-secondary transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{manager.name}</h3>
                <p className="text-gray-400 mb-3">{manager.university}</p>
                <a
                  href={manager.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaLinkedin />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analysts Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Analysts
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {analysts.map((analyst, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-navy p-4 rounded-lg border border-gray-700"
              >
                <h3 className="text-lg font-semibold">{analyst.name}</h3>
                <p className="text-gray-400">{analyst.university}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

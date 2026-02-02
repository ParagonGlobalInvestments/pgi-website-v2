'use client';

import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
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

// Quantitative Research Committee data
const researchCommittee = [
  {
    name: 'Soupy De',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/souptik-de-3b275122b',
  },
  {
    name: 'William Vietor',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/william-vietor-4b552022b',
  },
  {
    name: 'Samuel Henriques',
    university: 'Princeton University',
    linkedin: 'https://www.linkedin.com/in/samuel-henriques-62748122b',
  },
  {
    name: 'Ronak Datta',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/ronak-datta-3b275122b',
  },
  {
    name: 'Anirudh Pottammal',
    university: 'New York University',
    linkedin: 'https://www.linkedin.com/in/anirudh-pottammal-01b186216',
  },
  {
    name: 'Sahishnu Hanumolu',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/sahishnu-hanumolu-3b275122b',
  },
  {
    name: 'Dominic Olaguera-Delogu',
    university: 'University of Pennsylvania',
    linkedin: 'https://www.linkedin.com/in/dominic-olaguera-delogu-3b275122b',
  },
  {
    name: 'Matthew Neissen',
    university: 'Yale University',
    linkedin: 'https://www.linkedin.com/in/matthew-neissen-3b275122b',
  },
  {
    name: 'Daniel Siegel',
    university: 'Yale University',
    linkedin: 'https://www.linkedin.com/in/daniel-siegel-3b275122b',
  },
  {
    name: 'Ethan Chang',
    university: 'Columbia University',
    linkedin: 'https://www.linkedin.com/in/ethan-chang-3b275122b',
  },
];

// Analysts data
const analysts = [
  { name: 'Aakshay Gupta', university: 'Cornell University' },
  { name: 'Andrew Da', university: 'Cornell University' },
  { name: 'Ann Li', university: 'New York University' },
  { name: 'Anthony Wong', university: 'Cornell University' },
  { name: 'Atishay Narayanan', university: 'Princeton University' },
  { name: 'Aurora Wang', university: 'Columbia University' },
  { name: 'Benjamin Weber', university: 'Princeton University' },
  { name: 'Benjamin Zhou', university: 'Princeton University' },
  { name: 'Brianna Wang', university: 'Columbia University' },
  { name: 'Connor Brown', university: 'Princeton University' },
  { name: 'Edward Stan', university: 'Columbia University' },
  { name: 'Joonseok Jung', university: 'Cornell University' },
  { name: 'Kayla Shan', university: 'Cornell University' },
  { name: 'Linglong Dai', university: 'Cornell University' },
  { name: 'Meghana Kesanapalli', university: 'Cornell University' },
  { name: 'Mikul Saravanan', university: 'Columbia University' },
  { name: 'Rohan Sabu', university: 'New York University' },
  { name: 'Siddharth Shastry', university: 'University of Chicago' },
  { name: 'Srirag Tavarti', university: 'Columbia University' },
  { name: 'Robert Liu', university: 'University of Chicago' },
  { name: 'Flynn Kelleher', university: 'Cornell University' },
  { name: 'Anupam Bhakta', university: 'Columbia University' },
  { name: 'Kaiji Uno', university: 'Columbia University' },
  { name: 'Lucas Tucker', university: 'University of Chicago' },
  { name: 'Sohini Banerjee', university: 'University of Chicago' },
  { name: 'Pranav Mishra', university: 'Cornell University' },
  { name: 'Helen Ho', university: 'New York University' },
  { name: 'Ece Tumer', university: 'University of Chicago' },
  { name: 'Aman Dhillon', university: 'University of Chicago' },
  { name: 'Nico Roth', university: 'University of Chicago' },
  { name: 'Nikhil Reddy', university: 'University of Chicago' },
  { name: 'Anthony Luo', university: 'University of Chicago' },
  { name: 'Farrell Wenardy', university: 'University of Chicago' },
  { name: 'William Li', university: 'University of Chicago' },
  { name: 'Kabir Buch', university: 'University of Chicago' },
  { name: 'Ishaan Sareen', university: 'University of Chicago' },
  { name: 'Koren Gila', university: 'University of Chicago' },
  { name: 'Yoyo Zhang', university: 'University of Chicago' },
  { name: 'Lars Barth', university: 'University of Chicago' },
  { name: 'Benjamin Levi', university: 'University of Chicago' },
  { name: 'Arav Saksena', university: 'University of Chicago' },
];

export default function QuantTeamPage() {
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
                text="Quant Team"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Our Quantitative Team focuses on algorithmic trading strategies
              and data-driven investment approaches. The team is composed of our
              Quantitative Research Committee and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Research Committee Section */}
      <section className="py-16 md:py-24 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <DecryptedText
              text="Quantitative Research Committee"
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
            {researchCommittee.map((member, index) => (
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
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-white hover:text-white transition-colors text-sm md:text-base"
                  >
                    <Linkedin className="text-lg md:text-xl mr-2" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analysts Section */}
      <section className="py-16 md:py-24 px-4">
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

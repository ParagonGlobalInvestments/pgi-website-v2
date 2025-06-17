'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
// import Link from "next/link";
import { FaHandshake, FaAward } from 'react-icons/fa';
import {
  SPONSORS_COMPANIES,
  PARTNERS_COMPANIES,
  type Company,
} from '@/lib/constants/companies';

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

const sponsorAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function Sponsors() {
  // Partner descriptions mapping
  const partnerDescriptions: { [key: string]: string } = {
    cloudquant:
      'The exclusive partnership between Paragon and CloudQuant gives Paragon quantitative analysts access to over 15,000 private alternative data sets for building models and developing signals, enabling PNG students to perform real quantitative research.',
    databento:
      'Databento is a leading provider of real-time and historical market data to leading institutional investors. Paragon and Databento are partnered to provide Paragon students with access to real-time and exclusive market data across equities, options, and forex data!',
    kirkland:
      "Kirkland & Ellis, one of the largest law firms in the United States, is Paragon's official legal advisor, actively helping spread the organization's mission to as many students as possible.",
    'visible-alpha':
      'Visible Alpha is a leading provider of market data, sell-side information, financial information, and other company analysis software. All Paragon investment analysts will have access to visible alpha software through their PMs, which will assist them in developing deeper insights into the companies Paragon researches.',
    tegus:
      "Tegus, a leading investment research platform, is a partner of Paragon's Value Fund.",
    bamsec:
      'BamSEC is a leading online platform that allows users to more efficiently perform financial research when working with Securities and Exchange Commission (SEC) filings and earnings transcripts. BamSEC helps Paragon students analyze companies and build financial models for our investment pitches.',
    'edmund-sec':
      'EdmundSEC is a leading provider of software that helps users efficiently perform financial research when working with SEC documents. The company leverages unique AI software to accelerate financial research. EdmundSEC helps students with their financial research and building financial models.',
    wso: 'Wall Street Oasis provides Paragon Global Investments members exclusive resources to prepare them for professional recruitment.',
    elevate:
      'Paragon partnered with Elevate Career Network—the largest Private Equity, Investment Banking, Venture Capital, Hedge Fund Network in North America and Europe—to provide our members with exclusive access to recruiting opportunities in finance.',
    biws: 'Breaking Into Wall Street is the premier financial modeling training platform for investment banking and private equity interviews.',
    hireflix:
      'Hireflix is a leading one-way video interview software platform. Hireflix has partnered with PGI to support our national recruitment efforts.',
    portfolio123:
      'Portfolio123 enables portfolio managers and quantitative investors to develop advanced machine learning-driven quantitative portfolio strategies without writing any code. Combining advanced capabilities with user-friendly design, Portfolio123 significantly lowers R&D costs.',
  };

  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-24 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Sponsors and Partners
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="text-lg text-center text-gray-300">
            Paragon Global Investments is partnered with top firms and
            organizations to provide our students the best access to the top
            firms in finance, tech, and quant across the United States. Sponsors
            contribute to Paragon's investment fund, operations, and the growth
            of our members.
          </p>
        </motion.div>

        {/* Sponsors Section */}
        <motion.div
          className="mb-24"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="flex items-center justify-center mb-12"
            variants={fadeIn}
          >
            <FaAward className="text-secondary text-2xl mr-3" />
            <h2 className="text-3xl font-bold text-secondary">Sponsors</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
          >
            {SPONSORS_COMPANIES.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                className=" flex items-center justify-center"
                variants={sponsorAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <div className="w-auto h-auto bg-transparent rounded-lg flex items-center justify-center p-3">
                    <Image
                      src={sponsor.imagePath}
                      alt={sponsor.displayName}
                      width={120}
                      height={120}
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
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Partners Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="flex items-center justify-center mb-12"
            variants={fadeIn}
          >
            <FaHandshake className="text-secondary text-2xl mr-3" />
            <h2 className="text-3xl font-bold text-secondary">Partners</h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {PARTNERS_COMPANIES.map((partner, index) => (
              <motion.div
                key={partner.name}
                className="bg-navy-light p-6 mb-8 rounded-lg border border-gray-700 hover:border-secondary transition-duration-300"
                variants={cardAnimation}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-auto h-auto bg-transparent rounded-lg flex items-center justify-center p-4 mb-6 md:mb-0 md:mr-8 shrink-0 hover:scale-105 transition-transform duration-300"
                  >
                    <Image
                      src={partner.imagePath}
                      alt={partner.displayName}
                      width={150}
                      height={150}
                      className="object-contain max-w-full max-h-full"
                      style={{
                        width: 'auto',
                        height: 'auto',
                        maxWidth: '150px',
                        maxHeight: '150px',
                      }}
                    />
                  </a>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-secondary">
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {partner.displayName}
                      </a>
                    </h3>
                    <p className="text-gray-300">
                      {partnerDescriptions[partner.name] ||
                        'Partnership details coming soon.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

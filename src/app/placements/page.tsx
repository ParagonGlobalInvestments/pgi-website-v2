'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  INVESTMENT_BANKING_COMPANIES,
  QUANT_TECH_COMPANIES,
  ASSET_MGMT_CONSULTING_COMPANIES,
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
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const companyItem = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const hoverEffect = {
  scale: 1.05,
  y: -5,
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

// Company Card Component
const CompanyCard = ({ company }: { company: Company }) => (
  <motion.div
    variants={companyItem}
    whileHover={hoverEffect}
    whileTap={{ scale: 0.95 }}
    className="group"
  >
    <a
      href={company.website}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <div className="bg-navy rounded-lg p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-blue-600">
        <div className="h-16 sm:h-20 w-full flex items-center justify-center">
          <Image
            src={company.imagePath}
            alt={company.displayName}
            width={120}
            height={80}
            className="object-contain max-w-full max-h-full group-hover:scale-110 transition-transform duration-300"
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '160px',
              maxHeight: '160px',
            }}
          />
        </div>
      </div>
    </a>
  </motion.div>
);

export default function PlacementsPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Alumni Placements
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Since 2021, members of Paragon Global Investments have excelled in
              many different fields within the finance and tech industries.
              Paragon alumni have received internship and job offers from the
              foremost companies, startups, and nonprofits across finance and
              technology. Paragon members and alumni have experience in
              investment banking, quantitative trading, software development,
              private equity, equity research, private credit, and management
              consulting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Investment Banking Section */}
      <section className="py-12 sm:py-16 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Investment Banking
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {INVESTMENT_BANKING_COMPANIES.map((company, index) => (
              <CompanyCard
                key={`ib-${company.name}-${index}`}
                company={company}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quantitative Trading and Technology Section */}
      <section className="py-12 sm:py-16 px-4 bg-navy">
        <div className="container mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Quantitative Trading & Technology
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {QUANT_TECH_COMPANIES.map((company, index) => (
              <CompanyCard
                key={`qt-${company.name}-${index}`}
                company={company}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Asset Management and Consulting Section */}
      <section className="py-12 sm:py-16 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Asset Management & Consulting
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {ASSET_MGMT_CONSULTING_COMPANIES.map((company, index) => (
              <CompanyCard
                key={`am-${company.name}-${index}`}
                company={company}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Back to Home CTA */}
      <section className="py-16 px-4 bg-navy">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">
              Ready to Join Our Alumni Network?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Start your journey with Paragon Global Investments and become part
              of our successful alumni network at top finance and technology
              companies.
            </p>
            <Link href="/apply">
              <motion.button
                className="bg-pgi-light-blue text-white px-8 py-3 rounded-lg font-semibold text-lg tracking-wide hover:bg-blue-600 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply to PGI
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

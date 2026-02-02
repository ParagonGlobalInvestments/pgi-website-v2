'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  SPONSORS_COMPANIES,
  PARTNERS_COMPANIES,
  type Company,
} from '@/lib/constants/companies';
import {
  fadeIn,
  staggerContainer,
  buttonHover,
  logoAnimation,
} from './animations';

const EnhancedSponsorLogo = ({ company }: { company: Company }) => (
  <a
    href={company.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group"
  >
    <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-105 ">
      <Image
        src={company.imagePath}
        alt={company.displayName}
        width={120}
        height={120}
        className="object-contain max-w-full max-h-full"
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '120px',
          maxHeight: '80px',
        }}
      />
    </div>
  </a>
);

export default function SponsorsPartnersSection() {
  const selectedSponsors = SPONSORS_COMPANIES.slice(0, 5);
  const selectedPartners = PARTNERS_COMPANIES.slice(0, 5);

  return (
    <motion.section
      className="py-16 md:py-24 lg:py-32 px-4 bg-navy"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeIn}
    >
      <div className="container mx-auto">
        {/* Main Title */}
        <motion.h2
          variants={fadeIn}
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
        >
          <ShinyText
            text="Our Sponsors & Partners"
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
          />
        </motion.h2>

        {/* Split Screen Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 relative">
          {/* Animated Vertical Divider - Hidden on mobile */}
          <motion.div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-pgi-light-blue to-transparent transform -translate-x-1/2"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />

          {/* Sponsors Section - Left Half */}
          <motion.div variants={fadeIn} className="flex-1 lg:pr-8">
            <motion.h3
              variants={fadeIn}
              className="text-xl md:text-2xl lg:text-3xl font-medium mb-8 text-center text-white"
            >
              <DecryptedText
                text="Sponsors"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly={true}
                className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
              />
            </motion.h3>

            {/* Sponsors Grid - 3 top, 2 bottom */}
            <motion.div
              variants={staggerContainer}
              className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-lg mx-auto"
            >
              {selectedSponsors.map((sponsor, index) => (
                <motion.div
                  key={sponsor.name}
                  variants={logoAnimation}
                  className={`flex items-center justify-center ${
                    index < 3
                      ? 'w-[calc(33.333%-0.5rem)] md:w-[calc(33.333%-1rem)]'
                      : 'w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)]'
                  }`}
                >
                  <EnhancedSponsorLogo company={sponsor} />
                </motion.div>
              ))}
            </motion.div>

            {/* Sponsors CTA */}
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.8 }}
              className="text-center mt-8"
            >
              <Link href="/sponsors">
                <motion.button
                  className="bg-pgi-light-blue text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base tracking-wide"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Sponsors
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Partners Section - Right Half */}
          <motion.div variants={fadeIn} className="flex-1 lg:pl-8">
            <motion.h3
              variants={fadeIn}
              className="text-xl md:text-2xl lg:text-3xl font-medium mb-8 text-center text-white"
            >
              <DecryptedText
                text="Partners"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly={true}
                className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
              />
            </motion.h3>

            {/* Partners Grid - 3 top, 2 bottom */}
            <motion.div
              variants={staggerContainer}
              className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-lg mx-auto"
            >
              {selectedPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  variants={logoAnimation}
                  className={`flex items-center justify-center ${
                    index < 3
                      ? 'w-[calc(33.333%-0.5rem)] md:w-[calc(33.333%-1rem)]'
                      : 'w-[calc(50%-0.5rem)] md:w-[calc(50%-0.75rem)]'
                  }`}
                >
                  <EnhancedSponsorLogo company={partner} />
                </motion.div>
              ))}
            </motion.div>

            {/* Partners CTA */}
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.8 }}
              className="text-center mt-8"
            >
              <Link href="/sponsors">
                <motion.button
                  className="bg-pgi-light-blue text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold text-sm md:text-base tracking-wide"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Partners
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

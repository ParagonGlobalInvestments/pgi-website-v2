'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  INVESTMENT_BANKING_COMPANIES,
  QUANT_TECH_COMPANIES,
  ASSET_MGMT_CONSULTING_COMPANIES,
  type Company,
} from '@/lib/constants/companies';
import { fadeIn, itemFadeIn, buttonHover } from './animations';

const InfiniteScroll = dynamic(
  () => import('@/components/reactbits/Components/InfiniteScroll/InfiniteScroll'),
  { ssr: false }
);

const CompanyLogo = ({ company }: { company: Company }) => (
  <a
    href={company.website}
    target="_blank"
    rel="noopener noreferrer"
    className="block group w-full"
  >
    <div className="bg-transparent rounded-lg p-2 transition-all duration-300 group-hover:scale-105">
      <div className="h-12 w-full flex items-center justify-center">
        <Image
          src={company.imagePath}
          alt={company.displayName}
          width={100}
          height={100}
          className="object-contain max-w-full max-h-full"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '200px',
            maxHeight: '200px',
          }}
        />
      </div>
    </div>
  </a>
);

export default function PlacementsSection() {
  return (
    <motion.section
      className="bg-navy py-16 md:py-24 lg:py-32 px-4 lg:min-h-screen"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={fadeIn}
    >
      <div className="container mx-auto">
        <motion.h2
          variants={fadeIn}
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
        >
          <ShinyText
            text="Our Placements"
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
          />
        </motion.h2>

        {/* Three Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 ">
          {/* Quantitative Trading & Technology Column */}
          <motion.div
            variants={itemFadeIn}
            className="flex-1 flex flex-col items-center"
          >
            <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white mb-6 text-center">
              <DecryptedText
                text="Quantitative Trading & Technology"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={20}
                useOriginalCharsOnly={true}
                className="text-lg md:text-xl lg:text-2xl font-medium text-white"
              />
            </h3>
            <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-bl from-darkNavy via-pgi-dark-blue to-darkNavy shadow-xl">
              <style>
                {`
                  .quant-tech-scroll .infinite-scroll-wrapper {
                    max-height: 300px;
                  }
                  @media (min-width: 1024px) {
                    .quant-tech-scroll .infinite-scroll-wrapper {
                      max-height: 400px;
                    }
                  }
                `}
              </style>
              <div className="quant-tech-scroll">
                <InfiniteScroll
                  width="200px"
                  maxHeight="300px"
                  items={QUANT_TECH_COMPANIES.map(company => ({
                    content: <CompanyLogo company={company} />,
                  }))}
                  itemMinHeight={80}
                  isTilted={false}
                  tiltDirection="left"
                  autoplay={true}
                  autoplaySpeed={2}
                  autoplayDirection="down"
                  pauseOnHover={true}
                  negativeMargin="-5px"
                />
              </div>
            </div>
          </motion.div>

          {/* Investment Banking Column */}
          <motion.div
            variants={itemFadeIn}
            className="flex-1 flex flex-col items-center"
          >
            <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white mb-6 text-center">
              <DecryptedText
                text="Investment Banking"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={20}
                useOriginalCharsOnly={true}
                className="text-lg md:text-xl lg:text-2xl font-medium text-white"
              />
            </h3>
            <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-br from-darkNavy via-pgi-dark-blue to-darkNavy shadow-xl">
              <style>
                {`
                  .investment-banking-scroll .infinite-scroll-wrapper {
                    max-height: 300px;
                  }
                  @media (min-width: 1024px) {
                    .investment-banking-scroll .infinite-scroll-wrapper {
                      max-height: 400px;
                    }
                  }
                `}
              </style>
              <div className="investment-banking-scroll">
                <InfiniteScroll
                  width="200px"
                  maxHeight="300px"
                  items={INVESTMENT_BANKING_COMPANIES.map(company => ({
                    content: <CompanyLogo company={company} />,
                  }))}
                  itemMinHeight={80}
                  isTilted={false}
                  tiltDirection="right"
                  autoplay={true}
                  autoplaySpeed={2}
                  autoplayDirection="down"
                  pauseOnHover={true}
                  negativeMargin="-5px"
                />
              </div>
            </div>
          </motion.div>

          {/* Asset Management & Consulting Column */}
          <motion.div
            variants={itemFadeIn}
            className="flex-1 flex flex-col items-center"
          >
            <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-white mb-6 text-center">
              <DecryptedText
                text="Asset Management & Consulting"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={20}
                useOriginalCharsOnly={true}
                className="text-lg md:text-xl lg:text-2xl font-medium text-white"
              />
            </h3>
            <div className="w-full max-w-xs lg:max-w-sm overflow-hidden border border-gray-700 rounded-2xl bg-gradient-to-bl from-darkNavy via-pgi-dark-blue to-darkNavy shadow-xl">
              <style>
                {`
                  .asset-mgmt-scroll .infinite-scroll-wrapper {
                    max-height: 300px;
                  }
                  @media (min-width: 1024px) {
                    .asset-mgmt-scroll .infinite-scroll-wrapper {
                      max-height: 400px;
                    }
                  }
                `}
              </style>
              <div className="asset-mgmt-scroll">
                <InfiniteScroll
                  width="200px"
                  maxHeight="300px"
                  items={ASSET_MGMT_CONSULTING_COMPANIES.map(company => ({
                    content: <CompanyLogo company={company} />,
                  }))}
                  itemMinHeight={80}
                  isTilted={false}
                  tiltDirection="left"
                  autoplay={true}
                  autoplaySpeed={2}
                  autoplayDirection="down"
                  pauseOnHover={true}
                  negativeMargin="-5px"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          variants={fadeIn}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 md:mt-16 lg:mt-20"
        >
          <Link href="/placements">
            <motion.button
              className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
              whileHover={buttonHover}
              whileTap={{ scale: 0.95 }}
            >
              View All Placements
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Handshake, Award } from 'lucide-react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  fadeIn,
  staggerContainer,
  itemFadeIn,
  cardAnimation,
} from '@/lib/animations';
import { getImageSrc } from '@/utils';
import type { CmsSponsor } from '@/lib/cms/types';

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

interface SponsorsClientProps {
  sponsors: CmsSponsor[];
  partners: CmsSponsor[];
}

export default function SponsorsClient({
  sponsors,
  partners,
}: SponsorsClientProps) {
  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-24 px-4">
        <motion.h1
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <ShinyText
            text="Sponsors and Partners"
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
          />
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.p
            className="text-base md:text-lg lg:text-xl text-center text-gray-300 font-light leading-relaxed"
            variants={itemFadeIn}
          >
            Paragon Global Investments is partnered with top firms and
            organizations to provide our students the best access to the top
            firms in finance, tech, and quant across the United States. Sponsors
            contribute to Paragon&apos;s investment fund, operations, and the
            growth of our members.
          </motion.p>
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
            <Award className="text-secondary text-2xl mr-3" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary">
              <DecryptedText
                text="Sponsors"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={40}
                useOriginalCharsOnly={true}
                className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary"
              />
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
          >
            {sponsors.map(sponsor => (
              <motion.div
                key={sponsor.id}
                className="flex items-center justify-center"
                variants={sponsorAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <a
                  href={sponsor.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <div className="w-auto h-auto bg-transparent rounded-lg flex items-center justify-center p-3">
                    {getImageSrc(sponsor.image_path) && (
                      <Image
                        src={getImageSrc(sponsor.image_path)!}
                        alt={sponsor.display_name}
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
                    )}
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
            <Handshake className="text-secondary text-2xl mr-3" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary">
              <DecryptedText
                text="Partners"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={40}
                useOriginalCharsOnly={true}
                className="text-xl md:text-2xl lg:text-3xl font-semibold text-secondary"
              />
            </h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {partners.map(partner => (
              <motion.div
                key={partner.id}
                className="bg-navy-light p-6 mb-8 rounded-lg border border-gray-700 hover:border-secondary transition-duration-300"
                variants={cardAnimation}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  <a
                    href={partner.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-auto h-auto bg-transparent rounded-lg flex items-center justify-center p-4 mb-6 md:mb-0 md:mr-8 shrink-0 hover:scale-105 transition-transform duration-300"
                  >
                    {getImageSrc(partner.image_path) && (
                      <Image
                        src={getImageSrc(partner.image_path)!}
                        alt={partner.display_name}
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
                    )}
                  </a>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-secondary">
                      <a
                        href={partner.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {partner.display_name}
                      </a>
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                      {partner.description ||
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

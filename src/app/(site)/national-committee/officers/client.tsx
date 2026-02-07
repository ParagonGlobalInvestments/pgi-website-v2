'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import type { CmsPerson } from '@/lib/cms/types';

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

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/** Extract LinkedIn username from full URL */
function extractLinkedInUsername(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? match[1].replace(/\/$/, '') : null;
}

/**
 * Avatar with fallback cascade:
 * 1. Manual headshot_url (uploaded via CMS)
 * 2. LinkedIn profile photo via unavatar.io proxy
 * 3. Initials
 */
function PersonAvatar({ person }: { person: CmsPerson }) {
  const [imgFailed, setImgFailed] = useState(false);

  const linkedinUsername = person.linkedin
    ? extractLinkedInUsername(person.linkedin)
    : null;

  // Determine which image source to use
  const imgSrc = person.headshot_url
    ? person.headshot_url
    : linkedinUsername && !imgFailed
      ? `https://unavatar.io/linkedin/${linkedinUsername}`
      : null;

  if (!imgSrc || imgFailed) {
    return (
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center">
        <span className="text-lg md:text-xl font-medium text-gray-400">
          {getInitials(person.name)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-600">
      <Image
        src={imgSrc}
        alt={person.name}
        width={96}
        height={96}
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
        unoptimized={!person.headshot_url} // skip Next.js optimization for external proxy
      />
    </div>
  );
}

interface OfficersClientProps {
  officers: CmsPerson[];
  alumniBoard: CmsPerson[];
}

export default function OfficersClient({
  officers,
  alumniBoard,
}: OfficersClientProps) {
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
            {officers.map(officer => (
              <motion.div
                key={officer.id}
                className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center gap-4">
                  <PersonAvatar person={officer} />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-medium mb-1 text-white">
                      {officer.name}
                    </h2>
                    <p className="text-gray-300 font-medium mb-1 text-sm md:text-base">
                      {officer.title}
                    </p>
                    <p className="text-gray-300 mb-2 text-sm md:text-base font-light">
                      {officer.school}
                    </p>
                    {officer.linkedin && (
                      <a
                        href={officer.linkedin}
                        className="inline-flex items-center text-white hover:text-white transition-colors text-sm md:text-base"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="text-lg md:text-xl mr-2" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
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
            {alumniBoard.map(alumni => (
              <motion.div
                key={alumni.id}
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
                {alumni.linkedin && (
                  <a
                    href={alumni.linkedin}
                    className="inline-flex items-center text-white hover:text-white transition-colors text-sm md:text-base"
                    target="_blank"
                    rel="noopener noreferrer"
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
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

const buttonHover = {
  scale: 1.05,
  backgroundColor: '#1f4287',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

export default function NationalCommitteePage() {
  const router = useRouter();

  // This will automatically redirect to the Officers page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/national-committee/officers');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="bg-navy text-white min-h-screen flex flex-col justify-center items-center px-4">
      <motion.h1
        className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <ShinyText
          text="National Committee"
          className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
        />
      </motion.h1>

      <motion.div
        className="flex flex-col md:flex-row gap-6 lg:gap-8 mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Link href="/national-committee/officers">
          <motion.div
            className="bg-darkNavy border border-gray-700 hover:border-pgi-light-blue hover:bg-pgi-dark-blue transition-colors rounded-lg p-6 lg:p-8 text-center min-w-[200px] lg:min-w-[250px]"
            whileHover={buttonHover}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-white">
              <DecryptedText
                text="Officers"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly={true}
                className="text-xl md:text-2xl font-medium text-white"
              />
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Meet the current leadership team and alumni board.
            </p>
          </motion.div>
        </Link>

        <Link href="/national-committee/founders">
          <motion.div
            className="bg-darkNavy border border-gray-700 hover:border-pgi-light-blue hover:bg-pgi-dark-blue transition-colors rounded-lg p-6 lg:p-8 text-center min-w-[200px] lg:min-w-[250px]"
            whileHover={buttonHover}
            whileTap={{ scale: 0.98 }}
          >
            <h2 className="text-xl md:text-2xl font-medium mb-4 text-white">
              <DecryptedText
                text="Founders"
                sequential={true}
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly={true}
                className="text-xl md:text-2xl font-medium text-white"
              />
            </h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Learn about our organization&apos;s founders and chapter founders.
            </p>
          </motion.div>
        </Link>
      </motion.div>

      <motion.p
        className="text-gray-300 text-center max-w-xl text-sm md:text-base font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Redirecting to Officers page in a moment...
      </motion.p>
    </div>
  );
}

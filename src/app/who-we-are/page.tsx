"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
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

const logoAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
};

export default function WhoWeAre() {
  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-16 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Who We Are
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="text-lg mb-8" variants={fadeIn}>
            Paragon Global Investments (formerly PGI) is a student-led
            investment fund with chapters at Brown University, Columbia
            University, Cornell University, New York University, Princeton
            University, the University of Chicago, and the University of
            Pennsylvania. The organization is dedicated to the development of
            students in value investing and algorithmic trading.
          </motion.p>

          <motion.p className="text-lg mb-8" variants={fadeIn}>
            Students admitted to Paragon follow an educational curriculum that
            teaches applied value investing and algorithmic trading. Upon
            completing the education portion, students will join the
            organization either as investment analysts or quantitative analysts,
            working on stock pitches or designing systematic algorithms that
            will be invested into or deployed into Paragon's $40,000 investment
            funds.
          </motion.p>

          <motion.p className="text-lg mb-12" variants={fadeIn}>
            Since our inception, we have grown to 300+ active students and every
            year we receive close to 2,000 students interested in joining our
            organization nationally.
          </motion.p>
        </motion.div>

        {/* University Logos Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Row 1 */}
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/brown.png"
              alt="Brown University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/columbia.png"
              alt="Columbia University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/cornell.png"
              alt="Cornell University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/nyu.png"
              alt="New York University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>

          {/* Row 2 */}
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/princeton.png"
              alt="Princeton University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/uchicago.png"
              alt="University of Chicago"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/upenn.png"
              alt="University of Pennsylvania"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/yale.png"
              alt="Yale University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

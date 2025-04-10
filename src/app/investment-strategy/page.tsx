"use client";

import { motion } from "framer-motion";
import { FaRegFileCode, FaRegFileExcel } from "react-icons/fa";
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

export default function InvestmentStrategy() {
  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-16 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Investment Strategy
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.section className="mb-12" variants={fadeIn}>
            <div className="flex flex-row gap-4 mb-4">
              <h2 className="text-2xl font-semibold ">Value Investing</h2>
              <kbd className="bg-gray-700 text-white px-2 py-0.5 rounded-md flex flex-row gap-2 items-center">
                <span className="text-sm">PARAGON VALUE</span>
                <FaRegFileExcel className="text-lg" />
              </kbd>
            </div>
            <p className="text-lg mb-6">
              At Paragon Global Investments, we primarily focus on value
              investing—identifying and investing in securities that appear to
              be trading for less than their intrinsic or book value. Our
              investment philosophy is deeply influenced by the principles
              established by Benjamin Graham and David Dodd, and later refined
              by Warren Buffett.
            </p>
            <p className="text-lg mb-6">
              We apply a disciplined approach to analyze companies, focusing on
              their fundamentals, competitive advantages, management quality,
              and long-term growth prospects. Our goal is to identify
              undervalued companies with strong fundamentals that can generate
              sustainable returns over the long term.
            </p>
          </motion.section>

          <motion.section className="mb-12" variants={fadeIn}>
            <div className="flex flex-row gap-4 mb-4">
              <h2 className="text-2xl font-semibold ">Algorithmic Trading</h2>
              <kbd className="bg-gray-700 text-white px-2 py-0.5 rounded-md flex flex-row gap-2 items-center">
                <span className="text-sm">PARAGON SYSTEMATIC</span>
                <FaRegFileCode className="text-lg" />
              </kbd>
            </div>
            <p className="text-lg mb-6">
              In addition to our value investing approach, we also employ
              algorithmic trading strategies to capitalize on market
              inefficiencies and generate returns regardless of market
              direction. Our quantitative team develops, tests, and implements
              systematic trading algorithms that utilize statistical methods,
              machine learning, and technical indicators.
            </p>
            <p className="text-lg mb-6">
              These algorithms are designed to identify patterns and trends in
              market data, execute trades with precision, and manage risk
              effectively. By combining both traditional value investing and
              modern algorithmic approaches, we aim to provide robust investment
              solutions that can perform across different market environments.
            </p>
          </motion.section>

          <motion.section variants={fadeIn}>
            <h2 className="text-2xl font-semibold mb-4">
              Student-Led Investment Process
            </h2>
            <p className="text-lg mb-6">
              Our investment decisions are driven by rigorous research conducted
              by our student analysts. The process typically involves:
            </p>
            <motion.ul
              className="list-disc pl-6 text-lg mb-6 space-y-2"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.li variants={fadeIn}>
                Comprehensive fundamental analysis of companies
              </motion.li>
              <motion.li variants={fadeIn}>
                Development and backtesting of algorithmic strategies
              </motion.li>
              <motion.li variants={fadeIn}>
                Collaborative review of investment ideas
              </motion.li>
              <motion.li variants={fadeIn}>
                Formal presentation of investment theses to the committee
              </motion.li>
              <motion.li variants={fadeIn}>
                Implementation of approved strategies with real capital
              </motion.li>
              <motion.li variants={fadeIn}>
                Continuous monitoring and performance evaluation
              </motion.li>
            </motion.ul>
            <p className="text-lg">
              This hands-on approach provides our students with invaluable
              real-world experience in investment management while maintaining a
              disciplined and structured framework for capital allocation.
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

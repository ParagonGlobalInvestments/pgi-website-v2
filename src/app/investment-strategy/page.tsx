'use client';

import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaRobot,
  FaMoneyBillWave,
  FaUniversity,
} from 'react-icons/fa';
// import Image from 'next/image';
// import Link from 'next/link';

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

const cardItem = {
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

export default function InvestmentStrategy() {
  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-24 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Funds
        </motion.h1>

        {/* Overview Section */}
        <motion.div
          className="max-w-4xl mx-auto mb-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="text-lg mb-8" variants={fadeIn}>
            Thanks to the generous gifts of donors and sponsors, Paragon Global
            Investments deploys $40,000 into both the Paragon Value Fund and
            Paragon Systematic Fund. Members of Paragon Global Investments both
            develop pitches on mispriced assets and research and develop novel
            algorithmic trading strategies that will be invested out of their
            respective funds.
          </motion.p>

          <motion.p className="text-lg mb-12" variants={fadeIn}>
            Paragon's investment funds provide students with real-world
            opportunities to apply what they are taught in Paragon's education.
            Students can apply both fundamental analysis and systematic
            algorithms to identify potential asset upside and optimize returns.
          </motion.p>
        </motion.div>

        {/* Investment Strategy Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-secondary inline-block border-b-2 border-secondary pb-2">
            Investment Strategy
          </h2>
        </motion.div>

        {/* Funds Section */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-24"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Paragon Value Fund Card */}
          <motion.div
            className="bg-navy-light p-8 rounded-lg border border-gray-700"
            variants={cardItem}
          >
            <div className="flex items-center mb-6">
              <div className="bg-secondary p-3 rounded-full mr-4">
                <FaChartLine className="text-navy text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-secondary">
                Paragon Value Fund
              </h3>
            </div>

            <p className="text-gray-300 mb-6">
              The Paragon Value Fund is a well-diversified long-only investment
              fund that invests into publicly-traded US equities. Analysts
              engage in fundamental and bottom-up research to identify mispriced
              assets that will deliver long-term returns on capital to
              shareholders.
            </p>

            <p className="text-gray-300">
              Students are responsible for generating equity research reports,
              building detailed financial models, and presenting investment
              theses supported by qualitative and quantitative analysis. Our
              portfolio is constructed using modern portfolio theory and risk
              management principles to ensure optimal diversification and
              downside protection.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="bg-navy inline-block px-4 py-2 rounded-full border border-gray-700">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-secondary mr-2" />
                  <span className="text-sm font-medium">
                    Long-only US Equities
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Paragon Systematic Fund Card */}
          <motion.div
            className="bg-navy-light p-8 rounded-lg border border-gray-700"
            variants={cardItem}
          >
            <div className="flex items-center mb-6">
              <div className="bg-secondary p-3 rounded-full mr-4">
                <FaRobot className="text-navy text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-secondary">
                Paragon Systematic Fund
              </h3>
            </div>

            <p className="text-gray-300 mb-6">
              The Paragon Systematic Fund utilizes advanced mathematical
              analysis to develop novel systematic algorithmic trading
              strategies that predict price movements and generate risk-adjusted
              returns. Our fund leverages cutting-edge quantitative models,
              historical data analysis, and machine learning algorithms to make
              informed investment decisions with unparalleled precision.
            </p>

            <p className="text-gray-300">
              Students design, research, develop, and backtest their trading
              algorithms to be allocated a portion of the fund. Thanks to our
              partnership with CloudQuant, Paragon analysts have access to more
              than 15,000 alternative data sets for the development of
              proprietary trading signals.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="bg-navy inline-block px-4 py-2 rounded-full border border-gray-700">
                <div className="flex items-center">
                  <FaUniversity className="text-secondary mr-2" />
                  <span className="text-sm font-medium">
                    CloudQuant Partnership
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

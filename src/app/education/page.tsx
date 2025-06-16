'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, Terminal } from 'lucide-react';

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

const curricularItems = [
  {
    topic: 'Accounting',
    link: '/lectures/education/week1-accounting.pdf',
    week: 'Week 1',
    isExternal: false,
  },
  {
    topic: 'Valuation',
    link: '/lectures/education/week2-valuation.pdf',
    week: 'Week 2',
    isExternal: false,
  },
  {
    topic: 'Investment Theory',
    link: '/lectures/education/week3-investment-theory.pdf',
    week: 'Week 3',
    isExternal: false,
  },
  {
    topic: 'Quantitative Analysis with Python',
    link: 'https://colab.research.google.com/drive/15kROiqi1DpB5R8-aUUblX-_lURgjq20z',
    week: 'Week 4',
    isExternal: true,
  },
  {
    topic: 'Quantitative Portfolio Management',
    link: '/lectures/education/week5-quantitative-portfolio-management.pdf',
    week: 'Week 5',
    isExternal: false,
  },
  {
    topic: 'Algo Trading Strategy Design',
    link: '/lectures/education/week6-algorithmic-trading-and-backtesting.pdf',
    week: 'Week 6',
    isExternal: false,
  },
];

export default function Education() {
  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-24 px-4">
        {/* Curriculum Section */}
        <motion.div
          className="max-w-5xl mx-auto mb-8 border-gray-800"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <motion.h1
            className="text-4xl font-bold mb-8 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Education Curriculum
          </motion.h1>

          <motion.p
            className="text-center text-sm lg:text-base text-gray-300 mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Our program equips students with the skills to excel in value
            investing and algorithmic trading.
          </motion.p>

          {/* Curriculum Table */}
          <motion.div className="overflow-x-auto mb-16" variants={fadeIn}>
            <table className="min-w-full border-2 border-gray-700 bg-navy-light rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-lg font-semibold text-secondary">
                    Topic
                  </th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-secondary">
                    Materials
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm md:text-base">
                {curricularItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-navy transition-colors"
                  >
                    <td className="px-6 py-4 text-white">{item.topic}</td>
                    <td className="px-6 py-4">
                      {item.isExternal ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary whitespace-nowrap hover:text-white hover:scale-105 transition-all duration-100 bg-pgi-light-blue px-4 py-2 rounded-lg inline-block"
                        >
                          {item.week}
                        </a>
                      ) : (
                        <Link
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-secondary whitespace-nowrap hover:text-white hover:scale-105 transition-all duration-100 bg-pgi-light-blue px-4 py-2 rounded-lg inline-block"
                        >
                          {item.week}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Value Investing Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
            variants={staggerContainer}
          >
            <motion.div
              className="bg-navy-light p-8 rounded-lg border border-gray-700"
              variants={fadeIn}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-lg mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="text-white text-xl"
                  >
                    <path d="M14.828 14.828 21 21" />
                    <path d="M21 16v5h-5" />
                    <path d="m21 3-9 9-4-4-6 6" />
                    <path d="M21 8V3h-5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-secondary">
                  Value Investing
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                The fundamental component of the curriculum will help students
                gain a basic understanding behind the theory and strategies of
                value investing. Students will gain a fundamental understanding
                of accounting, competitive analysis, and valuation.
              </p>

              <p className="text-gray-300 mb-4">
                General modeling, including operating models and discounted cash
                flows models, will be explored as well as general investment
                theory related to these models.
              </p>

              <p className="text-gray-300">
                By the end of the curriculum, students will be able to
                accurately value companies and understand complex business
                models.
              </p>
            </motion.div>

            {/* Algorithmic Trading Section */}
            <motion.div
              className="bg-navy-light p-8 rounded-lg border border-gray-700"
              variants={fadeIn}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-lg mr-4">
                  <Terminal className="text-white text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-secondary">
                  Algorithmic Trading
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                The quantitative component of the curriculum aims to educate
                students on how to research, design, test, and implement
                systematic algorithmic trading strategies. Students will first
                learn about statistical analysis and introductory machine
                learning with Python.
              </p>

              <p className="text-gray-300 mb-4">
                They will also learn about modern portfolio theory and linear
                factor pricing models, and how to analyze assets and portfolio
                to optimize risk-adjusted returns.
              </p>

              <p className="text-gray-300">
                By the end of the curriculum, students will have a toolset to
                quantitatively analyze companies and design systematic trading
                strategies.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

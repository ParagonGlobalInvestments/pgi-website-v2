"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaChartLine, FaLaptopCode } from "react-icons/fa";

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

const curricularItems = [
  { topic: "Accounting", link: "#", week: "Week 1" },
  { topic: "Valuation", link: "#", week: "Week 2" },
  { topic: "Investment Theory", link: "#", week: "Week 3" },
  { topic: "Quantitative Analysis with Python", link: "#", week: "Week 4" },
  { topic: "Quantitative Portfolio Management", link: "#", week: "Week 5" },
  { topic: "Algo Trading Strategy Design", link: "#", week: "Week 6" },
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
                    Curriculum
                  </motion.h1>

          {/* Curriculum Table */}
          <motion.div className="overflow-x-auto mb-16" variants={fadeIn}>
            <table className="min-w-full bg-navy-light rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-4 text-left text-lg font-semibold text-secondary">
                    Topic
                  </th>
                  <th className="px-6 py-4 text-left text-lg font-semibold text-secondary">
                    Link to Materials
                  </th>
                </tr>
              </thead>
              <tbody>
                {curricularItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-navy transition-colors"
                  >
                    <td className="px-6 py-4 text-white">{item.topic}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={item.link}
                        className="text-secondary hover:text-white transition-colors"
                      >
                        {item.week}
                      </Link>
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
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaChartLine className="text-navy text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-secondary">
                  Value Investing
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                The fundamental component of the curriculum will help students gain a basic
                understanding behind the theory and strategies of value
                investing. Students will gain a fundamental understanding of
                accounting, competitive analysis, and valuation.
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
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaLaptopCode className="text-navy text-xl" />
                </div>
                <h3 className="text-2xl font-bold text-secondary">
                  Algorithmic Trading
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                The quantitative component of the curriculum aims to educate students on how to
                research, design, test, and implement systematic algorithmic
                trading strategies. Students will first learn about statistical
                analysis and introductory machine learning with Python.
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

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaLinkedin } from "react-icons/fa";

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
    },
  },
};

const memberItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Investment Committee data
const investmentCommittee = [
  {
    name: "Victor Lee",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/victorwlee/",
  },
  {
    name: "Victor Qin",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/victorqin/",
  },
  {
    name: "Ryan Lu",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/ryan-lu-35a304217/",
  },
  {
    name: "Mathew Sheu",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/mathewsheu/",
  },
  {
    name: "James Wu",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/jamesswu/",
  },
  {
    name: "Seungjo (Harry) Hwang",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/harry-hwang-722578209/",
  },
  {
    name: "Tony Weng",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/tony-weng-ab2a33186/",
  },
  {
    name: "Terry Wang",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/terry-wang-95a818217/",
  },
  {
    name: "Christopher Han",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/christopher-han-9693051b4/",
  },
];

// Portfolio Managers data
const portfolioManagers = [
  {
    name: "Cindy Lin",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/cindy-lin-b02a611a4/",
  },
  {
    name: "Mandy Chen",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/mandy-chen-15b9a6240/",
  },
  {
    name: "Ivan Shen",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/ivanshen/",
  },
  {
    name: "Yixing (Lily) Shao",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/yixing-lily-shao-a9a07121b/",
  },
  {
    name: "Andrew Zeng",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/andrew-zeng-b01a461b7/",
  },
  {
    name: "Ashley Wang",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/ashley-wang-9b0608219/",
  },
  {
    name: "Ethan Huang",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/ethan-huang-b8602a1b7/",
  },
];

// Analysts data
const analysts = [
  { name: "Edward Zhang", university: "UC Berkeley" },
  { name: "Danica Lin", university: "UC Berkeley" },
  { name: "Christopher Kim", university: "UC Berkeley" },
  { name: "Andy Fang", university: "UC Berkeley" },
  { name: "Ryan Liang", university: "UC Berkeley" },
  { name: "Ling Li", university: "UC Berkeley" },
  { name: "Alexander Chen", university: "UC Berkeley" },
  { name: "Wendy Wei", university: "UC Berkeley" },
  { name: "Ellen Ji", university: "UC Berkeley" },
  { name: "Steven Lin", university: "UC Berkeley" },
  { name: "Kevin Ji", university: "UC Berkeley" },
  { name: "Matthew Yoo", university: "UC Berkeley" },
  { name: "Andrew Chen", university: "UC Berkeley" },
  { name: "Joshua Lee", university: "New York University" },
  { name: "Daniel Ha", university: "New York University" },
  { name: "Lydia Cho", university: "New York University" },
  { name: "Hannah Kwon", university: "New York University" },
  { name: "Samuel Bai", university: "New York University" },
  { name: "Julianne Huang", university: "New York University" },
  { name: "Shaun He", university: "New York University" },
  { name: "Vivian Lin", university: "New York University" },
  { name: "Tina Liu", university: "New York University" },
  { name: "Eric Chen", university: "New York University" },
  { name: "Yiwen Jiang", university: "New York University" },
];

export default function ValueTeamPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-36 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl font-bold mb-6">Value Team</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our Value Team focuses on fundamental analysis and long-term
              investment strategies. The team is composed of our Investment
              Committee, Portfolio Managers, and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Investment Committee Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Investment Committee
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {investmentCommittee.map((member, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-navy p-6 rounded-lg border border-gray-700 hover:border-secondary transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-gray-400 mb-3">{member.university}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaLinkedin />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Portfolio Managers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Portfolio Managers
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {portfolioManagers.map((manager, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 hover:border-secondary transition-all"
              >
                <h3 className="text-xl font-semibold mb-2">{manager.name}</h3>
                <p className="text-gray-400 mb-3">{manager.university}</p>
                <a
                  href={manager.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-white transition-colors flex items-center gap-2"
                >
                  <FaLinkedin />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analysts Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Analysts
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {analysts.map((analyst, index) => (
              <motion.div
                key={index}
                variants={memberItem}
                className="bg-navy p-4 rounded-lg border border-gray-700"
              >
                <h3 className="text-lg font-semibold">{analyst.name}</h3>
                <p className="text-gray-400">{analyst.university}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

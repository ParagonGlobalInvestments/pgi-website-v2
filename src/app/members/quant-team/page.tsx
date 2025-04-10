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

// Quantitative Research Committee data
const researchCommittee = [
  {
    name: "Charlie Qiao",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/charlie-qiao/",
  },
  {
    name: "Michelle Tang",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/michelle-tang-8aa1651b4/",
  },
  {
    name: "Roy Geng",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/roygeng/",
  },
  {
    name: "Matthew Zhou",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/matthewzhou1/",
  },
  {
    name: "Pranav Moudgalya",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/pranav-moudgalya/",
  },
  {
    name: "George Chen",
    university: "UC Berkeley",
    linkedin: "https://www.linkedin.com/in/george-chen-7a7986222/",
  },
  {
    name: "Hannah Kwon",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/hannah-kwon-65a051218/",
  },
  {
    name: "Akshay Mamidi",
    university: "New York University",
    linkedin: "https://www.linkedin.com/in/akshaymamidi/",
  },
];

// Analysts data
const analysts = [
  { name: "Danning Liu", university: "UC Berkeley" },
  { name: "Asha Raj", university: "UC Berkeley" },
  { name: "Alvin Shen", university: "UC Berkeley" },
  { name: "Kevin Liu", university: "UC Berkeley" },
  { name: "Matthew Wong", university: "UC Berkeley" },
  { name: "Andrew Dong", university: "UC Berkeley" },
  { name: "David Wang", university: "UC Berkeley" },
  { name: "Kevin Zheng", university: "UC Berkeley" },
  { name: "Grace Lim", university: "UC Berkeley" },
  { name: "Richard Chen", university: "UC Berkeley" },
  { name: "Allen Huang", university: "UC Berkeley" },
  { name: "Lilian Liu", university: "UC Berkeley" },
  { name: "Sophia Li", university: "New York University" },
  { name: "Tiffany Xiao", university: "New York University" },
  { name: "David Chu", university: "New York University" },
  { name: "Iris Lui", university: "New York University" },
  { name: "Michael Zhang", university: "New York University" },
  { name: "Justin Chen", university: "New York University" },
  { name: "Brian Lee", university: "New York University" },
  { name: "Derek Kong", university: "New York University" },
];

export default function QuantTeamPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-36 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-4xl font-bold mb-6">Quant Team</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our Quantitative Team focuses on algorithmic trading strategies
              and data-driven investment approaches. The team is composed of our
              Quantitative Research Committee and Analysts.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Research Committee Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Quantitative Research Committee
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {researchCommittee.map((member, index) => (
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

      {/* Analysts Section */}
      <section className="py-16 px-4">
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
                className="bg-navy-light p-4 rounded-lg border border-gray-700"
              >
                <h3 className="text-lg font-semibold">{analyst.name}</h3>
                <p className="text-gray-400">{analyst.university}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer Navigation */}
      <motion.div
        className="container mx-auto px-4 py-10 border-t border-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="flex justify-center mb-8">
          <Image
            src="/images/pgiLogoTransparent.png"
            alt="Paragon Global Investments Logo"
            width={80}
            height={80}
            className="opacity-80"
          />
        </div>
        <p className="text-center text-gray-400 mb-8 max-w-3xl mx-auto">
          Paragon Global Investments is a registered 501(c)(3) nonprofit.
          Paragon Global Investments was previously known as Paragon National
          Group (PNG).
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link
            href="/who-we-are"
            className="hover:text-white transition-colors"
          >
            Who We Are
          </Link>
          <Link
            href="/national-committee/officers"
            className="hover:text-white transition-colors"
          >
            Officers
          </Link>
          <Link href="/members" className="hover:text-white transition-colors">
            Members
          </Link>
          <Link
            href="/placements"
            className="hover:text-white transition-colors"
          >
            Placements
          </Link>
          <Link href="/apply" className="hover:text-white transition-colors">
            Apply
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <p className="text-center text-gray-500 mt-4 text-sm">
          Paragon Global Investments | {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}

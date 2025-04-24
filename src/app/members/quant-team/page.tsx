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
    name: "Soupy De",
    university: "University of Chicago",
    linkedin: "",
  },
  {
    name: "William Vietor",
    university: "Columbia University",
    linkedin: "",
  },
  {
    name: "Samuel Henriques",
    university: "Princeton University",
    linkedin: "",
  },
  {
    name: "Ronak Datta",
    university: "University of Chicago",
    linkedin: "",
  },
  {
    name: "Anirudh Pottammal",
    university: "New York University",
    linkedin: "",
  },
  {
    name: "Sahishnu Hanumolu",
    university: "University of Pennsylvania",
    linkedin: "",
  },
  {
    name: "Dominic Olaguera-Delogu",
    university: "University of Pennsylvania",
    linkedin: "",
  },
  {
    name: "Matthew Neissen",
    university: "Yale University",
    linkedin: "",
  },
  {
    name: "Daniel Siegel",
    university: "Yale University",
    linkedin: "",
  },
  {
    name: "Ethan Chang",
    university: "Columbia University",
    linkedin: "",
  },
];

// Analysts data
const analysts = [
  { name: "Aakshay Gupta", university: "Cornell University" },
  { name: "Andrew Da", university: "Cornell University" },
  { name: "Ann Li", university: "New York University" },
  { name: "Anthony Wong", university: "Cornell University" },
  { name: "Atishay Narayanan", university: "Princeton University" },
  { name: "Aurora Wang", university: "Columbia University" },
  { name: "Benjamin Weber", university: "Princeton University" },
  { name: "Benjamin Zhou", university: "Princeton University" },
  { name: "Brianna Wang", university: "Columbia University" },
  { name: "Connor Brown", university: "Princeton University" },
  { name: "Edward Stan", university: "Columbia University" },
  { name: "Joonseok Jung", university: "Cornell University" },
  { name: "Kayla Shan", university: "Cornell University" },
  { name: "Linglong Dai", university: "Cornell University" },
  { name: "Meghana Kesanapalli", university: "Cornell University" },
  { name: "Mikul Saravanan", university: "Columbia University" },
  { name: "Rohan Sabu", university: "New York University" },
  { name: "Siddharth Shastry", university: "University of Chicago" },
  { name: "Srirag Tavarti", university: "Columbia University" },
  { name: "Robert Liu", university: "University of Chicago" },
  { name: "Flynn Kelleher", university: "Cornell University" },
  { name: "Anupam Bhakta", university: "Columbia University" },
  { name: "Kaiji Uno", university: "Columbia University" },
  { name: "Lucas Tucker", university: "University of Chicago" },
  { name: "Sohini Banerjee", university: "University of Chicago" },
  { name: "Pranav Mishra", university: "Cornell University" },
  { name: "Helen Ho", university: "New York University" },
  { name: "Ece Tumer", university: "University of Chicago" },
  { name: "Aman Dhillon", university: "University of Chicago" },
  { name: "Nico Roth", university: "University of Chicago" },
  { name: "Nikhil Reddy", university: "University of Chicago" },
  { name: "Anthony Luo", university: "University of Chicago" },
  { name: "Farrell Wenardy", university: "University of Chicago" },
  { name: "William Li", university: "University of Chicago" },
  { name: "Kabir Buch", university: "University of Chicago" },
  { name: "Ishaan Sareen", university: "University of Chicago" },
  { name: "Koren Gila", university: "University of Chicago" },
  { name: "Yoyo Zhang", university: "University of Chicago" },
  { name: "Lars Barth", university: "University of Chicago" },
  { name: "Benjamin Levi", university: "University of Chicago" },
  { name: "Arav Saksena", university: "University of Chicago" },
];

export default function QuantTeamPage() {
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
    </div>
  );
}

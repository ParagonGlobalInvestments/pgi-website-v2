"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      ease: "easeOut",
    },
  },
};

// Officer data
const officers = [
  {
    name: "Philip Bardon",
    title: "Chairman",
    university: "Columbia University",
    linkedin: "#",
  },
  {
    name: "Myles Spiess",
    title: "Chief Executive Officer",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Sean Oh",
    title: "Co-Chief Operating Officer",
    university: "University of Pennsylvania",
    linkedin: "#",
  },
  {
    name: "Sohini Banerjee",
    title: "Co-Chief Operating Officer",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Souptik De",
    title: "Co-Chief Operating Officer",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Clara Ee",
    title: "Co-Chief Investment Officer",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Jayanth Mammen",
    title: "Co-Chief Investment Officer",
    university: "University of Pennsylvania",
    linkedin: "#",
  },
  {
    name: "Dominic Olaguera-Delogu",
    title: "Co-Chief Quantitative Researcher",
    university: "University of Pennsylvania",
    linkedin: "#",
  },
  {
    name: "Samuel Henriques",
    title: "Co-Chief Quantitative Researcher",
    university: "Princeton University",
    linkedin: "#",
  },
  {
    name: "Robert Liu",
    title: "Co-Chief Technology Officer",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Harrison Du",
    title: "Co-Chief Technology Officer",
    university: "New York University",
    linkedin: "#",
  },
];

// Alumni Board
const alumniBoard = [
  {
    name: "Jay Sivadas",
    company: "Morgan Stanley",
    linkedin: "#",
  },
  {
    name: "Daniel Labrador-Plata",
    company: "Bank of America",
    linkedin: "#",
  },
  {
    name: "Erin Ku",
    company: "RBC Capital Markets",
    linkedin: "#",
  },
  {
    name: "Bradley Yu",
    company: "Citadel",
    linkedin: "#",
  },
  {
    name: "Advay Mohindra",
    company: "Citadel",
    linkedin: "#",
  },
  {
    name: "Harrison Wang",
    company: "Morgan Stanley",
    linkedin: "#",
  },
];

export default function OfficersPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Officers Section */}
      <section className="py-36 px-4">
        <div className="container mx-auto">
          <motion.h1
            className="text-4xl font-bold mb-16 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Officers
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {officers.map((officer, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 hover:border-secondary transition-colors"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-2xl font-semibold mb-1">{officer.name}</h2>
                <p className="text-secondary font-medium mb-1">
                  {officer.title}
                </p>
                <p className="text-gray-400 mb-4">{officer.university}</p>
                <a
                  href={officer.linkedin}
                  className="inline-flex items-center text-white hover:text-secondary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>

          {/* Alumni Board Section */}
          <motion.h2
            className="text-3xl font-bold mb-10 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            Alumni Board
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            transition={{ delayChildren: 0.7 }}
          >
            {alumniBoard.map((alumni, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-5 rounded-lg border border-gray-700 hover:border-secondary transition-colors"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h3 className="text-xl font-semibold mb-1">{alumni.name}</h3>
                <p className="text-gray-400 mb-4">{alumni.company}</p>
                <a
                  href={alumni.linkedin}
                  className="inline-flex items-center text-white hover:text-secondary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

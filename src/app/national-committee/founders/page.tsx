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

// Founder data
const founders = [
  {
    name: "Jay Sivadas",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Daniel Labrador",
    university: "University of Chicago",
    linkedin: "#",
  },
  {
    name: "Erin Ku",
    university: "University of Chicago",
    linkedin: "#",
  },
];

// Chapter Founders by university
const chapterFounders = {
  "University of Chicago": [
    "Lucas Mantovani",
    "John Hahn",
    "Brianna Liu",
    "Raphael Jimenez",
    "Advay Mohindra",
    "Silvia Aydinyan",
    "Jeffrey Kao",
    "Bradley Yu",
  ],
  "University of Pennsylvania": [
    "Arjun Neervanan",
    "Saahil Kamulkar",
    "Ria Sharma",
    "Daniel Barra",
    "Nicole Rong",
    "Olgierd Fudali",
    "Aryan Singh",
    "Anthony Steimle",
    "Andy Mei",
    "Grant Mao",
    "Ashish Pothireddy",
    "Prithvi Bale",
    "Manya Gauba",
    "Arman Ashaboglu",
  ],
  "New York University": [
    "Christopher Rosa",
    "Elizabeth Grayfer",
    "Rishi Subbaraya",
    "Yihao Zhong",
    "Harrison Du",
    "Justin Singh",
    "Arthur Chen",
  ],
  "Columbia University": [
    "Philip Bardon",
    "Ali Alomari",
    "Colby Cox",
    "Robert Stankard",
    "Nischal Chennuru",
    "Harrison Wang",
    "Kaiji Uno",
    "Olivia Stevens",
    "Kenny Zhu",
    "Emma Liu",
    "Tony Chen",
    "Anupam Bhakta",
    "William Vietor",
    "Matthew Weng",
  ],
  "Brown University": [
    "Sandra Martinez",
    "Nick Klatsky",
    "Tianyu Zhou",
    "Advay Mansingka",
    "Luke Briody",
    "Angela Osei-Ampadu",
    "Raymundo Chapa Ponce",
    "Finnur Christianson",
    "Erica Li",
  ],
  "Cornell University": [
    "Kate Michelini",
    "Flynn Kelleher",
    "Max Koster",
    "Michael Negrea",
    "Leopold Home",
    "Caroline Duthie",
    "Pranav Mishra",
    "Benjamin Collins",
    "Corey Wang",
  ],
  "Princeton University": [
    "Brandon Hwang",
    "Brandon Cheng",
    "Jack Deschenes",
    "Eli Soffer",
    "Samuel Henriques",
    "Rebecca Zhu",
    "Michael Deschenes",
    "Jason Ciptonugroho",
    "Ellie Mueller",
  ],
  "Yale University": [
    "Jack Stemerman",
    "Joshua Donovan",
    "Matthew Neissen",
    "Daniel Siegel",
    "Charlie Stemerman",
  ],
};

export default function FoundersPage() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Main Founders Section */}
      <section className="py-36 px-4">
        <div className="container mx-auto">
          <motion.h1
            className="text-4xl font-bold mb-16 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            Founders
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 hover:border-secondary transition-colors text-center"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-2xl font-semibold mb-1">{founder.name}</h2>
                <p className="text-gray-400 mb-4">{founder.university}</p>
                <a
                  href={founder.linkedin}
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

          {/* Chapter Founders Section */}
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            Chapter Founders
          </motion.h2>

          <div className="space-y-14">
            {Object.entries(chapterFounders).map(
              ([university, names], uIndex) => (
                <motion.div
                  key={university}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: 0.1 * uIndex }}
                >
                  <h3 className="text-2xl font-bold mb-6 text-secondary">
                    {university}
                  </h3>
                  <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {names.map((name, index) => (
                      <motion.div
                        key={index}
                        className="bg-navy-light p-4 rounded-lg border border-gray-700"
                        variants={cardAnimation}
                        whileHover={{ x: 5, transition: { duration: 0.2 } }}
                      >
                        <p className="font-medium">{name}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <motion.div
        className="container mx-auto px-4 py-10 border-t border-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
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
            href="/investment-strategy"
            className="hover:text-white transition-colors"
          >
            Investment Strategy
          </Link>
          <Link
            href="/publications"
            className="hover:text-white transition-colors"
          >
            Publications
          </Link>
          <Link href="/sponsors" className="hover:text-white transition-colors">
            Sponsors
          </Link>
          <Link
            href="/national-committee/officers"
            className="hover:text-white transition-colors"
          >
            Officers
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

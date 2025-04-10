"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

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

const companyItem = {
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

export default function PlacementsPage() {
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
            <h1 className="text-4xl font-bold mb-6">Alumni</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Since 2021, members of Paragon Global Investments have excelled in
              many different fields within the finance and tech industries.
              Paragon alumni have received internship and job offers from the
              foremost companies, startups, and nonprofits across finance and
              technology. Paragon members and alumni have experience in
              investment banking, quantitative trading, software development,
              private equity, equity research, private credit, and management
              consulting.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Investment Banking Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Investment Banking
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              "Goldman",
              "JP Morgan",
              "Morgan Stanley",
              "Bank of America",
              "RBC",
              "Citi",
              "CS",
              "Evercore",
              "Lazard",
              "Qatalyst",
              "PJT",
              "PWP",
              "LionTree",
              "Mklein",
              "Guggenheim",
              "Mizuho",
              "Jefferies",
              "Baird",
              "Nomura",
              "Macquarie",
              "UBS",
            ].map((company, index) => (
              <motion.div
                key={index}
                variants={companyItem}
                className="bg-navy p-4 rounded-lg border border-gray-700 text-center"
              >
                <h3 className="text-lg font-semibold">{company}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quantitative Trading and Technology Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Quantitative Trading and Technology
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              "Citadel",
              "JS",
              "deshaw",
              "arrowstreet",
              "Optiver",
              "AQR",
              "SIG",
              "IMC",
              "Five Rings",
              "virtu",
              "Peak6",
              "flow",
              "Belvedere",
              "Group One",
              "Finalzye",
              "Millennium",
              "BlackEdge",
              "Kershner",
              "cloudquant",
              "Amazon",
              "Apple",
              "Google",
              "Meta",
              "Microsoft",
              "ByteDance",
              "Palantir",
              "SpaceX",
              "Databricks",
              "Plaid",
              "IBM",
              "siemens",
              "StoneCo",
            ].map((company, index) => (
              <motion.div
                key={index}
                variants={companyItem}
                className="bg-navy-light p-4 rounded-lg border border-gray-700 text-center"
              >
                <h3 className="text-lg font-semibold">{company}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Asset Management and Consulting Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Asset Management and Consulting
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[
              "Citadel",
              "Point72",
              "dodge",
              "Apollo Management",
              "Ares Management",
              "Blackstone",
              "Carlyle",
              "McKinsey & Company",
              "Bain & Company",
              "BCG",
              "Advent International",
              "CDR",
              "Dodge and Cox",
              "GTCR",
              "AKKR",
              "BAM",
              "NB",
              "Farallon Capital",
              "Girls Who Invest",
              "Golub Capital",
              "Volition",
              "Intermediate Capital Group",
              "Arena Investors",
              "US Bank",
              "PwC",
            ].map((company, index) => (
              <motion.div
                key={index}
                variants={companyItem}
                className="bg-navy p-4 rounded-lg border border-gray-700 text-center"
              >
                <h3 className="text-lg font-semibold">{company}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

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

const teamCardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  hover: {
    y: -10,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.3,
    },
  },
};

export default function MembersPage() {
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
            <h1 className="text-4xl font-bold mb-6">Our Members</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet the talented individuals who make up Paragon Global
              Investments. Our members are selected from top universities across
              the nation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Value Team Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={teamCardVariant}
            >
              <Link href="/members/value-team" className="block">
                <div className="bg-navy-light p-8 rounded-lg border border-gray-700 hover:border-secondary transition-all h-full">
                  <h2 className="text-2xl font-bold mb-4 text-secondary">
                    Value Team
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Our Value Team focuses on fundamental analysis and long-term
                    investment strategies. Meet our Investment Committee,
                    Portfolio Managers, and Analysts.
                  </p>
                  <span className="text-secondary font-medium">
                    View Team →
                  </span>
                </div>
              </Link>
            </motion.div>

            {/* Quant Team Card */}
            <motion.div
              initial="hidden"
              animate="visible"
              whileHover="hover"
              variants={teamCardVariant}
            >
              <Link href="/members/quant-team" className="block">
                <div className="bg-navy-light p-8 rounded-lg border border-gray-700 hover:border-secondary transition-all h-full">
                  <h2 className="text-2xl font-bold mb-4 text-secondary">
                    Quant Team
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Our Quant Team specializes in data-driven investment
                    strategies and algorithmic trading. Meet our Quantitative
                    Research Committee and Analysts.
                  </p>
                  <span className="text-secondary font-medium">
                    View Team →
                  </span>
                </div>
              </Link>
            </motion.div>
          </div>
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

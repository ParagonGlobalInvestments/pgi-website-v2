"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaHandshake,
  FaAward,
  FaChartLine,
  FaLaptopCode,
} from "react-icons/fa";

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

const sponsorAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function Sponsors() {
  // Sponsors data
  const sponsors = [
    { name: "Citadel", logo: "/logos/pgiLogoTransparent.png" },
    { name: "CitSec", logo: "/logos/pgiLogoTransparent.png" },
    { name: "Kershner", logo: "/logos/pgiLogoTransparent.png" },
    { name: "JS", logo: "/logos/pgiLogoTransparent.png" },
    { name: "IMC", logo: "/logos/pgiLogoTransparent.png" },
    { name: "DRW", logo: "/logos/pgiLogoTransparent.png" },
    { name: "Kershner", logo: "/logos/pgiLogoTransparent.png" },
    { name: "Adams Street", logo: "/logos/pgiLogoTransparent.png" },
    { name: "Arena Investors LP", logo: "/logos/pgiLogoTransparent.png" },
  ];

  // Partners data
  const partners = [
    {
      name: "CloudQuant",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "The exclusive partnership between Paragon and CloudQuant gives Paragon quantitative analysts access to over 15,000 private alternative data sets for building models and developing signals, enabling PNG students to perform real quantitative research.",
    },
    {
      name: "Databento",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Databento is a leading provider of real-time and historical market data to leading institutional investors. Paragon and Databento are partnered to provide Paragon students with access to real-time and exclusive market data across equities, options, and forex data!",
    },
    {
      name: "Kirkland & Ellis",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Kirkland & Ellis, one of the largest law firms in the United States, is Paragon's official legal advisor, actively helping spread the organization's mission to as many students as possible.",
    },
    {
      name: "Visible Alpha",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Visible Alpha is a leading provider of market data, sell-side information, financial information, and other company analysis software. All Paragon investment analysts will have access to visible alpha software through their PMs, which will assist them in developing deeper insights into the companies Paragon researches.",
    },
    {
      name: "Tegus",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Tegus, a leading investment research platform, is a partner of Paragon's Value Fund.",
    },
    {
      name: "BamSEC",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "BamSEC is a leading online platform that allows users to more efficiently perform financial research when working with Securities and Exchange Commission (SEC) filings and earnings transcripts. BamSEC helps Paragon students analyze companies and build financial models for our investment pitches.",
    },
    {
      name: "EdmundSEC",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "EdmundSEC is a leading provider of software that helps users efficiently perform financial research when working with SEC documents. The company leverages unique AI software to accelerate financial research. EdmundSEC helps students with their financial research and building financial models.",
    },
    {
      name: "Wall Street Oasis",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Wall Street Oasis provides Paragon Global Investments members exclusive resources to prepare them for professional recruitment.",
    },
    {
      name: "Elevate",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Paragon partnered with Elevate Career Network—the largest Private Equity, Investment Banking, Venture Capital, Hedge Fund Network in North America and Europe—to provide our members with exclusive access to recruiting opportunities in finance.",
    },
    {
      name: "Breaking Into Wall Street",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Breaking Into Wall Street is the premier financial modeling training platform for investment banking and private equity interviews.",
    },
    {
      name: "Hireflix",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Hireflix is a leading one-way video interview software platform. Hireflix has partnered with PGI to support our national recruitment efforts.",
    },
    {
      name: "Portfolio123",
      logo: "/images/pgiLogoTransparent.png",
      description:
        "Portfolio123 enables portfolio managers and quantitative investors to develop advanced machine learning-driven quantitative portfolio strategies without writing any code. Combining advanced capabilities with user-friendly design, Portfolio123 significantly lowers R&D costs.",
    },
    {
      name: "Jane Street",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Jane Street is a quantitative trading firm and liquidity provider with a focus on technology and collaborative problem solving.",
    },
    {
      name: "Citadel Securities",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Citadel Securities is a leading global market maker that provides liquidity and price discovery to financial markets around the world.",
    },
    {
      name: "Bridgewater Associates",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Bridgewater Associates is a global investment management firm founded by Ray Dalio, focused on understanding how economic and financial markets work.",
    },
    {
      name: "Point72",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Point72 is a global asset management firm led by Steven Cohen that uses discretionary long/short equities, macro, and systematic strategies.",
    },
    {
      name: "Two Sigma",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Two Sigma is a technology company applying cutting-edge AI and machine learning techniques to fields like finance and insurance.",
    },
    {
      name: "D. E. Shaw",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "The D. E. Shaw group is a global investment and technology development firm with a quantitative focus, known for its computational and mathematical approach.",
    },
    {
      name: "AQR Capital",
      role: "Executive Sponsor",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "AQR Capital Management is a global investment management firm that uses a data-driven approach to find investment opportunities.",
    },
    {
      name: "IMC Trading",
      role: "Supporting Partner",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "IMC is a leading market maker, combining trading expertise with innovative technology across financial instruments.",
    },
    {
      name: "SIG",
      role: "Supporting Partner",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Susquehanna International Group (SIG) is a global quantitative trading firm founded on a rigorous analytical approach to decision making.",
    },
    {
      name: "DRW",
      role: "Supporting Partner",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "DRW is a principal trading firm that utilizes technology to identify and capture trading opportunities in markets around the world.",
    },
    {
      name: "Optiver",
      role: "Supporting Partner",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Optiver is a leading global market maker with a focus on pricing, execution and risk management technologies.",
    },
    {
      name: "Hudson River Trading",
      role: "Supporting Partner",
      logo: "/logos/pgiLogoTransparent.png",
      description:
        "Hudson River Trading (HRT) is a multi-asset class quantitative trading firm using a scientific approach to trading financial products.",
    },
  ];

  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-36 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Sponsors and Partners
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="text-lg text-center text-gray-300">
            Paragon Global Investments is partnered with top firms and
            organizations to provide our students the best access to the top
            firms in finance, tech, and quant across the United States. Sponsors
            contribute to Paragon's investment fund, operations, and the growth
            of our members.
          </p>
        </motion.div>

        {/* Sponsors Section */}
        <motion.div
          className="mb-24"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="flex items-center justify-center mb-12"
            variants={fadeIn}
          >
            <FaAward className="text-secondary text-2xl mr-3" />
            <h2 className="text-3xl font-bold text-secondary">Sponsors</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
          >
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 flex flex-col items-center justify-center"
                variants={sponsorAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-3 mb-4">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-center">
                  {sponsor.name}
                </h3>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Partners Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="flex items-center justify-center mb-12"
            variants={fadeIn}
          >
            <FaHandshake className="text-secondary text-2xl mr-3" />
            <h2 className="text-3xl font-bold text-secondary">Partners</h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                className="bg-navy-light p-6 mb-8 rounded-lg border border-gray-700 hover:border-secondary transition-duration-300"
                variants={cardAnimation}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-4 mb-6 md:mb-0 md:mr-8 shrink-0">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-secondary">
                      {partner.name}
                    </h3>
                    <p className="text-gray-300">{partner.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

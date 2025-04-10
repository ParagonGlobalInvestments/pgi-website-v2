"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaFilePdf,
  FaCalendarAlt,
  FaClock,
  FaNewspaper,
  FaArrowRight,
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

const timelineAnimation = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function Publications() {
  // Research publications data
  const publications = [
    {
      id: 1,
      title: "AppLovin Pitch",
      description:
        "Paragon pitch on AppLovin (APP). 280% Return over holding period from 12/22 to 8/31.",
      link: "#",
    },
    {
      id: 2,
      title: "Smart Beta and Factor Portfolio Construction",
      description:
        "Research report on how to construct portfolios using factor analysis or create portfolio weightings using Smart Beta. An extension on the LFPM report.",
      link: "#",
    },
    {
      id: 3,
      title: "Linear Factor Pricing Models",
      description:
        "Research report providing an introduction to regression analysis, linear factor pricing models, and factor decomposition. An extention of the modern portfolio theory research report.",
      link: "#",
    },
    {
      id: 4,
      title: "Modern Portfolio Theory",
      description:
        "Research report providing an introduction to modern portfolio theory and mean-variance analysis. This paper provides an overview of week one of the Paragon curriculum.",
      link: "#",
    },
  ];

  // Timeline events data
  const timelineEvents = [
    {
      date: "18th Oct, 2023",
      title: "Paragon Cornell",
      description:
        "Paragon officially opens its sixth chapter at Cornell University.",
    },
    {
      date: "15th Nov, 2023",
      title: "BamSEC Partnership",
      description:
        "Paragon and BamSEC partner to provide Paragon students with unparalleled access to financial information.",
    },
    {
      date: "30th Oct, 2023",
      title: "Paragon Brown",
      description:
        "Paragon officially opens its fifth chapter at Brown University.",
    },
    {
      date: "5th Oct, 2023",
      title: "Paragon Columbia",
      description:
        "Paragon officially opens its fourth chapter at Columbia University.",
    },
    {
      date: "30th Sep, 2023",
      title: "CloudQuant/Kershner Partnership",
      description:
        "CloudQuant and Paragon partner, which provides Paragon access to 15,000 alternative data sets to conduct signal research on!",
    },
    {
      date: "30th Aug, 2023",
      title: "Visible Alpha Partnership",
      description:
        "Visible Alpha, one of the largest financial data providers, partners with Paragon to give our students access to information to aid or investment research.",
    },
    {
      date: "18th Aug, 2023",
      title: "Paragon NYU",
      description:
        "Paragon officially opens its third chapter at New York University.",
    },
    {
      date: "10th Jul, 2023",
      title: "Kirkland and Ellis Partnership",
      description:
        "Kirkland and Ellis, one of the largest law firms in the US, becomes the official legal advisor for PNG",
    },
    {
      date: "12th May, 2023",
      title: "Citadel Sponsorship",
      description:
        "Citadel, one of the largest hedge funds in the world with more than $60bn in AUM, sponsors Paragon.",
    },
    {
      date: "11th May, 2023",
      title: "DRW Sponsorship",
      description:
        "DRW, one of the top quantitative trading firms in the US, sponsors Paragon.",
    },
    {
      date: "2nd April, 2023",
      title: "Elevate Partnership",
      description:
        "Paragon partners with Elevate--the largest recruiting platform for Investment Banking, Private Equity, and Hedge Funds--to bring exclusive recruiting opportunities to our students",
    },
    {
      date: "24th March, 2023",
      title: "Jane Street Sponsorship",
      description:
        "Jane Street, one of the largest quantitative trading firms in the world, officially sponsors Paragon.",
    },
    {
      date: "6th March, 2023",
      title: "WSO Partnership",
      description:
        "Paragon partners with Wall Street Oasis, the largest community focused on careers in finance, to bring Paragon members exclusive resources and opportunities.",
    },
    {
      date: "12th Oct, 2022",
      title: "Non-Profit Recognition",
      description:
        "Paragon is officially registered and recognized as a 501(c)(3) tax-exempt not-for-profit organization.",
    },
    {
      date: "2nd Oct, 2022",
      title: "Paragon UPenn",
      description:
        "Paragon Global Investments officially opens its second chapter at the University of Pennsylvania.",
    },
    {
      date: "10th Sept, 2022",
      title: "Paragon Investment Fund Launch",
      description:
        "Thanks to generous donors, Paragon Global Investments officially launches its flagship investment fund where students can invest into real publicly traded equities using value investing and quantitative based techniques.",
    },
    {
      date: "26th Dec, 2021",
      title: "Paragon is Founded",
      description:
        "Paragon Global Investments launches its first chapter with the goal of educating students on the interesection of value investing, software development, and quantitative finance.",
    },
  ];

  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-36 px-4">
        <motion.h1
          className="text-4xl font-bold mb-12 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Publications
        </motion.h1>

        {/* Research Publications Section */}
        <motion.div
          className="max-w-5xl mx-auto mb-24"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {publications.map((pub) => (
              <motion.div
                key={pub.id}
                className="bg-navy-light p-6 rounded-lg border border-gray-700 hover:border-secondary transition-colors h-full flex flex-col"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-secondary p-3 rounded-full mr-4 mt-1">
                    <FaFilePdf className="text-navy" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary">
                    {pub.title}
                  </h2>
                </div>
                <p className="text-gray-300 mb-6 flex-grow">
                  {pub.description}
                </p>
                <a
                  href={pub.link}
                  className="inline-flex items-center px-4 py-2 bg-secondary text-navy font-medium rounded hover:bg-opacity-90 transition-colors self-start mt-auto"
                >
                  View Report <FaArrowRight className="ml-2" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-4">
            <FaNewspaper className="text-secondary mr-3 text-xl" />
            <h2 className="text-3xl font-bold">News and Timeline</h2>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          className="max-w-4xl mx-auto mb-20 relative"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Timeline Center Line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-700 transform md:translate-x-0 translate-x-9"></div>

          {timelineEvents.map((event, index) => (
            <motion.div
              key={index}
              className="relative mb-10 flex flex-col md:flex-row"
              variants={timelineAnimation}
            >
              {/* For desktop, alternate left and right */}
              <div
                className={`w-full md:w-1/2 ${
                  index % 2 === 0
                    ? "md:pr-12 md:text-right"
                    : "md:pl-12 md:ml-auto"
                }`}
              >
                <div
                  className={`bg-navy-light p-5 rounded-lg border border-gray-700 ${
                    index % 2 === 0 ? "" : "md:-order-1"
                  }`}
                >
                  <div className="flex items-center mb-3 md:justify-end">
                    <FaCalendarAlt className="text-secondary mr-2" />
                    <span className="text-gray-400 text-sm">{event.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-300">{event.description}</p>
                </div>
              </div>

              {/* Timeline Node */}
              <div className="absolute left-9 md:left-1/2 top-5 w-4 h-4 rounded-full bg-secondary border-4 border-navy transform md:translate-x-0 -translate-x-1/2"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          className="container mx-auto px-4 py-10 border-t border-gray-800 mt-16"
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
            <Link
              href="/sponsors"
              className="hover:text-white transition-colors"
            >
              Sponsors
            </Link>
            <Link
              href="/national-committee/founders"
              className="hover:text-white transition-colors"
            >
              Founders
            </Link>
            <Link
              href="/national-committee"
              className="hover:text-white transition-colors"
            >
              National Committee
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
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
          <p className="text-center text-gray-500 mt-4 text-sm">
            Paragon Global Investments | {new Date().getFullYear()}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

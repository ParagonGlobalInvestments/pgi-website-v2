"use client";

import Image from "next/image";
import { motion } from "framer-motion";
// import Link from "next/link";
// import { FaBook, FaChartLine, FaLaptopCode } from "react-icons/fa";
import {
  FaCalendarAlt,
  FaNewspaper,
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

const logoAnimation = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
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

export default function WhoWeAre() {
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
      <div className="container mx-auto py-24 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Who We Are
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="text-lg mb-8" variants={fadeIn}>
            Paragon Global Investments (formerly PNG) is a student-led
            intercollegiate investment fund with chapters at Brown University,
            Columbia University, Cornell University, New York University,
            Princeton University, Yale University, the University of Chicago,
            and the University of Pennsylvania. The organization is dedicated to
            the development of students in value investing and algorithmic
            trading.
          </motion.p>

          <motion.p className="text-lg mb-8" variants={fadeIn}>
            Students admitted to Paragon follow an educational curriculum that
            teaches applied value investing and algorithmic trading. Upon
            completing the education portion, students will join the
            organization either as investment analysts or quantitative analysts,
            working on stock pitches or designing systematic algorithms that
            will be invested into or deployed into Paragon's $40,000 investment
            funds.
          </motion.p>

          <motion.p className="text-lg mb-12" variants={fadeIn}>
            Since our inception, we have grown to 300+ active students and every
            year we receive close to 2,000 students interested in joining our
            organization nationally.
          </motion.p>
        </motion.div>

        {/* University Logos Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-16 mb-24"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Row 1 */}
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/brown.png"
              alt="Brown University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/columbia.png"
              alt="Columbia University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/cornell.png"
              alt="Cornell University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/nyu.png"
              alt="New York University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>

          {/* Row 2 */}
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/princeton.png"
              alt="Princeton University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/uchicago.png"
              alt="University of Chicago"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/upenn.png"
              alt="University of Pennsylvania"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
          <motion.div
            className="flex justify-center items-center rounded-lg p-6 h-48 w-full"
            variants={logoAnimation}
          >
            <Image
              src="/images/universities/yale.png"
              alt="Yale University"
              width={150}
              height={150}
              className="object-contain"
            />
          </motion.div>
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
      </div>
    </div>
  );
}

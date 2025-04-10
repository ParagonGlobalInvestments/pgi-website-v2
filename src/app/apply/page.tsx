"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaUserGraduate,
  FaChartLine,
  FaClipboardList,
  FaCoffee,
  FaRegClock,
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
    },
  },
};

const cardItem = {
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

const buttonVariant = {
  hover: {
    scale: 1.05,
    backgroundColor: "#1f4287",
    transition: {
      duration: 0.2,
    },
  },
};

// Timeline data
const timelineEvents = [
  { date: "Jan 8, 2025", time: "8:00 PM ET", title: "Info Session I (Zoom)" },
  { date: "Jan 9, 2025", time: "8:00 PM ET", title: "Diversity Event (Zoom)" },
  { date: "Jan 10, 2025", time: "8:00 PM ET", title: "Info Session II (Zoom)" },
  { date: "Jan 11-13, 2025", time: "9:00 AM ET", title: "Coffee Chats" },
  { date: "Jan 13, 2025", time: "12:00 AM ET", title: "Applications Open" },
  { date: "Jan 14, 2025", time: "8:00 PM ET", title: "Diversity Event (Zoom)" },
  {
    date: "Jan 15, 2025",
    time: "8:00 PM ET",
    title: "PM and ICOMM Event (Zoom)",
  },
  { date: "Jan 17, 2025", time: "11:59 PM ET", title: "Applications Close" },
];

// Recruitment team data
const recruitmentTeam = [
  {
    name: "Sohini Banerjee",
    role: "Co-Head of Recruitment",
    university: "University of Chicago",
  },
  {
    name: "John Otto",
    role: "Co-Head of Recruitment",
    university: "University of Pennsylvania",
  },
  {
    name: "Ann Li",
    role: "Recruiter",
    university: "New York University",
  },
  {
    name: "Aurora Wang",
    role: "Recruiter",
    university: "Columbia University",
  },
  {
    name: "David Chen",
    role: "Recruiter",
    university: "Columbia University",
  },
  {
    name: "Lucas Lu",
    role: "Recruiter",
    university: "Cornell University",
  },
  {
    name: "Nana Agyeman",
    role: "Recruiter",
    university: "Princeton University",
  },
  {
    name: "Daniel Kim",
    role: "Recruiter",
    university: "Princeton University",
  },
  {
    name: "Flynn Kelleher",
    role: "Recruiter",
    university: "Cornell University",
  },
  {
    name: "Jack Stemerman",
    role: "Recruiter",
    university: "Yale University",
  },
  {
    name: "John Yi",
    role: "Recruiter",
    university: "New York University",
  },
  {
    name: "Joshua Donovan",
    role: "Recruiter",
    university: "Yale University",
  },
];

export default function ApplyPage() {
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
            <h1 className="text-4xl font-bold mb-6">
              PGI Winter 2025 National Recruitment
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join Paragon Global Investments and be part of a community
              dedicated to excellence in finance and investing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Application Options Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Education Application */}
            <motion.div
              className="bg-navy p-8 rounded-lg border border-gray-700"
              initial="hidden"
              animate="visible"
              variants={cardItem}
            >
              <div className="flex items-center mb-6">
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaUserGraduate className="text-navy text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-secondary">
                  Education Application
                </h2>
              </div>
              <p className="text-gray-300 mb-6">
                The education application is for admittance to the education
                portion of Paragon. The education is a 6-week curriculum that
                covers both fundamental investing and quantitative finance.
              </p>
              <p className="text-gray-300 mb-6">
                Upon successful completion of the program, students will have
                the opportunity to join their preferred investment fund. For
                further details, please refer to the education application
                below.
              </p>
              <p className="text-secondary font-medium mb-6">
                This opportunity is exclusively available to first-year
                students.
              </p>
            </motion.div>

            {/* Direct Fund Application */}
            <motion.div
              className="bg-navy p-8 rounded-lg border border-gray-700"
              initial="hidden"
              animate="visible"
              variants={cardItem}
            >
              <div className="flex items-center mb-6">
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaChartLine className="text-navy text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-secondary">
                  Direct Fund Application
                </h2>
              </div>
              <p className="text-gray-300 mb-6">
                The fund application is for direct admission into Paragon's
                investment research groups, where you will engage in hands-on
                research of companies or algorithms that are either invested in
                or deployed by the investment funds.
              </p>
              <p className="text-gray-300 mb-6">
                Applicants may choose to apply directly to the PGI Value Fund or
                Systematic Fund. Additional information is available on the
                application form.
              </p>
              <p className="text-secondary font-medium mb-6">
                This opportunity is exclusively available to second-year
                students.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Links Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Interest Form */}
            <motion.div
              className="bg-navy-light p-8 rounded-lg border border-gray-700 flex flex-col"
              variants={cardItem}
            >
              <div className="flex items-center mb-6">
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaClipboardList className="text-navy text-xl" />
                </div>
                <h3 className="text-xl font-bold">Interest Form</h3>
              </div>
              <p className="text-gray-300 mb-6 flex-grow">
                Fill out this form to be notified of updates and events.
              </p>
              <motion.a
                href="#"
                className="block w-full bg-secondary text-navy text-center py-3 px-6 rounded-md font-semibold"
                whileHover="hover"
                variants={buttonVariant}
              >
                Interest Form
              </motion.a>
            </motion.div>

            {/* Application Form */}
            <motion.div
              className="bg-navy-light p-8 rounded-lg border border-gray-700 flex flex-col"
              variants={cardItem}
            >
              <div className="flex items-center mb-6">
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaRegClock className="text-navy text-xl" />
                </div>
                <h3 className="text-xl font-bold">Application Form</h3>
              </div>
              <p className="text-gray-300 mb-6 flex-grow">
                Application will close on 1/17/2025 at 11:59 PM ET.
              </p>
              <motion.a
                href="#"
                className="block w-full bg-secondary text-navy text-center py-3 px-6 rounded-md font-semibold"
                whileHover="hover"
                variants={buttonVariant}
              >
                Apply
              </motion.a>
            </motion.div>

            {/* Coffee Chat Signups */}
            <motion.div
              className="bg-navy-light p-8 rounded-lg border border-gray-700 flex flex-col"
              variants={cardItem}
            >
              <div className="flex items-center mb-6">
                <div className="bg-secondary p-3 rounded-full mr-4">
                  <FaCoffee className="text-navy text-xl" />
                </div>
                <h3 className="text-xl font-bold">Coffee Chat Signups</h3>
              </div>
              <p className="text-gray-300 mb-6 flex-grow">
                Coffee chats will take place between 1/11/2025 and 1/13/2025.
              </p>
              <motion.a
                href="#"
                className="block w-full bg-secondary text-navy text-center py-3 px-6 rounded-md font-semibold"
                whileHover="hover"
                variants={buttonVariant}
              >
                Coffee Chat Signups
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4 bg-navy-light">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Timeline and Important Dates
          </motion.h2>

          <div className="mb-8 text-center">
            <span className="inline-flex items-center bg-navy px-4 py-2 rounded-full">
              <FaCalendarAlt className="mr-2 text-secondary" />
              <span className="text-gray-300">Time Zone: America/New_York</span>
            </span>
          </div>

          <motion.div
            className="relative"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <div className="absolute left-1/2 -ml-0.5 w-0.5 h-full bg-gray-700"></div>

            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                className="relative mb-8"
                variants={cardItem}
              >
                <div
                  className={`flex items-center ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-full md:w-1/2 ${
                      index % 2 === 0
                        ? "md:pr-12 text-right"
                        : "md:pl-12 text-left"
                    }`}
                  >
                    <div className="bg-navy p-6 rounded-lg border border-gray-700">
                      <h3 className="text-xl font-bold mb-2 text-secondary">
                        {event.title}
                      </h3>
                      <p className="text-gray-400">{event.date}</p>
                      <p className="text-gray-300">{event.time}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 -ml-3 w-6 h-6 rounded-full bg-secondary border-4 border-navy"></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recruitment Team Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Recruitment Team
          </motion.h2>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {recruitmentTeam.map((member, index) => (
              <motion.div
                key={index}
                variants={cardItem}
                className="bg-navy-light p-6 rounded-lg border border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-2">{member.name}</h3>
                <p className="text-secondary text-sm mb-1">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.university}</p>
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

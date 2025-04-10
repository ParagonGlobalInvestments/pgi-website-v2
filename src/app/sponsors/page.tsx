"use client";

import Image from "next/image";
import { motion } from "framer-motion";

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
  // Sample sponsors data
  const sponsors = [
    {
      id: 1,
      name: "Investment Bank Alpha",
      tier: "Platinum",
      logo: "/images/pgiLogoTransparent.png", // Placeholder - replace with actual sponsor logo
      description:
        "A leading global investment bank providing comprehensive financial services to corporations, governments, and institutions worldwide.",
    },
    {
      id: 2,
      name: "Beta Asset Management",
      tier: "Gold",
      logo: "/images/pgiLogoTransparent.png", // Placeholder - replace with actual sponsor logo
      description:
        "One of the world's largest asset managers specializing in equities, fixed income, alternatives, and multi-asset strategies.",
    },
    {
      id: 3,
      name: "Gamma Hedge Fund",
      tier: "Gold",
      logo: "/images/pgiLogoTransparent.png", // Placeholder - replace with actual sponsor logo
      description:
        "A premier hedge fund firm with a diverse range of investment strategies across global markets.",
    },
    {
      id: 4,
      name: "Delta Financial Solutions",
      tier: "Silver",
      logo: "/images/pgiLogoTransparent.png", // Placeholder - replace with actual sponsor logo
      description:
        "A technology-driven financial services company offering innovative solutions for trading and investment management.",
    },
    {
      id: 5,
      name: "Epsilon Ventures",
      tier: "Silver",
      logo: "/images/pgiLogoTransparent.png", // Placeholder - replace with actual sponsor logo
      description:
        "A venture capital firm focusing on early-stage fintech and financial services companies with disruptive potential.",
    },
    {
      id: 6,
      name: "Zeta Consulting Group",
      tier: "Bronze",
      logo: "/images/pgiLogoTransparent.png", // Placeholder - replace with actual sponsor logo
      description:
        "A global management consulting firm specializing in financial services strategy and operations.",
    },
  ];

  // Group sponsors by tier
  const platinumSponsors = sponsors.filter((s) => s.tier === "Platinum");
  const goldSponsors = sponsors.filter((s) => s.tier === "Gold");
  const silverSponsors = sponsors.filter((s) => s.tier === "Silver");
  const bronzeSponsors = sponsors.filter((s) => s.tier === "Bronze");

  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-16 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Our Sponsors
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto mb-16"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="text-lg text-center">
            Paragon Global Investments is proud to be supported by leading
            financial institutions and companies that share our commitment to
            excellence in financial education and innovation. Our sponsors
            provide not only financial support but also invaluable mentorship,
            resources, and career opportunities for our students.
          </p>
        </motion.div>

        {/* Platinum Sponsors */}
        {platinumSponsors.length > 0 && (
          <motion.div
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h2
              className="text-2xl font-bold mb-8 text-center text-secondary"
              variants={fadeIn}
            >
              Platinum Sponsors
            </motion.h2>
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {platinumSponsors.map((sponsor) => (
                <motion.div
                  key={sponsor.id}
                  className="bg-navy-light p-8 rounded-lg border border-gray-700 flex flex-col md:flex-row items-center"
                  variants={sponsorAnimation}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-4 mb-6 md:mb-0 md:mr-8">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={150}
                      height={150}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {sponsor.name}
                    </h3>
                    <p>{sponsor.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Gold Sponsors */}
        {goldSponsors.length > 0 && (
          <motion.div
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h2
              className="text-2xl font-bold mb-8 text-center text-secondary"
              variants={fadeIn}
            >
              Gold Sponsors
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {goldSponsors.map((sponsor) => (
                <motion.div
                  key={sponsor.id}
                  className="bg-navy-light p-6 rounded-lg border border-gray-700"
                  variants={cardAnimation}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-4 mx-auto mb-4">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={100}
                      height={100}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">
                    {sponsor.name}
                  </h3>
                  <p className="text-sm text-center">{sponsor.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Silver Sponsors */}
        {silverSponsors.length > 0 && (
          <motion.div
            className="mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h2
              className="text-2xl font-bold mb-8 text-center text-secondary"
              variants={fadeIn}
            >
              Silver Sponsors
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {silverSponsors.map((sponsor) => (
                <motion.div
                  key={sponsor.id}
                  className="bg-navy-light p-6 rounded-lg border border-gray-700"
                  variants={cardAnimation}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-3 mx-auto mb-4">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">
                    {sponsor.name}
                  </h3>
                  <p className="text-sm text-center">{sponsor.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bronze Sponsors */}
        {bronzeSponsors.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h2
              className="text-2xl font-bold mb-8 text-center text-secondary"
              variants={fadeIn}
            >
              Bronze Sponsors
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {bronzeSponsors.map((sponsor) => (
                <motion.div
                  key={sponsor.id}
                  className="bg-navy-light p-4 rounded-lg border border-gray-700"
                  variants={cardAnimation}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2 mx-auto mb-3">
                    <Image
                      src={sponsor.logo}
                      alt={sponsor.name}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="text-base font-semibold mb-1 text-center">
                    {sponsor.name}
                  </h3>
                  <p className="text-xs text-center">{sponsor.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="max-w-4xl mx-auto mt-20 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-4">Become a Sponsor</h3>
          <p className="mb-6">
            Interested in supporting the next generation of finance
            professionals? Partner with Paragon Global Investments to connect
            with talented students from top universities and showcase your
            organization's commitment to excellence in financial education.
          </p>
          <motion.a
            href="#"
            className="inline-block px-6 py-3 bg-white text-navy font-bold rounded hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sponsorship Opportunities
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}

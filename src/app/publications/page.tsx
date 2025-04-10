"use client";

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

export default function Publications() {
  // Sample publications data
  const publications = [
    {
      id: 1,
      title: "Value Investing in a Digital Economy",
      authors: "Paragon Research Team",
      date: "June 2023",
      abstract:
        "This paper examines how traditional value investing principles can be applied to technology companies in today's digital economy. It explores valuation metrics beyond P/E ratios that are better suited for high-growth tech companies.",
      link: "#",
    },
    {
      id: 2,
      title: "Machine Learning Applications in Portfolio Management",
      authors: "Quantitative Analysis Division",
      date: "March 2023",
      abstract:
        "A comprehensive study on how machine learning algorithms can enhance portfolio construction, risk management, and alpha generation in modern investment strategies.",
      link: "#",
    },
    {
      id: 3,
      title: "ESG Integration in Fundamental Analysis",
      authors: "Sustainability Research Group",
      date: "December 2022",
      abstract:
        "This research explores how environmental, social, and governance factors can be effectively integrated into fundamental company analysis to identify both risks and opportunities.",
      link: "#",
    },
    {
      id: 4,
      title: "Behavioral Biases in Investment Decision Making",
      authors: "Behavioral Finance Team",
      date: "October 2022",
      abstract:
        "An examination of common cognitive biases that affect investment decisions and strategies to mitigate their impact on portfolio performance.",
      link: "#",
    },
    {
      id: 5,
      title: "Algorithmic Trading: Backtesting Methodologies",
      authors: "Quantitative Strategy Team",
      date: "July 2022",
      abstract:
        "A detailed exploration of robust backtesting methodologies for algorithmic trading strategies, including approaches to minimize overfitting and selection bias.",
      link: "#",
    },
  ];

  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-16 px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Publications
        </motion.h1>

        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <p className="text-lg">
            At Paragon Global Investments, we are committed to advancing
            financial research and knowledge. Our student analysts and faculty
            advisors regularly publish research papers, market analyses, and
            investment insights. Below is a selection of our recent
            publications.
          </p>
        </motion.div>

        <motion.div
          className="max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {publications.map((pub) => (
            <motion.div
              key={pub.id}
              className="bg-navy-light p-6 rounded-lg mb-6 border border-gray-700 hover:border-secondary transition-colors"
              variants={cardAnimation}
            >
              <h2 className="text-2xl font-semibold mb-2 text-secondary">
                {pub.title}
              </h2>
              <p className="text-sm mb-4 text-gray-400">
                {pub.authors} | {pub.date}
              </p>
              <p className="mb-4">{pub.abstract}</p>
              <a
                href={pub.link}
                className="inline-block px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition-colors"
              >
                Read Full Paper
              </a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto mt-12 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-4">Access Our Research</h3>
          <p className="mb-6">
            For access to our complete research repository, including
            proprietary reports and analyses, please contact our research
            department or become a member of Paragon Global Investments.
          </p>
          <motion.a
            href="#"
            className="inline-block px-6 py-3 bg-white text-navy font-bold rounded hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Request Access
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}

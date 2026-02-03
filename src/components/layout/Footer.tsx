'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Animation variants
const footerAnimation = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const staggerColumns = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const columnAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const logoAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Navigation structure matching the site's hierarchy
  const footerNavigation = [
    {
      title: 'About',
      links: [
        { name: 'Who We Are', url: '/who-we-are' },
        { name: 'Investment Strategy', url: '/investment-strategy' },
        { name: 'Sponsors & Partners', url: '/sponsors' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Placements', url: '/placements' },
        { name: 'Apply', url: '/apply' },
        { name: 'Contact', url: '/contact' },
      ],
    },
    {
      title: 'National Committee',
      links: [
        { name: 'Officers', url: '/national-committee/officers' },
        { name: 'Founders', url: '/national-committee/founders' },
      ],
    },
    {
      title: 'Members',
      links: [
        { name: 'Value Team', url: '/members/value-team' },
        { name: 'Quant Team', url: '/members/quant-team' },
      ],
    },
  ];

  return (
    <motion.footer
      className="bg-pgi-dark-blue text-white border-t border-pgi-light-blue"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerAnimation}
    >
      <div className="container mx-auto py-4 lg:py-8 px-4">
        {/* Top section with logo and columns */}
        <div className="flex flex-wrap lg:flex-nowrap gap-8">
          {/* Logo and info column */}
          <motion.div
            className="w-full lg:w-1/3 lg:pr-8"
            variants={logoAnimation}
          >
            <div className="flex flex-row items-center mb-4 justify-between lg:justify-start">
              <Link href="/" className="inline-block ">
                <Image
                  src="/logos/pgiLogoTransparent.png"
                  alt="Paragon Global Investments"
                  width={200}
                  height={36}
                  className="h-9 w-auto rounded-lg"
                />
              </Link>
              <motion.div
                className="flex space-x-4 lg:ml-4"
                variants={logoAnimation}
              >
                <a
                  href="https://www.linkedin.com/company/paragoninvestments/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/paragoninvestmentsglobal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </motion.div>
            </div>
            <motion.p
              className="text-gray-300 text-xs mb-4"
              variants={logoAnimation}
            >
              PGI is a registered 501(c)(3) nonprofit. <br />
              Previously known as Paragon National Group (PNG).
            </motion.p>
          </motion.div>

          {/* Navigation columns wrapper */}
          <motion.div
            className="w-full lg:w-2/3 flex flex-wrap gap-y-6"
            variants={staggerColumns}
          >
            {/* Navigation columns */}
            {footerNavigation.map((section, index) => (
              <motion.div
                key={index}
                className="w-1/2 sm:w-1/4 pr-4"
                variants={columnAnimation}
              >
                <h3 className="text-sm lg:text-md font-semibold mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-1.5">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.url}
                        className="text-gray-300 hover:text-white transition-colors text-xs lg:text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="text-center mt-8 text-xs text-gray-400"
          variants={logoAnimation}
          transition={{ delay: 0.4 }}
        >
          <p>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Paragon Global Investments
            </Link>{' '}
            | {currentYear} |{' '}
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors "
            >
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;

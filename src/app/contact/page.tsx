'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
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

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const buttonHover = {
  scale: 1.05,
  backgroundColor: '#1f4287',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
  transition: {
    duration: 0.2,
    ease: 'easeInOut',
  },
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  school?: string;
  graduationYear?: string;
  isChapterRequest: boolean;
};

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [isChapterRequest, setIsChapterRequest] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Add form submission logic here
    console.log(data);

    // For now, just simulate a successful submission
    setSubmitted(true);
    reset();

    // Reset form after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="bg-navy text-white min-h-screen">
      <div className="container mx-auto py-16 md:py-24 lg:py-32 px-4">
        {/* Page header */}
        <motion.section
          className="text-center mb-16 md:mb-20 lg:mb-24"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
            <ShinyText
              text="Let's Get in Touch"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            We would love to hear from you. If you&apos;re interested or have
            any questions, send us a message through the form below.
          </p>
        </motion.section>

        <div className="max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Left column - Contact form */}
            <motion.div
              variants={cardItem}
              className="bg-darkNavy p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Form type selector */}
              <div className="mb-6">
                <div className="flex space-x-4">
                  <motion.button
                    className={`px-4 py-2 rounded-md transition-colors text-sm md:text-base font-medium ${
                      !isChapterRequest
                        ? 'bg-pgi-light-blue text-white'
                        : 'bg-gray-700/10 text-gray-500 hover:bg-gray-600 hover:text-white'
                    }`}
                    onClick={() => setIsChapterRequest(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Contact Us
                  </motion.button>
                  <motion.button
                    className={`px-4 py-2 rounded-md transition-colors text-sm md:text-base font-medium ${
                      isChapterRequest
                        ? 'bg-pgi-light-blue text-white'
                        : 'bg-gray-700/10 text-gray-500 hover:bg-gray-600 hover:text-white'
                    }`}
                    onClick={() => setIsChapterRequest(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start a Chapter
                  </motion.button>
                </div>
              </div>

              {/* Form success message */}
              {submitted && (
                <motion.div
                  className="mb-6 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-md"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-green-400 text-sm md:text-base">
                    Thank you for your message! We&apos;ll get back to you soon.
                  </p>
                </motion.div>
              )}

              {/* Contact form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4 md:space-y-6">
                  {/* Name field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pgi-light-blue focus:border-transparent text-white text-sm md:text-base transition-colors"
                      placeholder="Your name"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pgi-light-blue focus:border-transparent text-white text-sm md:text-base transition-colors"
                      placeholder="Your email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pgi-light-blue focus:border-transparent text-white text-sm md:text-base transition-colors"
                      placeholder="Your phone number"
                      {...register('phone')}
                    />
                  </div>

                  {/* Chapter-specific fields */}
                  {isChapterRequest && (
                    <>
                      <div>
                        <label
                          htmlFor="school"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          School
                        </label>
                        <input
                          id="school"
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pgi-light-blue focus:border-transparent text-white text-sm md:text-base transition-colors"
                          placeholder="Your school name"
                          {...register('school', {
                            required: isChapterRequest
                              ? 'School name is required'
                              : false,
                          })}
                        />
                        {errors.school && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.school.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="graduationYear"
                          className="block text-sm font-medium text-gray-300 mb-2"
                        >
                          Graduation Year
                        </label>
                        <input
                          id="graduationYear"
                          type="text"
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pgi-light-blue focus:border-transparent text-white text-sm md:text-base transition-colors"
                          placeholder="Expected graduation year"
                          {...register('graduationYear', {
                            required: isChapterRequest
                              ? 'Graduation year is required'
                              : false,
                          })}
                        />
                        {errors.graduationYear && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.graduationYear.message}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Message field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pgi-light-blue focus:border-transparent text-white text-sm md:text-base transition-colors resize-none"
                      placeholder={
                        isChapterRequest
                          ? 'Tell us about your interest in starting a chapter'
                          : 'Your message'
                      }
                      {...register('message', {
                        required: 'Message is required',
                      })}
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <div>
                    <motion.button
                      type="submit"
                      className="w-full px-6 py-3 md:py-4 bg-pgi-light-blue text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pgi-light-blue text-sm md:text-base"
                      whileHover={buttonHover}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isChapterRequest
                        ? 'Submit Chapter Request'
                        : 'Send Message'}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Right column - Contact info */}
            <div className="space-y-6 md:space-y-8">
              {/* Chapter info card */}
              <motion.div
                variants={cardItem}
                className="bg-darkNavy p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white mb-4 md:mb-6">
                  <DecryptedText
                    text="Start a Chapter"
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    speed={50}
                    useOriginalCharsOnly={true}
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                  />
                </h2>
                <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-base font-light leading-relaxed">
                  If you&apos;re interested in starting a Paragon chapter at
                  your school, please fill out the form with your school,
                  graduation year, and contact info and we will get back to you!
                </p>
                <motion.button
                  onClick={() => setIsChapterRequest(true)}
                  className="px-6 py-3 bg-pgi-light-blue text-white font-medium rounded-md transition-colors text-sm md:text-base"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.98 }}
                >
                  Start a Chapter
                </motion.button>
              </motion.div>

              {/* Contact info card */}
              <motion.div
                variants={cardItem}
                className="bg-darkNavy p-6 md:p-8 rounded-lg shadow-xl border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white mb-4 md:mb-6">
                  <DecryptedText
                    text="Other Contacts"
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    speed={50}
                    useOriginalCharsOnly={true}
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                  />
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                      Connect with us:
                    </p>
                    <div className="flex space-x-4">
                      <motion.a
                        href="https://www.linkedin.com/company/paragoninvestments"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-gray-300 hover:text-pgi-light-blue transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          className="w-6 h-6 md:w-8 md:h-8"
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
                      </motion.a>
                      <motion.a
                        href="https://www.instagram.com/paragoninvestmentsglobal/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-gray-300 hover:text-pgi-light-blue transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg
                          className="w-6 h-6 md:w-8 md:h-8"
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
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

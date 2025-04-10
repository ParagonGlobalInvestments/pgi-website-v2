"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import AnimatedSection from "@/components/ui/AnimatedSection";
import AnimatedText from "@/components/ui/AnimatedText";

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
    <div className="bg-navy min-h-screen">
      <div className="container mx-auto py-36 px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <AnimatedSection className="text-center mb-16">
          <AnimatedText
            text="Let's Get in Touch"
            className="text-4xl font-bold text-white mb-4"
            type="words"
          />
          <AnimatedText
            text="We would love to hear from you. If you're interested or have any questions, send us a message through the form below."
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            type="full"
            delay={0.3}
          />
        </AnimatedSection>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left column - Contact form */}
            <AnimatedSection
              delay={0.4}
              direction="left"
              className="bg-navy-light p-8 rounded-lg shadow-xl border border-gray-700"
            >
              {/* Form type selector */}
              <div className="mb-6">
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md transition-colors ${
                      !isChapterRequest
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setIsChapterRequest(false)}
                  >
                    Contact Us
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md transition-colors ${
                      isChapterRequest
                        ? "bg-primary text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => setIsChapterRequest(true)}
                  >
                    Start a Chapter
                  </button>
                </div>
              </div>

              {/* Form success message */}
              {submitted && (
                <div className="mb-6 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-md">
                  <p className="text-green-400">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              )}

              {/* Contact form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      placeholder="Your name"
                      {...register("name", { required: "Name is required" })}
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
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      placeholder="Your email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
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
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      placeholder="Your phone number"
                      {...register("phone")}
                    />
                  </div>

                  {/* Chapter-specific fields */}
                  {isChapterRequest && (
                    <>
                      <div>
                        <label
                          htmlFor="school"
                          className="block text-sm font-medium text-gray-300 mb-1"
                        >
                          School
                        </label>
                        <input
                          id="school"
                          type="text"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
                          placeholder="Your school name"
                          {...register("school", {
                            required: isChapterRequest
                              ? "School name is required"
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
                          className="block text-sm font-medium text-gray-300 mb-1"
                        >
                          Graduation Year
                        </label>
                        <input
                          id="graduationYear"
                          type="text"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
                          placeholder="Expected graduation year"
                          {...register("graduationYear", {
                            required: isChapterRequest
                              ? "Graduation year is required"
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
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-white"
                      placeholder={
                        isChapterRequest
                          ? "Tell us about your interest in starting a chapter"
                          : "Your message"
                      }
                      {...register("message", {
                        required: "Message is required",
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
                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      {isChapterRequest
                        ? "Submit Chapter Request"
                        : "Send Message"}
                    </button>
                  </div>
                </div>
              </form>
            </AnimatedSection>

            {/* Right column - Contact info */}
            <div>
              {/* Chapter info card */}
              <AnimatedSection
                delay={0.5}
                direction="right"
                className="bg-navy-light p-8 rounded-lg shadow-xl mb-8 border border-gray-700"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Start a Chapter
                </h2>
                <p className="text-gray-300 mb-6">
                  If you're interested in starting a Paragon chapter at your
                  school, please fill out the form with your school, graduation
                  year, and contact info and we will get back to you!
                </p>
                <button
                  onClick={() => setIsChapterRequest(true)}
                  className="px-6 py-2 bg-secondary text-white font-medium rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Start a Chapter
                </button>
              </AnimatedSection>

              {/* Contact info card */}
              <AnimatedSection
                delay={0.6}
                direction="right"
                className="bg-navy-light p-8 rounded-lg shadow-xl border border-gray-700"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Other Contacts
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-300 mb-1">Email:</p>
                    <a
                      href="mailto:paragonnational@gmail.com"
                      className="text-primary hover:text-secondary transition-colors"
                    >
                      paragonnational@gmail.com
                    </a>
                  </div>

                  <div>
                    <p className="text-gray-300 mb-2">Connect with us:</p>
                    <div className="flex space-x-4">
                      <a
                        href="https://www.linkedin.com/company/paragon-global-investments"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
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
                        href="https://www.instagram.com/paragoninvestments"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        <svg
                          className="w-6 h-6"
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
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

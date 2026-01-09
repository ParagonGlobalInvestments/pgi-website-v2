'use client';

// import { useState } from 'react';
// import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FaUserGraduate,
  FaChartLine,
  // FaClipboardList,
} from 'react-icons/fa';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';

// import { useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';


const UCHICAGO_APPLY_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdTCznaIPg3wK127dm1LBplS2p34oLpIHJ-vPURjB54U8ap_g/viewform?usp=sharing&ouid=115014572515447649486'; // replace with real URL when ready
const applicationsOpen = true;  // set to true when applications open

const ZOOM_LINK_URL = 'https://uchicago.zoom.us/j/97041198738?pwd=yc3JxnOrFBcCEO2OLbe2ro24YprLr6.1';
const GENERAL_APPLY_URL = '';
const generalApplicationsOpen = false;


/** Animation variants (unchanged) */
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const baseBtn =
  'inline-flex flex-col items-center justify-center px-6 py-3 rounded-lg font-semibold shadow-lg text-center min-h-[64px] md:min-h-[64px]';

const timelineItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// ---- Add near the top (below imports) ----
type TeamMember = {
    name: string;
    role: string;
    university: string;
    linkedin?: string; // <-- add this
};
  
  
const nationalRecruitmentTeam: TeamMember[] = [
    {
      name: 'Aetant Prakash',
      role: 'Head of Recruitment',
      university: 'University of Chicago',
    },
    {
      name: 'Heath Winter',
      role: 'Recruiter',
      university: 'University of Chicago',
    },
    {
      name: 'Noor Kaur',
      role: 'Recruiter',
      university: 'University of Chicago',
    },
    {
      name: 'Krish Khanna',
      role: 'Recruiter',
      university: 'University of Chicago',
    },
];

export const uchicagoRecruitmentTeam: TeamMember[] = [
    {
      name: 'Nicolas Tchkotoua',
      role: 'Recruiter',
      university: 'University of Chicago',
      linkedin: 'https://www.linkedin.com/in/ntchkotoua/',
    },
    {
        name: 'Heath Winter',
        role: 'Recruiter',
        university: 'University of Chicago',
        linkedin: 'https://www.linkedin.com/in/heath-winter/',
    },
    {
      name: 'Noor Kaur',
      role: 'Recruiter',
      university: 'University of Chicago',
      linkedin: 'https://www.linkedin.com/in/noor-kaur-738867272/'
    },
    {
      name: 'Glen Cahilly',
      role: 'Recruiter',
      university: 'University of Chicago',
      linkedin: 'https://www.linkedin.com/in/glen-cahilly/'
    },
    {
      name: 'Ishaan Sareen',
      role: 'Recruiter',
      university: 'University of Chicago',
      linkedin: 'https://www.linkedin.com/in/ishaansareen/'
    },
    {
      name: 'Lars Barth',
      role: 'Recruiter',
      university: 'University of Chicago',
      linkedin: 'https://www.linkedin.com/in/lars-barth/'
    },
];

// Reusable section
function RecruitmentTeamSection({
    members,
    title = 'Recruitment Team',
}: {
    members: TeamMember[];
    title?: string;
}) {
    return (
      <section className="py-20 md:py-28 lg:py-32 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-10 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <ShinyText
              text={title}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h2>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {members.map((m, i) => (
              <motion.div
                key={`${m.name}-${i}`}
                className="bg-darkNavy rounded-2xl p-6 border border-gray-700 hover:border-pgi-light-blue transition"
                variants={cardItem}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <div>
                    <p className="text-white font-semibold text-lg">{m.name}</p>
                    <p className="text-gray-300 text-sm mt-1">{m.role}</p>
                    <p className="text-gray-400 text-sm mt-2 italic">{m.university}</p>

                    {m.linkedin && (
                        <div className="mt-4">
                        <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open ${m.name}'s LinkedIn`}
                            className="inline-flex items-center gap-2 rounded-lg border border-pgi-light-blue/60 px-3 py-2 text-sm
                                    text-white hover:bg-pgi-light-blue hover:text-white transition shadow-md"
                        >
                            {/* If you already use react-icons, you can import FaLinkedin */}
                            {/* import { FaLinkedin } from 'react-icons/fa'; */}
                            {/* <FaLinkedin className="text-base" /> */}
                            <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            className="h-4 w-4"
                            aria-hidden="true"
                            focusable="false"
                            >
                            <path
                                fill="currentColor"
                                d="M100.28 448H7.4V148.9h92.88zm-46.44-340a53.79 53.79 0 1 1 53.79-53.79 53.79 53.79 0 0 1-53.79 53.8zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.27-79.2-48.3 0-55.7 37.7-55.7 76.6V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.6 42.7-48.5 87.8-48.5 94 0 111.3 61.9 111.3 142.3V448z"
                            />
                            </svg>
                            LinkedIn
                        </a>
                        </div>
                    )}
                    </div>         
              </motion.div>
            ))}
          </div>
  
          {/* Contact CTA */}
          <motion.div
            className="text-center mt-16 md:mt-20 lg:mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <p className="text-gray-300 mb-6 text-base md:text-lg font-light">
              Have questions? Don&apos;t hesitate to reach out!
            </p>
            <motion.a
              href="/contact"
              className="inline-block bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide shadow-lg"
              whileHover={{
                scale: 1.05,
                backgroundColor: '#1f4287',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.a>
          </motion.div>
        </div>
      </section>
    );
  }
  

/** --------------------------
 *  National Timeline Content
 *  -------------------------- */
const generalTimeline = [
  { date: 'Monday 12th', detail: 'Applications open' },
  { date: 'Mon 12th – Fri 16th', detail: 'Coffee chats' },
  {
    date: 'Wednesday 14th',
    detail: '1st info session · 7PM ET',
    link: 'https://uchicago.zoom.us/meetings/93724594264/invitations?signature=HIwjcPthsxZIX0IoQa2mVVVqNtpNgNb5ZXj-QWwWplc',
    linkLabel: 'Zoom link',
  },
  {
    date: 'Friday 16th',
    detail: '2nd info session · 5PM ET',
    link: 'https://uchicago.zoom.us/meetings/97029407547/invitations?signature=N03Z6ZbwFqah1Weq3-kpou---nFrWjNQc-I1WyJxoes',
    linkLabel: 'Zoom link',
  },
  { date: 'Monday 19th', detail: 'Applications close · 11:59 PM' },
  { date: 'Early February', detail: 'Decisions released' },
];

/** --------------------------
 *  UChicago Timeline Content
 *  -------------------------- */
const uchicagoTimeline = [
  { date: 'Fri (10/3)', detail: 'Applications Open' },
  { date: 'Fri (10/3)', detail: 'Engagement Expo @ 3PM — Main Quad' },
  { date: 'Sat (10/4) – Mon (10/6)', detail: 'Scheduled Coffee Chats' },
  { date: 'Tues (10/7)', detail: 'Info Session I @ 6PM — Stuart 104' },
  { date: 'Wed (10/8)', detail: 'Info Session II @ Zoom' },
  { date: 'Fri (10/10)', detail: 'Applications Close' },
  { date: 'Wed (10/15)', detail: 'First Round of Interviews Begin' },
];

function GeneralRecruitment() {
  return (
    <>
      {/* Hero Section */}
      <section className="pt-10 md:pt-16 lg:pt-20 pb-12 md:pb-16 px-4 bg-navy">
        <div className="container mx-auto">
          <motion.div className="text-center" initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
              <ShinyText
                text="PGI 2026 National Recruitment"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Join Paragon Global Investments and be part of a community dedicated to excellence in finance and investing.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              {generalApplicationsOpen ? (
                <motion.a
                  href={GENERAL_APPLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${baseBtn} bg-white text-navy border border-white shadow-lg hover:brightness-110 transition`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Apply Now — National
                </motion.a>
              ) : (
                <button
                  disabled
                  title="Applications opening soon"
                  className={`${baseBtn} bg-white text-navy opacity-40 cursor-not-allowed select-none border border-white`}
                >
                  Apply (Coming 1/12)
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Application Options */}
      <section className="pt-10 md:pt-12 pb-16 md:pb-20 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Education Application */}
            <motion.div
              className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
              initial="hidden"
              animate="visible"
              variants={cardItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <FaUserGraduate className="text-navy text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white">
                  <DecryptedText
                    text="Education Application"
                    sequential
                    revealDirection="start"
                    animateOn="view"
                    speed={50}
                    useOriginalCharsOnly
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                  />
                </h2>
              </div>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                The education application is for admittance to the education portion of Paragon. The education is a 6-week
                curriculum that covers both fundamental investing and quantitative finance.
              </p>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                Upon successful completion of the program, students will have the opportunity to join their preferred
                investment fund. For further details, please refer to the education application below.
              </p>
              <p className="text-white font-medium mb-6 text-sm md:text-base">This opportunity is exclusively available to first-year students.</p>
            </motion.div>

            {/* Direct Fund Application */}
            <motion.div
              className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
              initial="hidden"
              animate="visible"
              variants={cardItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <FaChartLine className="text-navy text-xl" />
                </div>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white">
                  <DecryptedText
                    text="Direct Fund Application"
                    sequential
                    revealDirection="start"
                    animateOn="view"
                    speed={50}
                    useOriginalCharsOnly
                    className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
                  />
                </h2>
              </div>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                The fund application is for direct admission into Paragon&apos;s investment research groups, where you will
                engage in hands-on research of companies or algorithms that are either invested in or deployed by the
                investment funds.
              </p>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                Applicants may choose to apply directly to the PGI Value Fund or Systematic Fund. Additional information is
                available on the application form.
              </p>
              <p className="text-white font-medium mb-6 text-sm md:text-base">This opportunity is exclusively available to second-year students.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* National Recruitment Timeline */}
      <section className="pt-10 md:pt-12 pb-16 md:pb-20 px-4 bg-navy">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-14"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-gray-400/80 mb-3">
              Key Dates
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-white">
              <ShinyText
                text="National Recruitment Timeline"
                className="text-xl md:text-2xl lg:text-3xl font-normal"
              />
            </h2>
            <p className="text-sm md:text-base text-gray-400 mt-4 max-w-2xl mx-auto font-light">
              A bird&apos;s-eye view of the general recruitment cycle, modeled
              after our origin story timeline.
            </p>
          </motion.div>

          <motion.div
            className="relative max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="absolute left-7 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-pgi-light-blue via-white/20 to-transparent md:-translate-x-px" />

            {generalTimeline.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={`${item.date}-${index}`}
                  className="relative mb-10 md:mb-14 flex flex-col md:flex-row"
                  variants={timelineItemVariants}
                >
                  <div
                    className={`w-full md:w-1/2 ${isLeft ? 'md:pr-10 lg:pr-16' : 'md:pl-10 lg:pl-16 md:ml-auto'}`}
                  >
                    <div className="bg-darkNavy/90 border border-white/10 rounded-2xl p-5 md:p-6 shadow-2xl transition-all duration-300 hover:border-pgi-light-blue/70 hover:shadow-pgi-light-blue/30">
                      <div className="flex items-center text-xs uppercase tracking-[0.4em] text-gray-400 gap-3">
                        <span className="flex items-center gap-2 text-blue-200 tracking-[0.2em]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4"
                            aria-hidden="true"
                          >
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
                          </svg>
                          Phase {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="h-px w-8 bg-white/30" aria-hidden="true" />
                        <span>{item.date}</span>
                      </div>

                      <p className="text-lg md:text-xl text-white font-semibold mt-4">
                        {item.detail}
                      </p>

                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-white/90 bg-gradient-to-r from-pgi-light-blue/30 to-cyan-400/20 border border-pgi-light-blue/40 rounded-lg px-4 py-2 mt-4 hover:from-pgi-light-blue/40 hover:to-cyan-400/30 transition"
                        >
                          {item.linkLabel || 'Join Session'}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M7 17 17 7" />
                            <path d="m7 7h10v10" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="absolute left-7 md:left-1/2 top-6 w-4 h-4 md:w-5 md:h-5 rounded-full bg-pgi-light-blue shadow-[0_0_15px_rgba(56,189,248,0.8)] border-4 border-navy transform -translate-x-1/2">
                    <span className="absolute inset-0 rounded-full bg-pgi-light-blue/60 animate-ping" />
                  </div>

                  <div
                    className={`hidden md:block absolute top-9 w-12 h-px bg-gradient-to-r ${
                      isLeft ? 'right-1/2 from-transparent to-pgi-light-blue/60' : 'left-1/2 from-pgi-light-blue/60 to-transparent'
                    }`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Interest Form */}
      {/* <section className="py-20 px-4 bg-navy">
        <div className="container mx-auto max-w-4xl">
          <motion.div className="flex justify-center" variants={staggerContainer} initial="hidden" animate="visible">
            <motion.div
              className="bg-darkNavy p-8 md:p-10 rounded-xl border border-gray-700 hover:border-pgi-light-blue transition-all duration-300 flex flex-col w-full max-w-lg shadow-xl"
              variants={cardItem}
              whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.3 } }}
            >
              <div className="flex items-center mb-8">
                <div className="bg-pgi-light-blue p-4 rounded-full mr-6">
                  <FaClipboardList className="text-navy text-2xl" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white">Interest Form</h3>
              </div>
              <p className="text-gray-300 mb-8 text-base md:text-lg font-light leading-relaxed">
                Fill out this form to be notified of updates, events, and important recruitment information.
              </p>
              {/* <motion.a
                href="https://docs.google.com/forms/d/e/1FAIpQLSe5Fz3UnIf9S_p5scoFVi5WUL4mhpGWLkG8RG21NXUSgx8-Zw/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-pgi-light-blue text-white text-center py-4 px-8 rounded-lg font-semibold text-base md:text-lg tracking-wide shadow-lg"
                whileHover="hover"
                variants={buttonVariant}
                onClick={() =>
                  handleFormClick({
                    formName: 'interest_form',
                    formType: 'google_form',
                    targetUrl:
                      'https://docs.google.com/forms/d/e/1FAIpQLSe5Fz3UnIf9S_p5scoFVi5WUL4mhpGWLkG8RG21NXUSgx8-Zw/viewform',
                    section: 'apply_page',
                    additionalData: { button_position: 'interest_form_card', page_section: 'application_links' },
                  })
                }
              >
                Submit Interest Form
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section> */}
    </>
  );
}

export function UChicagoRecruitment() {
  return (
    <>
      {/* Hero */}
      <section className="pt-10 md:pt-16 lg:pt-20 pb-10 md:pb-16 px-4 bg-navy">
        <div className="container mx-auto">
          <motion.div className="text-center" initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
              <ShinyText
                text="PGI @ UChicago — Fall 2025 Recruiting"
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              The UChicago-specific cycle is starting now. See the on-campus schedule, application window, and interview dates below.
            </p>

            {/* Buttons row: Zoom (left) + Apply (right) */}
            <div className="mt-8 flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            <motion.a
                href={ZOOM_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseBtn} bg-pgi-light-blue text-white shadow-lg hover:brightness-110 transition`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                >
                <span className="leading-tight">
                    <span className="text-sm md:text-base block">Information Session Zoom Link</span>
                    <span className="text-xs md:text-sm opacity-80 block">October 8th at 6 PM CT</span>
                </span>
            </motion.a>
            {applicationsOpen ? (
            <motion.a
                href={UCHICAGO_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${baseBtn} bg-white text-navy border border-white shadow-lg hover:brightness-110 transition`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                Apply Now — UChicago
            </motion.a>
            ) : (
            <button
                disabled
                title="Applications opening soon"
                className={`${baseBtn} bg-white text-navy opacity-40 cursor-not-allowed select-none border border-white`}
            >
                Apply (coming soon)
            </button>
            )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline only */}
      <section className="pt-6 md:pt-8 pb-8 md:pb-12 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="bg-darkNavy p-6 md:p-8 rounded-xl border border-gray-700 shadow-xl"
            variants={cardItem}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-white mb-6">
              <DecryptedText
                text="Fall 2025 UChicago Timeline"
                sequential
                revealDirection="start"
                animateOn="view"
                speed={50}
                useOriginalCharsOnly
                className="text-xl md:text-2xl lg:text-3xl font-medium text-white"
              />
            </h2>

            <ul className="space-y-4">
              {uchicagoTimeline.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="mt-1 mr-3 h-2.5 w-2.5 rounded-full bg-pgi-light-blue shrink-0" />
                  <div>
                    <p className="text-white font-medium">{item.date}</p>
                    <p className="text-gray-300">{item.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </>
  );
}

  
export function TabSwitch({
    value,
    onChange,
  }: {
    value: 'general' | 'uchicago';
    onChange: (v: 'general' | 'uchicago') => void;
  }) {
    const options: { key: 'general' | 'uchicago'; label: string }[] = [
      { key: 'general', label: 'General (National)' },
      { key: 'uchicago', label: 'UChicago' },
    ];
  
    return (
        <div className="sticky top-0 z-20 bg-pgi-dark-blue">
        <div className="container mx-auto px-4">
          <div
            role="tablist"
            aria-label="Recruitment tabs"
            className="mx-auto max-w-xl relative py-3"
          >
            <div className="flex rounded-xl border border-gray-700 bg-darkNavy/70 p-1">
              {options.map((opt) => {
                const isActive = value === opt.key;
                return (
                  <button
                    key={opt.key}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${opt.key}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => onChange(opt.key)}
                    className={`relative flex-1 px-4 py-2 text-sm md:text-base font-medium rounded-lg transition
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-pgi-light-blue
                      ${isActive ? 'text-white' : 'text-gray-200 hover:text-white'}`}
                  >
                    {/* Animated pill background */}
                    {isActive && (
                      <motion.span
                        layoutId="seg-pill"
                        className="absolute inset-0 rounded-lg bg-pgi-light-blue shadow-lg"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}
                    <span className="relative">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  

  export default function ApplyPage() {
    // const router = useRouter();
    // const search = useSearchParams();
    // const initial = (search.get('tab') as 'general' | 'uchicago') || 'general';
    // const [tab, setTab] = useState<'general' | 'uchicago'>(initial);
  
    /*
    useEffect(() => {
      const current = search.get('tab');
      if (current !== tab) {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        router.push(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);
    */
  
    return (
      <div className="bg-pgi-dark-blue text-white min-h-screen">
        {/* Minimal underline nav */}
        {/* <TabSwitch value={tab} onChange={setTab} /> */}
  
        {/* Tab Content */}
        {/* {tab === 'general' ? (
          <>
            <GeneralRecruitment />
            <RecruitmentTeamSection
              members={nationalRecruitmentTeam}
              title="National Recruitment Team"
            />
          </>
        ) : (
          <>
            <UChicagoRecruitment />
            <RecruitmentTeamSection
              members={uchicagoRecruitmentTeam}
              title="UChicago Recruitment Team"
            />
          </>
        )} */}

        {/* Temporarily limit to general recruitment while UChicago hiring is closed */}
        <GeneralRecruitment />
        <RecruitmentTeamSection
          members={nationalRecruitmentTeam}
          title="National Recruitment Team"
        />
      </div>
    );
  }
  

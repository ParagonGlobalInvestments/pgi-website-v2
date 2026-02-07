'use client';

import { motion } from 'framer-motion';
import { GraduationCap, TrendingUp } from 'lucide-react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import type { CmsPerson } from '@/lib/cms/types';

/** Animation variants */
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

const timelineItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

interface ApplyClientProps {
  recruitmentTeam: CmsPerson[];
  recruitmentConfig: Record<string, string>;
}

function RecruitmentTeamSection({
  members,
  title = 'Recruitment Team',
}: {
  members: CmsPerson[];
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
          {members.map(m => (
            <motion.div
              key={m.id}
              className="bg-darkNavy rounded-2xl p-6 border border-gray-700 hover:border-pgi-light-blue transition"
              variants={cardItem}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <div>
                <p className="text-white font-semibold text-lg">{m.name}</p>
                <p className="text-gray-300 text-sm mt-1">{m.title}</p>
                <p className="text-gray-400 text-sm mt-2 italic">{m.school}</p>

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

function GeneralRecruitment({ config }: { config: Record<string, string> }) {
  const applicationsOpen = config.applications_open === 'true';

  const timeline = [
    { date: config.app_open_date || 'TBD', detail: 'Applications open' },
    {
      date: config.zoom_session_1_time || 'TBD',
      detail: '1st info session',
      link: config.zoom_session_1_link || undefined,
      linkLabel: 'Zoom',
    },
    {
      date: config.zoom_session_2_time || 'TBD',
      detail: '2nd info session',
      link: config.zoom_session_2_link || undefined,
      linkLabel: 'Zoom',
    },
    { date: config.app_deadline || 'TBD', detail: 'Applications close' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="pt-10 md:pt-16 lg:pt-20 pb-12 md:pb-16 px-4 bg-navy">
        <div className="container mx-auto">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-6 md:mb-8 text-white">
              <ShinyText
                text={`PGI ${new Date().getFullYear()} National Recruitment`}
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
              />
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Join Paragon Global Investments and be part of a community
              dedicated to excellence in finance and investing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Application Options */}
      <section className="pt-10 md:pt-12 pb-16 md:pb-20 px-4 bg-pgi-dark-blue">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* Education Application */}
            <motion.div
              className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 flex flex-col"
              initial="hidden"
              animate="visible"
              variants={cardItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <GraduationCap className="text-navy text-xl" />
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
                The education application is for admittance to the education
                portion of Paragon. The education is a 6-week curriculum that
                covers both fundamental investing and quantitative finance.
              </p>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                Upon successful completion of the program, students will have
                the opportunity to join their preferred investment fund. For
                further details, please refer to the education application
                below.
              </p>
              <p className="text-white font-medium mb-6 text-sm md:text-base">
                This opportunity is exclusively available to{' '}
                {config.education_eligibility || 'first-year students'}.
              </p>
              <div className="mt-auto pt-2">
                {applicationsOpen && config.education_application_link ? (
                  <a
                    href={config.education_application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-pgi-light-blue text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base tracking-wide shadow-lg hover:bg-[#1f4287] transition-colors"
                  >
                    Apply Now
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    Applications are currently closed.
                  </p>
                )}
              </div>
            </motion.div>

            {/* Direct Fund Application */}
            <motion.div
              className="bg-darkNavy p-6 md:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 flex flex-col"
              initial="hidden"
              animate="visible"
              variants={cardItem}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex items-center mb-6">
                <div className="bg-pgi-light-blue p-3 rounded-full mr-4">
                  <TrendingUp className="text-navy text-xl" />
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
                The fund application is for direct admission into Paragon&apos;s
                investment research groups, where you will engage in hands-on
                research of companies or algorithms that are either invested in
                or deployed by the investment funds.
              </p>
              <p className="text-gray-300 mb-6 text-sm md:text-base font-light leading-relaxed">
                Applicants may choose to apply directly to the PGI Value Fund or
                Systematic Fund. Additional information is available on the
                application form.
              </p>
              <p className="text-white font-medium mb-6 text-sm md:text-base">
                This opportunity is exclusively available to{' '}
                {config.fund_eligibility || 'second-year students'}.
              </p>
              <div className="mt-auto pt-2">
                {applicationsOpen && config.fund_application_link ? (
                  <a
                    href={config.fund_application_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-pgi-light-blue text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base tracking-wide shadow-lg hover:bg-[#1f4287] transition-colors"
                  >
                    Apply Now
                  </a>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    Applications are currently closed.
                  </p>
                )}
              </div>
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

            {timeline.map((item, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={`${item.detail}-${index}`}
                  className="relative mb-10 md:mb-14 flex flex-col md:flex-row"
                  variants={timelineItemVariants}
                >
                  <div
                    className={`w-full md:w-1/2 pl-10 ${isLeft ? 'md:pr-10 lg:pr-16' : 'md:pl-10 lg:pl-16 md:ml-auto'}`}
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
                        <span
                          className="h-px w-8 bg-white/30"
                          aria-hidden="true"
                        />
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
                      isLeft
                        ? 'right-1/2 from-transparent to-pgi-light-blue/60'
                        : 'left-1/2 from-pgi-light-blue/60 to-transparent'
                    }`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default function ApplyClient({
  recruitmentTeam,
  recruitmentConfig,
}: ApplyClientProps) {
  return (
    <div className="bg-pgi-dark-blue text-white min-h-screen">
      <GeneralRecruitment config={recruitmentConfig} />
      <RecruitmentTeamSection
        members={recruitmentTeam}
        title="National Recruitment Team"
      />
    </div>
  );
}

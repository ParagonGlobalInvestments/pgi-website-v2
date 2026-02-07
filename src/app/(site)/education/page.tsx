'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import {
  fadeIn,
  staggerContainer,
  itemFadeIn,
  buttonHover,
} from '@/lib/animations';

const cardHover = {
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  borderColor: '#4a90e2',
  transition: {
    duration: 0.3,
    ease: 'easeInOut',
  },
};

const curricularItems = [
  {
    topic: 'Accounting',
    link: '/lectures/education/week1-accounting.pdf',
    week: 'Week 1',
    isExternal: false,
  },
  {
    topic: 'Valuation',
    link: '/lectures/education/week2-valuation.pdf',
    week: 'Week 2',
    isExternal: false,
  },
  {
    topic: 'Investment Theory',
    link: '/lectures/education/week3-investment-theory.pdf',
    week: 'Week 3',
    isExternal: false,
  },
  {
    topic: 'Quantitative Analysis with Python',
    link: 'https://colab.research.google.com/drive/15kROiqi1DpB5R8-aUUblX-_lURgjq20z',
    week: 'Week 4',
    isExternal: true,
  },
  {
    topic: 'Quantitative Portfolio Management',
    link: '/lectures/education/week5-quantitative-portfolio-management.pdf',
    week: 'Week 5',
    isExternal: false,
  },
  {
    topic: 'Algo Trading Strategy Design',
    link: '/lectures/education/week6-algorithmic-trading-and-backtesting.pdf',
    week: 'Week 6',
    isExternal: false,
  },
];

export default function Education() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Main Content Section */}
      <motion.section
        className="py-16 md:py-24 lg:py-32 px-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto">
          <motion.h1
            variants={fadeIn}
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
          >
            <ShinyText
              text="Education Curriculum"
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h1>

          <motion.div
            className="max-w-5xl mx-auto text-center"
            variants={staggerContainer}
          >
            <motion.p
              className="text-base md:text-lg lg:text-xl mb-12 md:mb-16 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Our comprehensive program equips students with the analytical
              skills and practical knowledge to excel in value investing and
              algorithmic trading. Through rigorous coursework and hands-on
              experience, students develop the expertise needed for careers in
              quantitative finance.
            </motion.p>
          </motion.div>

          {/* Curriculum Table */}
          <motion.div className="overflow-x-auto mb-16" variants={fadeIn}>
            <div className="bg-darkNavy border border-gray-700 rounded-xl max-w-4xl mx-auto overflow-hidden shadow-xl">
              <table className="min-w-full ">
                <thead>
                  <tr className="border-b border-gray-700 bg-pgi-light-blue">
                    <th className="px-6 py-4 text-left text-lg font-semibold text-white">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-white">
                      Materials
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm md:text-base">
                  {curricularItems.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-pgi-dark-blue transition-colors duration-300"
                    >
                      <td className="px-6 py-4 text-white">{item.topic}</td>
                      <td className="px-6 py-4">
                        {item.isExternal ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary whitespace-nowrap hover:text-white hover:scale-105 transition-all duration-100 bg-pgi-light-blue px-4 py-2 rounded-lg inline-block"
                          >
                            {item.week}
                          </a>
                        ) : (
                          <Link
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary whitespace-nowrap hover:text-white hover:scale-105 transition-all duration-100 bg-pgi-light-blue px-4 py-2 rounded-lg inline-block"
                          >
                            {item.week}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Education Tracks Section */}
          <motion.div className="mt-16 md:mt-24 lg:mt-32" variants={fadeIn}>
            <motion.h2
              variants={fadeIn}
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
            >
              <ShinyText
                text="Education Tracks"
                className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
              />
            </motion.h2>

            {/* Education Tracks Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
              variants={staggerContainer}
            >
              {/* Value Investing Track */}
              <motion.div
                className="p-6 md:p-8 lg:p-10 bg-darkNavy border border-gray-700 rounded-xl shadow-xl transition-all duration-300 hover:border-pgi-light-blue hover:shadow-2xl"
                variants={itemFadeIn}
                whileHover={cardHover}
              >
                <motion.h3
                  className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 text-white"
                  variants={itemFadeIn}
                >
                  <DecryptedText
                    text="Value Investing"
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    speed={40}
                    useOriginalCharsOnly={true}
                    className="text-xl md:text-2xl lg:text-3xl font-semibold text-white"
                  />
                </motion.h3>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6"
                  variants={itemFadeIn}
                >
                  The fundamental component of the curriculum helps students
                  gain a comprehensive understanding of value investing theory
                  and strategies. Students develop expertise in accounting
                  principles, competitive analysis, and sophisticated valuation
                  methodologies.
                </motion.p>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6"
                  variants={itemFadeIn}
                >
                  Advanced modeling techniques, including operating models and
                  discounted cash flow analysis, are explored alongside
                  investment theory and portfolio construction principles that
                  drive institutional decision-making.
                </motion.p>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-8"
                  variants={itemFadeIn}
                >
                  Upon completion, students possess the analytical frameworks to
                  accurately value complex business models and identify
                  mispriced securities across global markets.
                </motion.p>

                <motion.div
                  className="flex justify-center"
                  variants={itemFadeIn}
                >
                  <div className="bg-pgi-light-blue/50 border border-pgi-light-blue/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm md:text-base font-medium">
                      Fundamental Analysis
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Algorithmic Trading Track */}
              <motion.div
                className="p-6 md:p-8 lg:p-10 bg-darkNavy border border-gray-700 rounded-xl shadow-xl transition-all duration-300 hover:border-pgi-light-blue hover:shadow-2xl"
                variants={itemFadeIn}
                whileHover={cardHover}
              >
                <motion.h3
                  className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4 md:mb-6 text-white"
                  variants={itemFadeIn}
                >
                  <DecryptedText
                    text="Algorithmic Trading"
                    sequential={true}
                    revealDirection="start"
                    animateOn="view"
                    speed={40}
                    useOriginalCharsOnly={true}
                    className="text-xl md:text-2xl lg:text-3xl font-semibold text-white"
                  />
                </motion.h3>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6"
                  variants={itemFadeIn}
                >
                  The quantitative curriculum provides comprehensive training in
                  systematic trading strategy development. Students master
                  statistical analysis, machine learning applications, and
                  advanced Python programming for financial markets.
                </motion.p>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-6"
                  variants={itemFadeIn}
                >
                  Advanced topics include modern portfolio theory, factor
                  modeling, and risk management systems. Students learn to
                  construct systematic strategies that optimize risk-adjusted
                  returns through quantitative analysis.
                </motion.p>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-8"
                  variants={itemFadeIn}
                >
                  Graduates possess the technical expertise to design, backtest,
                  and implement institutional-grade algorithmic trading systems
                  using cutting-edge quantitative methodologies.
                </motion.p>

                <motion.div
                  className="flex justify-center"
                  variants={itemFadeIn}
                >
                  <div className="bg-pgi-light-blue/50 border border-pgi-light-blue/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm md:text-base font-medium">
                      Quantitative Analysis
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.8 }}
              className="text-center mt-12 md:mt-16 lg:mt-20"
            >
              <Link href="/apply">
                <motion.button
                  className="bg-pgi-light-blue text-white px-8 md:px-10 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg tracking-wide"
                  whileHover={buttonHover}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Your Education Journey
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

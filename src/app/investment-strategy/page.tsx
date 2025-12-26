'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';

// Animation variants from home page
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

const itemFadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
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

const cardHover = {
  scale: 1.02,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  borderColor: '#4a90e2',
  transition: {
    duration: 0.3,
    ease: 'easeInOut',
  },
};

export default function InvestmentStrategy() {
  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Hero Section */}
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
              text="Investment Funds"
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
            />
          </motion.h1>

          <motion.div
            className="max-w-5xl mx-auto text-center"
            variants={staggerContainer}
          >
            <motion.p
              className="text-base md:text-lg lg:text-xl mb-8 md:mb-12 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Thanks to the generous gifts of donors and sponsors, Paragon
              Global Investments deploys $60,000 into both the Paragon Value
              Fund and Paragon Systematic Fund. Members of Paragon Global
              Investments both develop pitches on mispriced assets and research
              and develop novel algorithmic trading strategies that will be
              invested out of their respective funds.
            </motion.p>

            <motion.p
              className="text-base md:text-lg lg:text-xl mb-12 md:mb-16 text-gray-300 font-light leading-relaxed"
              variants={itemFadeIn}
            >
              Paragon&apos;s investment funds provide students with real-world
              opportunities to apply what they are taught in Paragon&apos;s
              education. Students can apply both fundamental analysis and
              systematic algorithms to identify potential asset upside and
              optimize returns.
            </motion.p>
          </motion.div>

          {/* Investment Strategy Section */}
          <motion.div className="mt-16 md:mt-24 lg:mt-32" variants={fadeIn}>
            <motion.h2
              variants={fadeIn}
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
            >
              <ShinyText
                text="Investment Strategy"
                className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal"
              />
            </motion.h2>

            {/* Funds Grid */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto"
              variants={staggerContainer}
            >
              {/* Paragon Value Fund */}
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
                    text="Paragon Value Fund"
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
                  The Paragon Value Fund is a well-diversified long-only
                  investment fund that invests into publicly-traded US equities.
                  Analysts engage in fundamental and bottom-up research to
                  identify mispriced assets that will deliver long-term returns
                  on capital to shareholders.
                </motion.p>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-8"
                  variants={itemFadeIn}
                >
                  Students are responsible for generating equity research
                  reports, building detailed financial models, and presenting
                  investment theses supported by qualitative and quantitative
                  analysis. Our portfolio is constructed using modern portfolio
                  theory and risk management principles to ensure optimal
                  diversification and downside protection.
                </motion.p>

                <motion.div
                  className="flex justify-center"
                  variants={itemFadeIn}
                >
                  <div className="bg-pgi-light-blue/50 border border-pgi-light-blue/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm md:text-base font-medium">
                      Long-only US Equities
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Paragon Systematic Fund */}
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
                    text="Paragon Systematic Fund"
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
                  The Paragon Systematic Fund utilizes advanced mathematical
                  analysis to develop novel systematic algorithmic trading
                  strategies that predict price movements and generate
                  risk-adjusted returns. Our fund leverages cutting-edge
                  quantitative models, historical data analysis, and machine
                  learning algorithms to make informed investment decisions with
                  unparalleled precision.
                </motion.p>

                <motion.p
                  className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed mb-8"
                  variants={itemFadeIn}
                >
                  Students design, research, develop, and backtest their trading
                  algorithms to be allocated a portion of the fund. Thanks to
                  our partnership with CloudQuant, Paragon analysts have access
                  to more than 15,000 alternative data sets for the development
                  of proprietary trading signals.
                </motion.p>

                <motion.div
                  className="flex justify-center"
                  variants={itemFadeIn}
                >
                  <div className="bg-pgi-light-blue/50 border border-pgi-light-blue/30 px-4 py-2 rounded-lg">
                    <span className="text-gray-400 text-sm md:text-base font-medium">
                      CloudQuant Partnership
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
                  Join Our Investment Team
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

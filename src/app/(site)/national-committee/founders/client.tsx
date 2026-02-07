'use client';

import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import ShinyText from '@/components/reactbits/TextAnimations/ShinyText/ShinyText';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';
import { fadeIn, staggerContainer, cardAnimation } from '@/lib/animations';
import type { CmsPerson } from '@/lib/cms/types';

interface FoundersClientProps {
  founders: CmsPerson[];
  chapterFounders: CmsPerson[];
}

// Group chapter founders by school for display
function groupBySchool(people: CmsPerson[]): Record<string, CmsPerson[]> {
  const grouped: Record<string, CmsPerson[]> = {};
  for (const person of people) {
    const school = person.school || 'Unknown';
    if (!grouped[school]) {
      grouped[school] = [];
    }
    grouped[school].push(person);
  }
  return grouped;
}

export default function FoundersClient({
  founders,
  chapterFounders,
}: FoundersClientProps) {
  const groupedChapterFounders = groupBySchool(chapterFounders);

  return (
    <div className="bg-navy text-white min-h-screen">
      {/* Main Founders Section */}
      <section className="py-16 md:py-24 lg:py-32 px-4">
        <div className="container mx-auto">
          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light mb-12 md:mb-16 lg:mb-20 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <ShinyText
              text="Founders"
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-normal"
            />
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20 lg:mb-24 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {founders.map(founder => (
              <motion.div
                key={founder.id}
                className="bg-darkNavy p-4 md:p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 text-center"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-lg md:text-xl lg:text-2xl font-medium mb-2 text-white">
                  {founder.name}
                </h2>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {founder.school}
                </p>
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    className="inline-flex items-center text-white hover:text-white transition-colors text-sm md:text-base"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="text-lg md:text-xl mr-2" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Chapter Founders Section */}
          <motion.h2
            className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mb-8 md:mb-12 lg:mb-16 text-center text-white"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            <DecryptedText
              text="Chapter Founders"
              sequential={true}
              revealDirection="start"
              animateOn="view"
              speed={50}
              useOriginalCharsOnly={true}
              className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-white"
            />
          </motion.h2>

          <div className="space-y-12 md:space-y-16">
            {Object.entries(groupedChapterFounders).map(
              ([university, members], uIndex) => (
                <motion.div
                  key={university}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: 0.1 * uIndex }}
                >
                  <h3 className="text-lg md:text-xl lg:text-2xl font-medium mb-6 md:mb-8 text-center">
                    <ShinyText
                      text={university}
                      className="text-lg md:text-xl lg:text-2xl font-medium text-white"
                    />
                  </h3>
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {members.map(founder => (
                      <motion.div
                        key={founder.id}
                        className="bg-darkNavy p-4 md:p-6 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300"
                        variants={cardAnimation}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <h4 className="text-lg md:text-xl font-medium mb-2 text-white">
                          {founder.name}
                        </h4>
                        <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                          {university}
                        </p>
                        {founder.linkedin && (
                          <a
                            href={founder.linkedin}
                            className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm md:text-base"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="text-lg md:text-xl mr-2" />
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

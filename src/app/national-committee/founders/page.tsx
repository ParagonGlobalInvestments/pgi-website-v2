'use client';

import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
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

const cardAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Founder data
const founders = [
  {
    name: 'Jay Sivadas',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/jay-sivadas-795698168/',
  },
  {
    name: 'Daniel Labrador',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/daniellabrador-plata/',
  },
  {
    name: 'Erin Ku',
    university: 'University of Chicago',
    linkedin: 'https://www.linkedin.com/in/erinku/',
  },
];

// Chapter Founders by university with LinkedIn profiles
const chapterFounders = {
  'University of Chicago': [
    {
      name: 'Lucas Mantovani',
      linkedin: 'https://www.linkedin.com/in/lucas-mantovani-a446a61a9/',
    },
    {
      name: 'John Hahn',
      linkedin: 'https://www.linkedin.com/in/john-hahn-12a1861b6/',
    },
    {
      name: 'Brianna Liu',
      linkedin: 'https://www.linkedin.com/in/briannaliu3/',
    },
    {
      name: 'Raphael Jimenez',
      linkedin: 'https://www.linkedin.com/in/raphael-jimenez-658447205/',
    },
    {
      name: 'Advay Mohindra',
      linkedin: 'https://www.linkedin.com/in/advay-mohindra-a18663231/',
    },
    {
      name: 'Silvia Aydinyan',
      linkedin: 'https://www.linkedin.com/in/silviaaydinyan/',
    },
    {
      name: 'Jeffrey Kao',
      linkedin: 'https://www.linkedin.com/in/jeffrey-kao-5a06a7182/',
    },
    {
      name: 'Bradley Yu',
      linkedin: 'https://www.linkedin.com/in/bradley-yu-124537181/',
    },
  ],
  'University of Pennsylvania': [
    {
      name: 'Arjun Neervanan',
      linkedin: 'https://www.linkedin.com/in/arjun-neervannan/',
    },
    {
      name: 'Saahil Kamulkar',
      linkedin: 'https://www.linkedin.com/in/saahil-kamulkar-8074431b4/',
    },
    {
      name: 'Ria Sharma',
      linkedin: 'https://www.linkedin.com/in/ria-sharma-b224241b3/',
    },
    {
      name: 'Daniel Barra',
      linkedin: 'https://www.linkedin.com/in/daniel-barra24/',
    },
    {
      name: 'Nicole Rong',
      linkedin: 'https://www.linkedin.com/in/nicolerong/',
    },
    {
      name: 'Olgierd Fudali',
      linkedin: 'https://www.linkedin.com/in/ofudali/',
    },
    {
      name: 'Aryan Singh',
      linkedin: 'https://www.linkedin.com/in/aryan-singh-37120515b/',
    },
    {
      name: 'Anthony Steimle',
      linkedin: 'https://www.linkedin.com/in/anthony-steimle/',
    },
    { name: 'Andy Mei', linkedin: 'https://www.linkedin.com/in/meia/' },
    {
      name: 'Grant Mao',
      linkedin: 'https://www.linkedin.com/in/grant-mao-513a92202/',
    },
    {
      name: 'Ashish Pothireddy',
      linkedin: 'https://www.linkedin.com/in/ashish-pothireddy/',
    },
    {
      name: 'Prithvi Bale',
      linkedin: 'https://www.linkedin.com/in/prithvi-kb/',
    },
    {
      name: 'Manya Gauba',
      linkedin: 'https://www.linkedin.com/in/manya-gauba/',
    },
    {
      name: 'Arman Ashaboglu',
      linkedin: 'https://www.linkedin.com/in/arman-ashaboglu/',
    },
  ],
  'New York University': [
    {
      name: 'Christopher Rosa',
      linkedin: 'https://www.linkedin.com/in/christopher-rosa-23608819a/',
    },
    {
      name: 'Elizabeth Grayfer',
      linkedin: 'https://www.linkedin.com/in/elizabeth-grayfer-246675221/',
    },
    {
      name: 'Rishi Subbaraya',
      linkedin: 'https://www.linkedin.com/in/rishi-subbaraya-bb78901bb/',
    },
    {
      name: 'Yihao Zhong',
      linkedin: 'https://www.linkedin.com/in/yihaozhong/',
    },
    {
      name: 'Harrison Du',
      linkedin: 'https://www.linkedin.com/in/harrison-du-a67722212/',
    },
    {
      name: 'Justin Singh',
      linkedin: 'https://www.linkedin.com/in/justin-singh-918147202/',
    },
    {
      name: 'Arthur Chen',
      linkedin: 'https://www.linkedin.com/in/arthur-chen43/',
    },
  ],
  'Columbia University': [
    {
      name: 'Philip Bardon',
      linkedin: 'https://www.linkedin.com/in/philip-bardon-b19570236/',
    },
    {
      name: 'Ali Alomari',
      linkedin: 'https://www.linkedin.com/in/ali-alomari-567468263/',
    },
    { name: 'Colby Cox', linkedin: 'https://www.linkedin.com/in/colbymcox/' },
    {
      name: 'Robert Stankard',
      linkedin: 'https://www.linkedin.com/in/robert-stankard-881386237/',
    },
    {
      name: 'Nischal Chennuru',
      linkedin: 'https://www.linkedin.com/in/nischal-chennuru-6555441b3/',
    },
    {
      name: 'Harrison Wang',
      linkedin: 'https://www.linkedin.com/in/harrison-wang-591b95214/',
    },
    { name: 'Kaiji Uno', linkedin: 'https://www.linkedin.com/in/kaijiuno/' },
    {
      name: 'Olivia Stevens',
      linkedin: 'https://www.linkedin.com/in/olivia-stevens-8062821ba/',
    },
    { name: 'Kenny Zhu', linkedin: 'https://www.linkedin.com/in/kenny-zhu/' },
    {
      name: 'Emma Liu',
      linkedin: 'https://www.linkedin.com/in/emma-liu-2846b1252/',
    },
    { name: 'Tony Chen', linkedin: 'https://www.linkedin.com/in/haozhe-chen/' },
    {
      name: 'Anupam Bhakta',
      linkedin: 'https://www.linkedin.com/in/anupam-bhakta/',
    },
    {
      name: 'William Vietor',
      linkedin: 'https://www.linkedin.com/in/william-vietor/',
    },
    {
      name: 'Matthew Weng',
      linkedin: 'https://www.linkedin.com/in/matthewweng/',
    },
  ],
  'Brown University': [
    {
      name: 'Sandra Martinez',
      linkedin: 'https://www.linkedin.com/in/sandra-martinez-6877aa1ab/',
    },
    {
      name: 'Nick Klatsky',
      linkedin: 'https://www.linkedin.com/in/nicholas-k-93108619b/',
    },
    {
      name: 'Tianyu Zhou',
      linkedin: 'https://www.linkedin.com/in/tianyu-raphael-zhou/',
    },
    {
      name: 'Advay Mansingka',
      linkedin: 'https://www.linkedin.com/in/advay-mansingka/',
    },
    {
      name: 'Luke Briody',
      linkedin: 'https://www.linkedin.com/in/luke-briody/',
    },
    {
      name: 'Angela Osei-Ampadu',
      linkedin: 'https://www.linkedin.com/in/angela-osei-ampadu-b21a92200/',
    },
    {
      name: 'Raymundo Chapa Ponce',
      linkedin: 'https://www.linkedin.com/in/raymundo-chapa-ponce-5a2a05203/',
    },
    {
      name: 'Finnur Christianson',
      linkedin: 'https://www.linkedin.com/in/finnur-christianson-7333b51a7/',
    },
    {
      name: 'Erica Li',
      linkedin: 'https://www.linkedin.com/in/erica-li-b1108/',
    },
  ],
  'Cornell University': [
    {
      name: 'Kate Michelini',
      linkedin: 'https://www.linkedin.com/in/katharine-michelini/',
    },
    {
      name: 'Flynn Kelleher',
      linkedin: 'https://www.linkedin.com/in/flynn-kelleher/',
    },
    {
      name: 'Max Koster',
      linkedin: 'https://www.linkedin.com/in/max-koster-/',
    },
    {
      name: 'Michael Negrea',
      linkedin: 'https://www.linkedin.com/in/michaelanegrea/',
    },
    {
      name: 'Leopold Home',
      linkedin: 'https://www.linkedin.com/in/leopold-horne/',
    },
    {
      name: 'Caroline Duthie',
      linkedin: 'https://www.linkedin.com/in/caroline-duthie-b7997822a/',
    },
    {
      name: 'Pranav Mishra',
      linkedin: 'https://www.linkedin.com/in/pranavmishra10/',
    },
    {
      name: 'Benjamin Collins',
      linkedin: 'https://www.linkedin.com/in/benjamin-h-collins/',
    },
    { name: 'Corey Wang', linkedin: 'https://www.linkedin.com/in/corey53w53/' },
  ],
  'Princeton University': [
    {
      name: 'Brandon Hwang',
      linkedin: 'https://www.linkedin.com/in/brandon-hwang-66a352187/',
    },
    {
      name: 'Brandon Cheng',
      linkedin: 'https://www.linkedin.com/in/brandoncheng127/',
    },
    {
      name: 'Jack Deschenes',
      linkedin: 'https://www.linkedin.com/in/jackdeschenes/',
    },
    { name: 'Eli Soffer', linkedin: 'https://www.linkedin.com/in/elisoffer/' },
    {
      name: 'Samuel Henriques',
      linkedin: 'https://www.linkedin.com/in/samuelhhenriques/',
    },
    {
      name: 'Rebecca Zhu',
      linkedin: 'https://www.linkedin.com/in/rebecca-zhu-9631bb1a9/',
    },
    {
      name: 'Michael Deschenes',
      linkedin: 'https://www.linkedin.com/in/michaelndeschenes/',
    },
    {
      name: 'Jason Ciptonugroho',
      linkedin: 'https://www.linkedin.com/in/jason-ciptonugroho/',
    },
    {
      name: 'Ellie Mueller',
      linkedin: 'https://www.linkedin.com/in/elise-ellie-mueller-299ba2206/',
    },
  ],
  'Yale University': [
    {
      name: 'Jack Stemerman',
      linkedin: 'https://www.linkedin.com/in/jack-stemerman-1768a3211/',
    },
    {
      name: 'Joshua Donovan',
      linkedin: 'https://www.linkedin.com/in/joshua-donovan-b98632237/',
    },
    {
      name: 'Matthew Neissen',
      linkedin: 'https://www.linkedin.com/in/matthew-neissen/',
    },
    {
      name: 'Daniel Siegel',
      linkedin: 'https://www.linkedin.com/in/daniel-siegel-b314841b2/',
    },
    {
      name: 'Charlie Stemerman',
      linkedin: 'https://www.linkedin.com/in/charlie-stemerman-yale/',
    },
  ],
};

export default function FoundersPage() {
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
            {founders.map((founder, index) => (
              <motion.div
                key={index}
                className="bg-darkNavy p-4 md:p-6 lg:p-8 rounded-lg border border-gray-700 hover:border-pgi-light-blue transition-colors duration-300 text-center"
                variants={cardAnimation}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <h2 className="text-lg md:text-xl lg:text-2xl font-medium mb-2 text-white">
                  {founder.name}
                </h2>
                <p className="text-gray-300 mb-4 text-sm md:text-base font-light">
                  {founder.university}
                </p>
                <a
                  href={founder.linkedin}
                  className="inline-flex items-center text-white hover:text-white transition-colors text-sm md:text-base"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="text-lg md:text-xl mr-2" />
                  <span>LinkedIn</span>
                </a>
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
            {Object.entries(chapterFounders).map(
              ([university, founders], uIndex) => (
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
                    {founders.map((founder, index) => (
                      <motion.div
                        key={index}
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
                        <a
                          href={founder.linkedin}
                          className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm md:text-base"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="text-lg md:text-xl mr-2" />
                          <span>LinkedIn</span>
                        </a>
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

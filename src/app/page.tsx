import Link from "next/link";
import Image from "next/image";
import ScrollButton from "@/components/ScrollButton";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-navy to-primary text-white min-h-[90vh] flex flex-col justify-center items-center relative">
        <div className="container mx-auto px-4 text-center py-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-wide mb-8">
            Paragon Global Investments
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl mb-6 text-gray-200 font-normal tracking-wide text-gray-400">
            Intersecting Value Investing and Quantitative Finance
          </h2>
          <p className="text-lg md:text-xl mb-16 mx-auto text-gray-200 font-light tracking-wide text-gray-500">
            We are a student-run intercollegiate investment fund focused on
            value investing and algorithmic trading
          </p>
        </div>
        <div className="absolute bottom-12 text-center">
          <ScrollButton targetId="about-section">
            <span className="mb-2 font-light">Learn More</span>
            <svg
              className="w-8 h-8 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </ScrollButton>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-light mb-10 text-center text-white">
            About Us
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg mb-6 text-gray-300 text-center font-light">
              Paragon Global Investments (formerly PNG) is a student-run
              intercollegiate investment fund with 8 chapters at the top
              universities in the United States. We utilize both fundamental and
              systematic trading strategies to invest into our $40,000
              investment fund. Since our inception, we have grown to 300+ active
              students and every year we receive close to 2,000 students
              interested in joining organization nationally.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-center">
              <div className="p-6 bg-navy border border-gray-700 rounded-lg">
                <p className="text-3xl font-normal mb-2 text-primary">$40K</p>
                <p className="text-gray-300 font-light">AUM</p>
              </div>
              <div className="p-6 bg-navy border border-gray-700 rounded-lg">
                <p className="text-3xl font-normal mb-2 text-primary">21</p>
                <p className="text-gray-300 font-light">Sponsors & Partners</p>
              </div>
              <div className="p-6 bg-navy border border-gray-700 rounded-lg">
                <p className="text-3xl font-normal mb-2 text-primary">8</p>
                <p className="text-gray-300 font-light">Chapters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Section */}
      <section className="py-4 bg-navy px-4 ">
        <div className="container mx-auto">
          <h2 className="text-3xl font-light mb-10 text-center text-white">
            Our Chapters
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Brown University */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/brown.png"
                alt="Brown University"
                width={148}
                height={148}
                className="object-contain"
              />
            </div>

            {/* Columbia University */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/columbia.png"
                alt="Columbia University"
                width={156}
                height={156}
                className="object-contain"
              />
            </div>

            {/* Cornell University */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/cornell.png"
                alt="Cornell University"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>

            {/* University of Pennsylvania */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/upenn.png"
                alt="University of Pennsylvania"
                width={216}
                height={216}
                className="object-contain"
              />
            </div>

            {/* University of Chicago */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/uchicago.png"
                alt="University of Chicago"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>

            {/* Princeton University */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/princeton.svg"
                alt="Princeton University"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>

            {/* NYU */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/nyu.png"
                alt="NYU"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>

            {/* Yale University */}
            <div className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center">
              <Image
                src="/images/yale.png"
                alt="Yale University"
                width={128}
                height={128}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-light mb-10 text-center text-white">
            Sponsors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder for sponsor logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center"
                >
                  <div className="w-32 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
                    Sponsor Logo
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-navy px-4 border-t border-b border-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-white">
            Partners
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder for partner logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center"
                >
                  <div className="w-32 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
                    Partner Logo
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-white">
            Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-navy border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Value Investment
              </h3>
              <p className="text-gray-300">
                Learn about the basic of accounting, valuation, modeling, and
                bottom-up analysis of companies. Students will learn to develop
                value-based investment research on publicly traded companies.
              </p>
            </div>
            <div className="p-8 bg-navy border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Algorithmic Trading
              </h3>
              <p className="text-gray-300">
                Students will learn about quantitative analysis in python,
                modern portfolio theory and quantitative portfolio allocation,
                and how to research, design, and implement systematic
                algorithmic trading strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Funds Section */}
      <section className="py-16 bg-navy px-4 border-t border-b border-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-white">
            Investment Funds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-navy border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Paragon Value
              </h3>
              <p className="text-gray-300">
                The Paragon Value Fund is a well-diversified, long-only fund
                focused on identifying mispriced assets using a bottom-up,
                value-based approach. Total portfolio risk and return are
                optimized through quantitative portfolio allocation measures.
              </p>
            </div>
            <div className="p-8 bg-navy border border-gray-700 rounded-lg">
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Paragon Systematic
              </h3>
              <p className="text-gray-300">
                The Paragon Systematic Fund employs systematic algorithmic
                trading strategies that utilize quantitative analysis of public
                securities. Students develop algorithms using advanced
                mathematical analysis to identify strategies with uncorrelated
                returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Placements Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-white">
            Select Placements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Placeholder for placement logos */}
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="p-6 bg-navy border border-gray-700 rounded-lg flex items-center justify-center"
                >
                  <div className="w-32 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
                    Placement Logo
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

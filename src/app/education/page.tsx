import Link from "next/link";

export default function EducationPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Education Programs</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Comprehensive training in value investing and algorithmic trading
            for future financial leaders.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-dark">
              Learning Pathways
            </h2>
            <p className="text-lg mb-12">
              At Paragon Global Investments, we offer comprehensive educational
              programs designed to equip students with the knowledge and skills
              needed to excel in the financial industry. Our two primary
              learning pathways focus on value investing and algorithmic
              trading.
            </p>

            <div className="space-y-12">
              {/* Value Investment Section */}
              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Value Investment
                </h3>
                <p className="text-gray-700 mb-6">
                  Learn about the basics of accounting, valuation, modeling, and
                  bottom-up analysis of companies. Students will learn to
                  develop value-based investment research on publicly traded
                  companies.
                </p>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Program Highlights:
                </h4>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>Financial Statement Analysis</li>
                  <li>Valuation Methodologies</li>
                  <li>Industry and Competitive Analysis</li>
                  <li>Investment Thesis Development</li>
                  <li>Portfolio Construction and Risk Management</li>
                </ul>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Learning Outcomes:
                </h4>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>
                    Ability to analyze financial statements and assess company
                    performance
                  </li>
                  <li>Proficiency in applying various valuation techniques</li>
                  <li>
                    Skills to evaluate competitive positioning and industry
                    dynamics
                  </li>
                  <li>
                    Capability to construct and defend investment
                    recommendations
                  </li>
                </ul>
              </div>

              {/* Algorithmic Trading Section */}
              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Algorithmic Trading
                </h3>
                <p className="text-gray-700 mb-6">
                  Students will learn about quantitative analysis in Python,
                  modern portfolio theory and quantitative portfolio allocation,
                  and how to research, design, and implement systematic
                  algorithmic trading strategies.
                </p>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Program Highlights:
                </h4>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>Python Programming for Finance</li>
                  <li>Statistical Analysis and Backtesting</li>
                  <li>Modern Portfolio Theory</li>
                  <li>Algorithmic Strategy Development</li>
                  <li>Risk Management and Optimization</li>
                </ul>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Learning Outcomes:
                </h4>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>
                    Proficiency in Python programming for financial applications
                  </li>
                  <li>Ability to analyze and interpret financial data</li>
                  <li>Skills to develop and backtest trading algorithms</li>
                  <li>Understanding of portfolio optimization techniques</li>
                </ul>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8 text-dark">
                Learning Resources
              </h2>
              <p className="text-lg mb-6">
                Paragon Global Investments provides members with access to a
                wide range of learning resources, including:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-light p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Workshops and Seminars
                  </h3>
                  <p className="text-gray-700">
                    Regular workshops and seminars led by industry professionals
                    and faculty advisors to deepen your understanding of
                    financial concepts.
                  </p>
                </div>

                <div className="bg-light p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Guest Speaker Series
                  </h3>
                  <p className="text-gray-700">
                    Talks by accomplished professionals sharing insights from
                    their careers in finance and investment management.
                  </p>
                </div>

                <div className="bg-light p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Digital Library
                  </h3>
                  <p className="text-gray-700">
                    Access to a curated collection of books, articles, and
                    research papers on finance and investing.
                  </p>
                </div>

                <div className="bg-light p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-3 text-primary">
                    Mentorship Program
                  </h3>
                  <p className="text-gray-700">
                    One-on-one guidance from experienced members and alumni
                    working in the financial industry.
                  </p>
                </div>
              </div>
            </div>

            {/* Join CTA */}
            <div className="bg-primary text-white p-8 rounded-lg mt-12 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Start Your Investment Journey?
              </h3>
              <p className="text-lg mb-6">
                Join Paragon Global Investments and gain access to our
                comprehensive educational programs and resources.
              </p>
              <Link
                href="/portal"
                className="bg-secondary text-white py-3 px-6 rounded-full font-medium text-lg inline-block hover:bg-opacity-90 transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

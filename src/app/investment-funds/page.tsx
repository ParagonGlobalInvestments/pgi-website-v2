import Image from "next/image";

export default function InvestmentFundsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Investment Funds</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Our student-managed investment funds provide real-world experience
            in value investing and algorithmic trading.
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-dark">
              Our Investment Approach
            </h2>
            <p className="text-lg mb-6">
              Paragon Global Investments manages two distinct investment funds,
              each with its own strategy and approach. Our total assets under
              management (AUM) of $40,000 are allocated across these funds,
              allowing students to gain hands-on experience in different
              investment methodologies.
            </p>
            <p className="text-lg mb-12">
              Both funds are managed by student teams under the guidance of
              faculty advisors and industry mentors. This structure provides a
              supportive learning environment while allowing students to make
              real investment decisions and see the impact of their analysis and
              strategy.
            </p>

            {/* Fund Performance Chart Placeholder */}
            <div className="my-12 bg-gray-200 rounded-lg w-full h-80 flex items-center justify-center text-gray-500">
              Fund Performance Chart Placeholder
            </div>
          </div>
        </div>
      </section>

      {/* Funds Section */}
      <section className="py-16 bg-light px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-16">
              {/* Value Fund */}
              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Paragon Value Fund
                </h3>
                <p className="text-gray-700 mb-6">
                  The Paragon Value Fund is a well-diversified, long-only fund
                  focused on identifying mispriced assets using a bottom-up,
                  value-based approach. Total portfolio risk and return are
                  optimized through quantitative portfolio allocation measures.
                </p>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Investment Philosophy:
                </h4>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>
                    Focus on businesses with strong fundamentals and sustainable
                    competitive advantages
                  </li>
                  <li>
                    Identify companies trading at a discount to their intrinsic
                    value
                  </li>
                  <li>Maintain a long-term investment horizon</li>
                  <li>Apply disciplined risk management practices</li>
                </ul>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Investment Process:
                </h4>
                <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700">
                  <li>
                    Idea generation through quantitative screening and
                    qualitative research
                  </li>
                  <li>
                    In-depth fundamental analysis of company financials,
                    management, and industry
                  </li>
                  <li>
                    Valuation using multiple methodologies (DCF, comparable
                    companies, etc.)
                  </li>
                  <li>
                    Portfolio construction with consideration of risk factors
                    and diversification
                  </li>
                  <li>Regular monitoring and performance evaluation</li>
                </ol>

                {/* Fund Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">AUM</p>
                    <p className="text-2xl font-bold text-primary">$25,000</p>
                  </div>
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">Holdings</p>
                    <p className="text-2xl font-bold text-primary">15-20</p>
                  </div>
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">Inception</p>
                    <p className="text-2xl font-bold text-primary">2018</p>
                  </div>
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">Benchmark</p>
                    <p className="text-2xl font-bold text-primary">S&P 500</p>
                  </div>
                </div>
              </div>

              {/* Systematic Fund */}
              <div className="bg-white p-8 shadow-lg rounded-lg">
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Paragon Systematic Fund
                </h3>
                <p className="text-gray-700 mb-6">
                  The Paragon Systematic Fund employs systematic algorithmic
                  trading strategies that utilize quantitative analysis of
                  public securities. Students develop algorithms using advanced
                  mathematical analysis to identify strategies with uncorrelated
                  returns.
                </p>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Investment Philosophy:
                </h4>
                <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                  <li>
                    Utilize quantitative methods to identify market
                    inefficiencies
                  </li>
                  <li>
                    Develop systematic trading strategies with rules-based
                    decision making
                  </li>
                  <li>
                    Focus on statistical edges and probability rather than
                    fundamental value
                  </li>
                  <li>
                    Maintain low correlation to traditional market indices
                  </li>
                </ul>

                <h4 className="text-xl font-semibold mb-3 text-dark">
                  Investment Process:
                </h4>
                <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700">
                  <li>Strategy research and hypothesis development</li>
                  <li>Algorithm design and coding in Python</li>
                  <li>Rigorous backtesting using historical data</li>
                  <li>Strategy optimization and parameter tuning</li>
                  <li>Live implementation with continuous monitoring</li>
                </ol>

                {/* Fund Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">AUM</p>
                    <p className="text-2xl font-bold text-primary">$15,000</p>
                  </div>
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">Strategies</p>
                    <p className="text-2xl font-bold text-primary">5-8</p>
                  </div>
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">Inception</p>
                    <p className="text-2xl font-bold text-primary">2020</p>
                  </div>
                  <div className="bg-light p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600">Avg. Holding</p>
                    <p className="text-2xl font-bold text-primary">2-7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Involvement Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-dark text-center">
              Student Involvement
            </h2>
            <p className="text-lg mb-8 text-center">
              Students at all levels of experience can get involved with our
              investment funds, from learning the basics to managing portfolios.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 shadow-md rounded-lg text-center">
                <h3 className="text-xl font-bold mb-3 text-primary">
                  Analysts
                </h3>
                <p className="text-gray-700">
                  Research companies, sectors, or trading strategies and present
                  findings to the team.
                </p>
              </div>
              <div className="bg-white p-6 shadow-md rounded-lg text-center">
                <h3 className="text-xl font-bold mb-3 text-primary">
                  Portfolio Managers
                </h3>
                <p className="text-gray-700">
                  Make investment decisions and manage risk across the
                  portfolio.
                </p>
              </div>
              <div className="bg-white p-6 shadow-md rounded-lg text-center">
                <h3 className="text-xl font-bold mb-3 text-primary">
                  Strategy Developers
                </h3>
                <p className="text-gray-700">
                  Design and implement new algorithmic trading strategies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

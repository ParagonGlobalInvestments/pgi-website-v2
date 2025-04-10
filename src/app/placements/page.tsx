import Image from "next/image";

export default function PlacementsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Select Placements</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Our members have secured positions at top firms across the financial
            industry.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-dark text-center">
              Career Success
            </h2>
            <p className="text-lg mb-12 text-center">
              Our comprehensive training and real-world investment experience
              prepare our members for successful careers. Paragon Global
              Investments alumni have secured positions at many of the world's
              leading financial institutions and companies.
            </p>

            {/* Placement Categories */}
            <div className="space-y-16">
              {/* Investment Banking */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Investment Banking
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Placeholder for company logos */}
                  {Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white shadow-sm rounded-lg flex items-center justify-center"
                      >
                        <div className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          Bank Logo
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Asset Management */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Asset Management
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Placeholder for company logos */}
                  {Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white shadow-sm rounded-lg flex items-center justify-center"
                      >
                        <div className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          AM Firm Logo
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Hedge Funds */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Hedge Funds
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Placeholder for company logos */}
                  {Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white shadow-sm rounded-lg flex items-center justify-center"
                      >
                        <div className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          Hedge Fund Logo
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Technology & FinTech */}
              <div>
                <h3 className="text-2xl font-bold mb-6 text-primary">
                  Technology & FinTech
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {/* Placeholder for company logos */}
                  {Array(8)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="p-6 bg-white shadow-sm rounded-lg flex items-center justify-center"
                      >
                        <div className="w-32 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          Tech Firm Logo
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Testimonials */}
      <section className="py-16 bg-light px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-dark text-center">
              Alumni Testimonials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 shadow-md rounded-lg">
                <div className="mb-4 text-gray-600 italic">
                  "My experience with Paragon Global Investments was
                  instrumental in launching my career in investment banking. The
                  hands-on experience managing real money and developing
                  investment theses gave me skills that set me apart from other
                  candidates."
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium text-dark">John Smith</p>
                    <p className="text-sm text-gray-600">
                      Investment Banking Analyst, Goldman Sachs
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 shadow-md rounded-lg">
                <div className="mb-4 text-gray-600 italic">
                  "Working on algorithmic trading strategies at Paragon gave me
                  the perfect foundation for my role at a quantitative hedge
                  fund. The technical skills and financial knowledge I gained
                  were exactly what employers were looking for."
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium text-dark">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">
                      Quantitative Analyst, Two Sigma
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 shadow-md rounded-lg">
                <div className="mb-4 text-gray-600 italic">
                  "The leadership experience I gained as a Portfolio Manager at
                  Paragon was invaluable. It taught me how to make decisions
                  under pressure and work effectively in a team, skills that
                  have been crucial in my career."
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium text-dark">Michael Chen</p>
                    <p className="text-sm text-gray-600">
                      Associate, BlackRock
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 shadow-md rounded-lg">
                <div className="mb-4 text-gray-600 italic">
                  "Being part of Paragon's value investing team gave me a solid
                  foundation in financial analysis and valuation. The skills I
                  developed analyzing companies and presenting investment ideas
                  directly translated to my current role."
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <p className="font-medium text-dark">Emma Rodriguez</p>
                    <p className="text-sm text-gray-600">
                      Equity Research Associate, J.P. Morgan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

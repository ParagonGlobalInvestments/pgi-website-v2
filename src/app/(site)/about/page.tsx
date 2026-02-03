export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">
            About Paragon Global Investments
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            A student-run intercollegiate investment fund empowering the next
            generation of financial leaders.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-dark">Our Story</h2>
            <p className="text-lg mb-6">
              Paragon Global Investments (formerly PNG) is a student-run
              intercollegiate investment fund with 8 chapters at the top
              universities in the United States. We utilize both fundamental and
              systematic trading strategies to invest into our $60,000
              investment fund.
            </p>
            <p className="text-lg mb-6">
              Since our inception, we have grown to 300+ active students and
              every year we receive close to 2,000 students interested in
              joining organization nationally.
            </p>
            <p className="text-lg mb-6">
              Our mission is to provide students with hands-on experience in
              investment management, financial analysis, and algorithmic
              trading. Through our comprehensive educational programs and
              real-world investment activities, we prepare students for
              successful careers in finance and investment management.
            </p>

            {/* Placeholder for team photo */}
            <div className="my-12 bg-gray-200 rounded-lg w-full h-80 flex items-center justify-center text-gray-500">
              Team Photo Placeholder
            </div>

            <h2 className="text-3xl font-bold mb-8 text-dark">Our Approach</h2>
            <p className="text-lg mb-6">
              At Paragon Global Investments, we believe in a dual approach to
              investment management:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  Value Investing
                </h3>
                <p className="text-gray-700">
                  Our value investing strategy focuses on identifying
                  undervalued companies with strong fundamentals and potential
                  for long-term growth. We conduct thorough research and
                  analysis to make informed investment decisions.
                </p>
              </div>
              <div className="bg-white p-6 shadow-md rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-primary">
                  Algorithmic Trading
                </h3>
                <p className="text-gray-700">
                  Our algorithmic trading approach leverages quantitative models
                  and computational techniques to identify market trends and
                  execute trades. Students learn to develop and implement
                  trading algorithms based on mathematical principles.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-dark">
              Join Our Community
            </h2>
            <p className="text-lg mb-6">
              Paragon Global Investments is always looking for talented and
              motivated students who are passionate about finance and investing.
              Whether you&apos;re interested in value investing, algorithmic trading,
              or both, there&apos;s a place for you in our community.
            </p>
            <p className="text-lg mb-6">
              To learn more about joining Paragon Global Investments or to
              inquire about starting a chapter at your university, please
              contact us at info@paragoninvestments.org.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

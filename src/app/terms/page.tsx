import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Paragon Global Investments',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-pgi-dark-blue text-white">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-pgi-light-blue hover:brightness-110 transition-all mb-6"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-400">Last Updated: January 6, 2025</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing or using the Paragon Global Investments website
              (paragoninvestments.org), you agree to be bound by these Terms of
              Service and all applicable laws and regulations. If you do not
              agree with any of these terms, you are prohibited from using or
              accessing this site.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Eligibility</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are intended for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Current university students affiliated with PGI chapters</li>
              <li>Alumni and former members of Paragon Global Investments</li>
              <li>
                Prospective members interested in learning about our
                organization
              </li>
            </ul>
          </section>

          {/* Use of Services */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Use of Services</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">
                  Acceptable Use
                </h3>
                <p className="leading-relaxed">You agree to:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>Provide accurate and truthful information</li>
                  <li>Use the website for lawful purposes only</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>
                    Maintain the confidentiality of your account credentials
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2 text-white">
                  Prohibited Activities
                </h3>
                <p className="leading-relaxed">You may not:</p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>
                    Attempt to gain unauthorized access to any part of the
                    website
                  </li>
                  <li>Use the website to distribute malware or harmful code</li>
                  <li>
                    Impersonate any person or entity, or falsely claim an
                    affiliation
                  </li>
                  <li>
                    Scrape, harvest, or collect information about other users
                  </li>
                  <li>
                    Share member-only resources with non-members without
                    permission
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Member Resources */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Member Resources</h2>
            <p className="text-gray-300 leading-relaxed">
              Access to certain resources, materials, and features is restricted
              to verified PGI members. These resources are provided for
              educational purposes only and remain the intellectual property of
              Paragon Global Investments. Members may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>Redistribute or republish member-only content</li>
              <li>
                Use materials for commercial purposes without written permission
              </li>
              <li>Share access credentials with non-members</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-300 leading-relaxed">
              All content on this website, including text, graphics, logos,
              images, and software, is the property of Paragon Global
              Investments or its content suppliers and is protected by
              international copyright laws. The compilation of all content on
              this site is the exclusive property of PGI.
            </p>
          </section>

          {/* Google OAuth */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Authentication and Google Services
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We use Google OAuth for authentication. By signing in, you agree
              to Google's Terms of Service and Privacy Policy. We request
              read-only access to Google Drive metadata solely to display member
              resources. You can revoke this access at any time through your
              Google Account settings.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Disclaimer of Warranties
            </h2>
            <p className="text-gray-300 leading-relaxed">
              This website and all information, content, materials, and services
              are provided "as is" and "as available" without warranties of any
              kind, either express or implied. PGI does not warrant that the
              website will be uninterrupted, timely, secure, or error-free.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-300 leading-relaxed">
              To the fullest extent permitted by law, Paragon Global Investments
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or
              revenues, whether incurred directly or indirectly, or any loss of
              data, use, or other intangible losses.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to terminate or suspend your access to the
              website at our sole discretion, without notice, for conduct that
              we believe violates these Terms of Service or is harmful to other
              users, us, or third parties, or for any other reason.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time.
              We will notify users of any material changes by posting the new
              Terms of Service on this page and updating the "Last Updated"
              date. Your continued use of the website after changes constitutes
              acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms of Service shall be governed by and construed in
              accordance with the laws of the United States, without regard to
              its conflict of law provisions.
            </p>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please
              contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <div>
                <strong className="text-white">Email:</strong>{' '}
                <a
                  href="mailto:ap7564@nyu.edu"
                  className="text-pgi-light-blue hover:brightness-110"
                >
                  ap7564@nyu.edu
                </a>
              </div>
              <div>
                <strong className="text-white">Website:</strong>{' '}
                <Link
                  href="/"
                  className="text-pgi-light-blue hover:brightness-110"
                >
                  paragoninvestments.org
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-pgi-light-blue transition-colors"
            >
              Home
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-pgi-light-blue transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-pgi-light-blue transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

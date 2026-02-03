import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Paragon Global Investments',
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-400">Last Updated: February 2, 2026</p>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Paragon Global Investments (&quot;PGI,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
              committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you visit our website{' '}
              <Link
                href="/"
                className="text-pgi-light-blue hover:brightness-110"
              >
                paragoninvestments.org
              </Link>{' '}
              and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-xl font-medium mb-2 text-white">
                  Personal Information
                </h3>
                <p className="leading-relaxed">
                  When you use our services, we may collect the following
                  personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>Name and email address (via Google OAuth)</li>
                  <li>University affiliation and graduation year</li>
                  <li>Profile information (LinkedIn, resume, skills)</li>
                  <li>Educational and professional background</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-2 text-white">
                  Usage Information
                </h3>
                <p className="leading-relaxed">
                  We automatically collect certain information about your device
                  and how you interact with our website, including:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2 ml-4">
                  <li>Browser type and version</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website addresses</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                <strong className="text-white">Authentication:</strong> Verify
                your identity and PGI membership status
              </li>
              <li>
                <strong className="text-white">Access Control:</strong> Provide
                access to member-only resources and materials
              </li>
              <li>
                <strong className="text-white">Communication:</strong> Send
                important updates, newsletters, and notifications
              </li>
              <li>
                <strong className="text-white">Analytics:</strong> Understand
                how our website is used and improve user experience
              </li>
              <li>
                <strong className="text-white">Member Directory:</strong>{' '}
                Maintain an internal directory for networking purposes
              </li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Data Storage and Security
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We take the security of your personal information seriously:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                Data is stored securely using Supabase with industry-standard
                encryption
              </li>
              <li>
                Access to personal information is restricted to authorized
                personnel only
              </li>
              <li>We use secure HTTPS connections for all data transmission</li>
              <li>We regularly review and update our security practices</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Third-Party Services
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <div className="space-y-3 text-gray-300">
              <div>
                <strong className="text-white">Google OAuth:</strong> For
                authentication
              </div>
              <div>
                <strong className="text-white">Supabase:</strong> For secure
                database storage and authentication
              </div>
              <div>
                <strong className="text-white">PostHog:</strong> For analytics
                and understanding user behavior
              </div>
              <div>
                <strong className="text-white">Vercel:</strong> For website
                hosting and deployment
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, trade, or rent your personal information to third
              parties. We may share information only in the following
              circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-4">
              <li>
                With other PGI members for networking and collaboration purposes
              </li>
              <li>When required by law or to protect our legal rights</li>
              <li>
                With service providers who assist in operating our website
                (under strict confidentiality agreements)
              </li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                <strong className="text-white">Access:</strong> Request a copy
                of your personal data
              </li>
              <li>
                <strong className="text-white">Correction:</strong> Update or
                correct inaccurate information
              </li>
              <li>
                <strong className="text-white">Deletion:</strong> Request
                deletion of your personal data
              </li>
              <li>
                <strong className="text-white">Opt-out:</strong> Unsubscribe
                from newsletters and communications
              </li>
              <li>
                <strong className="text-white">Revoke Access:</strong> Revoke
                Google sign-in access at any time through your Google Account
                settings
              </li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              To exercise these rights, please contact us at{' '}
              <a
                href="mailto:ap7564@nyu.edu"
                className="text-pgi-light-blue hover:brightness-110"
              >
                ap7564@nyu.edu
              </a>
            </p>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your
              experience on our website. You can control cookies through your
              browser settings, but disabling them may affect website
              functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Children&apos;s Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are intended for university students and
              professionals. We do not knowingly collect information from
              children under 13 years of age.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>

          {/* Contact Us */}
          <section className="border-t border-gray-700 pt-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please
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
              href="/terms"
              className="text-gray-400 hover:text-pgi-light-blue transition-colors"
            >
              Terms of Service
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

'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Paragon Global Investments';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'How we handle user data on our site.');
    }
  }, []);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-16 text-gray-300">
      <h1 className="text-4xl text-white font-light mb-8 text-center">
        Privacy Policy
      </h1>

      <section className="space-y-8">
        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">
            1. Overview
          </h2>
          <p>
            We respect your privacy. This page explains what limited info we
            collect and how it&apos;s used.
          </p>
        </div>

        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">
            2. What We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact info you submit (like name or email)</li>
            <li>Basic site analytics (via PostHog/Vercel)</li>
            <li>Cookies for login/session preferences</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">
            3. How It&apos;s Used
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To communicate with you</li>
            <li>To improve our site and content</li>
            <li>To process applications or forms</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">
            4. Third-Party Services
          </h2>
          <p>
            We use services like PostHog and Vercel to analyze site traffic.
            They may store anonymized data like IP addresses or device type.
          </p>
        </div>

        <div>
          <h2 className="text-2xl text-white font-semibold mb-4">5. Contact</h2>
          <p>
            Questions?{'  '}
            <Link
              href="/contact"
              className="text-gray-300 underline hover:text-white"
            >
              Contact Us.
            </Link>
          </p>
        </div>
      </section>

      <footer className="pt-8 mt-12 border-t border-gray-700 text-sm text-center text-gray-500">
        Last updated:{' '}
        {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </footer>
    </main>
  );
}

import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-navy text-white">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

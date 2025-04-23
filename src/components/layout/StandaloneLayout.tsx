import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import PageTransition from "@/components/ui/PageTransition";

export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-navy text-white">
      <PageTransition>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </PageTransition>
    </div>
  );
}

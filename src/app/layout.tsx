import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AnimationProvider } from "@/lib/context/AnimationContext";
import PageTransition from "@/components/ui/PageTransition";
import "../tailwind.css";
import "./globals.css";

// TODO: Replace with the identified font from original Paragon website
// Current placeholder fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paragon Global Investments",
  description:
    "Student-run intercollegiate investment fund focused on value investing and algorithmic trading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <AnimationProvider>
        <html lang="en">
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-navy text-white`}
          >
            <PageTransition>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </PageTransition>
          </body>
        </html>
      </AnimationProvider>
    </ClerkProvider>
  );
}

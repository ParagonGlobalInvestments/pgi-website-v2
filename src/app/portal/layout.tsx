"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import "@/tailwind.css";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <div className={`${geistSans.variable} antialiased`}>{children}</div>
    </ClerkProvider>
  );
}

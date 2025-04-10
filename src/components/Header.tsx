"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";

const Header = () => {
  // State to manage dropdown visibility for mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to handle About link direct click
  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // If we're on the home page, scroll to the About section
    if (window.location.pathname === "/") {
      const aboutSection = document.getElementById("about-section");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      window.location.href = "/#about-section";
    }
  };

  return (
    <header className="bg-navy font-semibold shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="">
          <Image
            src="/images/pgiLogoTransparent.png"
            alt="Paragon Global Investments Logo"
            width={50}
            height={50}
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-8 font-semibold">
          {/* About dropdown container */}
          <div className="relative group">
            <a
              href="#"
              onClick={handleAboutClick}
              className="text-white hover:text-secondary transition-colors"
            >
              About
            </a>

            {/* Dropdown menu */}
            <div className="absolute z-50 left-0 mt-2 w-48 opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
              {/* Dropdown content */}
              <div className="bg-navy-light border border-gray-700 rounded-md shadow-xl overflow-hidden">
                <Link
                  href="/who-we-are"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Who We Are
                </Link>
                <Link
                  href="/investment-strategy"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Investment Strategy
                </Link>
                <Link
                  href="/publications"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Publications
                </Link>
                <Link
                  href="/sponsors"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Sponsors
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/education"
            className="text-white hover:text-secondary transition-colors"
          >
            Education
          </Link>
          <Link
            href="/investment-funds"
            className="text-white hover:text-secondary transition-colors"
          >
            Investment Funds
          </Link>
          <Link
            href="/placements"
            className="text-white hover:text-secondary transition-colors"
          >
            Placements
          </Link>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-primary py-2 px-4 rounded hover:bg-opacity-90 transition-colors text-white font-bold"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link
              href="/portal"
              className="bg-primary py-2 px-4 rounded hover:bg-opacity-90 transition-colors font-bold bg-white text-black"
            >
              Portal
            </Link>
          </SignedOut>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            className="focus:outline-none text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 z-50 bg-navy border-t border-gray-700 py-2 px-4 shadow-lg">
              <a
                href="#"
                onClick={handleAboutClick}
                className="block py-2 text-white"
              >
                About
              </a>
              <Link href="/who-we-are" className="block py-2 pl-4 text-white">
                - Who We Are
              </Link>
              <Link
                href="/investment-strategy"
                className="block py-2 pl-4 text-white"
              >
                - Investment Strategy
              </Link>
              <Link href="/publications" className="block py-2 pl-4 text-white">
                - Publications
              </Link>
              <Link href="/sponsors" className="block py-2 pl-4 text-white">
                - Sponsors
              </Link>
              <Link href="/education" className="block py-2 text-white">
                Education
              </Link>
              <Link href="/investment-funds" className="block py-2 text-white">
                Investment Funds
              </Link>
              <Link href="/placements" className="block py-2 text-white">
                Placements
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="block py-2 text-white font-bold"
                >
                  Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/portal"
                  className="block py-2 text-white font-bold"
                >
                  Portal
                </Link>
              </SignedOut>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

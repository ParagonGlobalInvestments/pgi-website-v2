"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  // State to manage dropdown visibility for mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // States to manage expanded sections in mobile
  const [expandedAbout, setExpandedAbout] = useState(false);
  const [expandedNationalCommittee, setExpandedNationalCommittee] =
    useState(false);
  const [expandedMembers, setExpandedMembers] = useState(false);

  // Get current pathname for navigation events
  const pathname = usePathname();

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.querySelector("header");
      if (header && !header.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

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

    // Close mobile menu
    setMobileMenuOpen(false);
  };

  // Toggle section expansion for mobile
  const toggleSection = (section: string) => {
    if (section === "about") {
      setExpandedAbout(!expandedAbout);
    } else if (section === "nationalCommittee") {
      setExpandedNationalCommittee(!expandedNationalCommittee);
    } else if (section === "members") {
      setExpandedMembers(!expandedMembers);
    }
  };

  const mainNav = [
    { name: "Home", url: "/" },
    { name: "Who We Are", url: "/who-we-are" },
    {
      name: "National Committee",
      url: "/national-committee",
      subItems: [
        { name: "Officers", url: "/national-committee/officers" },
        { name: "Executive Board", url: "/national-committee/executive-board" },
        {
          name: "Development Committee",
          url: "/national-committee/development-committee",
        },
      ],
    },
    {
      name: "Members",
      url: "/members",
      subItems: [
        { name: "Value Team", url: "/members/value-team" },
        { name: "Quant Team", url: "/members/quant-team" },
      ],
    },
    { name: "Placements", url: "/placements" },
    { name: "Apply", url: "/apply" },
    { name: "Contact", url: "/contact" },
  ];

  // Define About submenu items for consistency
  const aboutSubItems = [
    { name: "Who We Are", url: "/who-we-are" },
    { name: "Investment Strategy", url: "/investment-strategy" },
    { name: "Publications", url: "/publications" },
    { name: "Sponsors", url: "/sponsors" },
  ];

  return (
    <header className="bg-navy font-semibold shadow-md z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="">
          <Image
            src="/images/pgiLogoTransparent.png"
            alt="Paragon Global Investments Logo"
            width={40}
            height={40}
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

          {/* National Committee dropdown container */}
          <div className="relative group">
            <Link
              href="/national-committee"
              className="text-white hover:text-secondary transition-colors"
            >
              National Committee
            </Link>

            {/* Dropdown menu */}
            <div className="absolute z-50 left-0 mt-2 w-48 opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
              {/* Dropdown content */}
              <div className="bg-navy-light border border-gray-700 rounded-md shadow-xl overflow-hidden">
                <Link
                  href="/national-committee/officers"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Officers
                </Link>
                <Link
                  href="/national-committee/founders"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Founders
                </Link>
              </div>
            </div>
          </div>

          {/* Members dropdown container */}
          <div className="relative group">
            <Link
              href="/members"
              className="text-white hover:text-secondary transition-colors"
            >
              Members
            </Link>

            {/* Dropdown menu */}
            <div className="absolute z-50 left-0 mt-2 w-48 opacity-0 invisible transform -translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-in-out">
              {/* Dropdown content */}
              <div className="bg-navy-light border border-gray-700 rounded-md shadow-xl overflow-hidden">
                <Link
                  href="/members/value-team"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Value Team
                </Link>
                <Link
                  href="/members/quant-team"
                  className="block px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                >
                  Quant Team
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/placements"
            className="text-white hover:text-secondary transition-colors"
          >
            Placements
          </Link>
          <Link
            href="/apply"
            className="text-white hover:text-secondary transition-colors"
          >
            Apply
          </Link>
          <Link
            href="/contact"
            className="text-white hover:text-secondary transition-colors"
          >
            Contact
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
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="focus:outline-none text-white p-1.5 rounded-md hover:bg-navy-light transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu - Non-fixed, flows with the page */}
      <div
        className={`border-t border-gray-700 bg-navy shadow-lg transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 py-1 text-sm">
          {/* Home link */}
          <Link
            href="/"
            className="block py-2.5 text-white border-b border-gray-700"
          >
            Home
          </Link>

          {/* About section with dropdown */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => toggleSection("about")}
              className="w-full text-left flex items-center justify-between py-2.5 text-white"
            >
              <span>About</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  expandedAbout ? "transform rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedAbout ? "max-h-[200px]" : "max-h-0"
              }`}
            >
              {aboutSubItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className="block py-2 pl-4 text-white hover:bg-navy-light transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* National Committee with dropdown */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => toggleSection("nationalCommittee")}
              className="w-full text-left flex items-center justify-between py-2.5 text-white"
            >
              <span>National Committee</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  expandedNationalCommittee ? "transform rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedNationalCommittee ? "max-h-[200px]" : "max-h-0"
              }`}
            >
              {mainNav[2]?.subItems?.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className="block py-2 pl-4 text-white hover:bg-navy-light transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Members with dropdown */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => toggleSection("members")}
              className="w-full text-left flex items-center justify-between py-2.5 text-white"
            >
              <span>Members</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${
                  expandedMembers ? "transform rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMembers ? "max-h-[200px]" : "max-h-0"
              }`}
            >
              {mainNav[3]?.subItems?.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className="block py-2 pl-4 text-white hover:bg-navy-light transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Regular links */}
          {mainNav.slice(4).map((item, index) => (
            <Link
              key={index}
              href={item.url}
              className="block py-2.5 text-white border-b border-gray-700 hover:bg-navy-light transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {/* Authentication links */}
          <div className="py-2.5 mt-1">
            <SignedIn>
              <Link
                href="/dashboard"
                className="block py-1.5 px-3 mb-2 bg-primary text-white font-semibold rounded text-center hover:bg-opacity-90 transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex justify-center">
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <Link
                href="/portal"
                className="block py-1.5 px-3 bg-white text-black font-semibold rounded text-center hover:bg-gray-200 transition-colors"
              >
                Portal
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

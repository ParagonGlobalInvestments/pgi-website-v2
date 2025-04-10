import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
const Header = () => {
  return (
    <header className="sticky top-0 z-10 bg-navy shadow-md backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="">
          <Image
            src="/images/pgiLogoTransparent.png"
            alt="Paragon Global Investments Logo"
            width={50}
            height={50}
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/about"
            className="text-white hover:text-secondary transition-colors font-light"
          >
            About Us
          </Link>
          <Link
            href="/education"
            className="text-white hover:text-secondary transition-colors font-light"
          >
            Education
          </Link>
          <Link
            href="/investment-funds"
            className="text-white hover:text-secondary transition-colors font-light"
          >
            Investment Funds
          </Link>
          <Link
            href="/placements"
            className="text-white hover:text-secondary transition-colors font-light"
          >
            Placements
          </Link>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-primary py-2 px-4 rounded hover:bg-opacity-90 transition-colors text-white font-normal"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link
              href="/portal"
              className="bg-primary py-2 px-4 rounded hover:bg-opacity-90 transition-colors text-white font-normal"
            >
              Portal
            </Link>
          </SignedOut>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          {/* Mobile menu button - would expand to show a dropdown */}
          <button className="focus:outline-none text-white">
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
        </div>
      </div>
    </header>
  );
};

export default Header;

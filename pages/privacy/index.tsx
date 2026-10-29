"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const PrivacyPolicy = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className="
        relative flex flex-col justify-start items-center
        min-h-screen
        px-3 sm:px-6 pt-28 xs:pt-36 sm:pt-44 md:pt-48 pb-10 sm:pb-12
        text-center
        bg-cover bg-center bg-no-repeat
        before:content-[''] before:absolute before:inset-0
        before:bg-[linear-gradient(180deg,#000000ff_1%,#000000b3_25%,#00000000_135%,#ffffffff_150%)]
      "
      style={{ backgroundImage: "url('/images/hero-image.jpeg')" }}
    >
      {/* Navbar */}
      <nav className="absolute top-2 left-0 w-full z-30 flex items-center justify-between px-3 sm:px-8 lg:px-24 py-3 sm:py-6 text-white">
        {/* Desktop Left */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="hover:text-gray-300 text-lg font-medium">
            Home
          </Link>
          <Link
            href="/#services-section"
            className="hover:text-gray-300 text-lg font-medium"
          >
            Services
          </Link>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-6"
        >
          <img
            src="/images/kaizen3.png"
            alt="KAIZEN TRANSPORTATION"
            className="w-16 xs:w-24 sm:w-32 md:w-36"
          />
        </Link>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/#contact"
            className="hover:text-gray-300 text-lg font-medium"
          >
            Contact
          </Link>
          <Link
            href="/booking"
            className="px-4 py-1 rounded-full border border-white hover:bg-white hover:text-black transition text-lg"
          >
            Book
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden absolute top-3 right-3 z-40">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full bg-black bg-opacity-95 flex flex-col items-center py-4 space-y-3 md:hidden">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Home
            </Link>
            <Link
              href="/#services-section"
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Services
            </Link>
            <Link
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className="text-sm"
            >
              Contact
            </Link>
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="text-sm px-3 py-1 rounded-full bg-white text-black"
            >
              Book
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="relative max-w-5xl mx-auto px-2 text-gray-200">
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl text-gradient font-semibold mb-4 sm:mb-6 text-center">
          Privacy Policy
        </h2>

        <p className="mb-3 text-[13px] xs:text-[14px] sm:text-[18px] md:text-[20px] leading-tight sm:leading-normal text-center">
          Welcome to KAIZEN TRANSPORTATION. By using our service, you agree to
          the following terms and conditions. Your use of the website and
          services constitutes your acceptance of these terms. We reserve the
          right to update these terms at any time without notice. You are
          responsible for reviewing the terms periodically to stay informed of
          any changes.
        </p>

        <p className="mb-3 text-[13px] xs:text-[14px] sm:text-[18px] md:text-[20px] leading-tight sm:leading-normal text-center">
          We collect personal information, including your name, contact
          information, and booking details, to provide you with our transport
          services. We do not share your personal data with third parties except
          as necessary to fulfill your reservation or comply with legal
          obligations. By using our website and services, you consent to our
          collection and use of your information as described in this policy. If
          you have any concerns about your privacy, please contact us at <br />
          <a
            href="mailto:bhattshrey21@gmail.com"
            className="underline hover:text-gray-300 break-all"
          >
            bhattshrey21@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
};

// Disable global header/footer
PrivacyPolicy.noFooter = true;
PrivacyPolicy.noHeader = true;

export default PrivacyPolicy;
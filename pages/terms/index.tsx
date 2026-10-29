"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const TermsAndConditions = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      className="
        relative flex flex-col items-center justify-start
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
          className="absolute left-1/2 -translate-x-1/2 top-4 sm:top-7"
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

        {/* Mobile Menu Button */}
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
      <div className="relative max-w-5xl mx-auto text-gray-200 px-2">
        <h2 className="text-xl xs:text-2xl sm:text-4xl font-semibold text-gradient mb-1 sm:mb-6">
          Terms and Conditions
        </h2>

        <p className="mb-3 text-[13px] xs:text-[14px] sm:text-[20px] leading-tight sm:leading-normal">
          Welcome to KAIZEN TRANSPORTATION. By using our service, you agree to
          the following terms and conditions. Your use of the website and
          services constitutes your acceptance of these terms. We reserve the
          right to update these terms at any time without notice. You are
          responsible for reviewing the terms periodically to stay informed of
          any changes.
        </p>

        <p className="mb-3 text-[13px] xs:text-[14px] sm:text-[20px] leading-tight sm:leading-normal">
          Our services are provided as-is, and we are not responsible for any
          damages arising from the use of our services, including but not
          limited to lost reservations, delayed pickups, or cancellations. By
          booking a ride, you confirm that all the information you provided is
          accurate and that you are authorized to make the reservation.
        </p>

        <p className="text-[13px] xs:text-[14px] sm:text-[20px] leading-tight sm:leading-normal">
          If you have any questions or concerns, please contact us at
          <br />
          <a
            href="mailto:bhattshrey21@gmail.com"
            className="underline hover:text-gray-300 break-all"
          >
            bhattshrey21@gmail.com
          </a>
        </p>
      </div>

      {/* Cancellation & Refund Policy */}
      <div className="relative max-w-5xl mx-auto mt-6 sm:mt-12 text-gray-200 px-2">
        <h3 className="text-lg xs:text-xl sm:text-3xl font-semibold mb-3 sm:mb-5 text-gradient">
          Cancellation and Refund Policy
        </h3>

        <p className="mb-3 text-[13px] xs:text-[14px] sm:text-[20px] leading-tight sm:leading-normal">
          At KAIZEN TRANSPORTATION, we understand that plans can change. That’s
          why we offer a flexible cancellation policy with refunds based on how
          far in advance the reservation is canceled.
        </p>

        <ul className="mx-auto max-w-3xl text-center space-y-2 sm:space-y-3 text-[13px] xs:text-[14px] sm:text-[20px] leading-tight sm:leading-normal">
          <li>
            <span className="font-semibold">
              Cancellations more than 72 hours in advance:
            </span>
            <br />• 100% refund of the paid amount.
          </li>

          <li>
            <span className="font-semibold">
              Cancellations between 48 and 72 hours in advance:
            </span>
            <br />• 80% refund of the paid amount.
          </li>

          <li>
            <span className="font-semibold">
              Cancellations between 24 and 48 hours in advance:
            </span>
            <br />• 50% refund of the paid amount.
          </li>

          <li>
            <span className="font-semibold">
              Cancellations less than 24 hours in advance or no-show:
            </span>
            <br />• No refund applies.
          </li>
        </ul>
      </div>
    </section>
  );
};

// Disable global layout
TermsAndConditions.noFooter = true;
TermsAndConditions.noHeader = true;

export default TermsAndConditions;
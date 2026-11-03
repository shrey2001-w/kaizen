"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import GoogleTranslate from "./GoogleTranslate";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/#services-section" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Track scroll position (passive listener = smoother scrolling)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu when the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close the mobile menu with Escape, and when the screen grows to desktop size
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  // The bar never turns white. Once scrolled (or while the mobile menu is open)
  // it becomes a translucent deep-blue glass, so white text/icons always stay readable.
  const showBarBg = isScrolled || isOpen;

  // Mobile menu panel is white, so mobile links are dark.
  // On desktop (lg) the links are always white (transparent hero bar or blue glass bar).
  const linkClass =
    "block w-full py-3 lg:py-0 text-lg lg:text-[20px] font-medium text-gray-900 lg:text-white transition-colors duration-150 hover:text-[#1B5B97] lg:hover:text-[#7FC0F5] focus-visible:text-[#1B5B97] lg:focus-visible:text-[#7FC0F5] focus:outline-none";

  // Book button: larger, brand-blue gradient, soft shadow, hover lift, press feedback,
  // big touch target on mobile, auto width on desktop.
  const buttonClass =
    "group inline-flex w-full lg:w-auto items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-8 py-4 lg:px-9 lg:py-3.5 text-lg lg:text-xl xl:text-[22px] font-outfit font-semibold tracking-wide text-white bg-gradient-to-r from-[#1B5B97] to-[#2A7BC4] border border-white/20 shadow-lg shadow-[#1B5B97]/40 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1B5B97]/50 hover:brightness-110 active:translate-y-0 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FC0F5] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        showBarBg
          ? "bg-[#0F3A63]/85 shadow-lg backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-9">
        <div className="flex items-center justify-between py-3 lg:py-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex w-[80px] shrink-0 items-center sm:w-[90px] lg:w-[140px]"
          >
            <Image
              src="/images/kaizen3.png"
              width={130}
              height={50}
              alt="Kaizen Transportation logo"
              priority
              className="h-auto w-full object-contain"
            />
          </Link>

          {/* Mobile / tablet controls */}
          <div className="flex items-center gap-3 sm:gap-4 lg:hidden">
            <GoogleTranslate isScrolled={false} />

            <button
              type="button"
              onClick={toggleMenu}
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FC0F5]"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="main-navigation"
            >
              {/* Hamburger -> X icon (absolutely positioned bars, always centered) */}
              <span className="relative block h-5 w-6">
                {/* top bar -> becomes one stroke of the X */}
                <span
                  className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                    isOpen ? "top-[9px] rotate-45" : "top-0 rotate-0"
                  }`}
                />
                {/* middle bar -> fades out */}
                <span
                  className={`absolute left-0 top-[9px] block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                {/* bottom bar -> becomes the other stroke of the X */}
                <span
                  className={`absolute left-0 block h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
                    isOpen ? "top-[9px] -rotate-45" : "top-[18px] rotate-0"
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Navigation:
              - Mobile/tablet: solid white panel that drops down under the header
              - Desktop: inline row */}
          <div
            id="main-navigation"
            className={`main--menu--navigation font-outfit
              absolute left-0 top-full w-full origin-top
              max-h-[calc(100vh-4.5rem)] overflow-y-auto
              border-t border-gray-200 bg-white px-4 py-3 shadow-lg
              transition-all duration-300 ease-in-out sm:px-6
              ${
                isOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0 pointer-events-none"
              }
              lg:visible lg:static lg:flex lg:w-auto lg:max-h-none lg:translate-y-0 lg:flex-row
              lg:items-center lg:gap-14 lg:overflow-visible lg:border-0 lg:bg-transparent
              lg:p-0 lg:opacity-100 lg:shadow-none lg:pointer-events-auto xl:gap-20`}
          >
            <ul className="flex flex-col divide-y divide-gray-200 lg:flex-row lg:items-center lg:gap-14 lg:divide-y-0 xl:gap-20">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass} onClick={closeMenu}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop only: language selector */}
            <div className="hidden lg:flex lg:items-center">
              <GoogleTranslate isScrolled={false} />
            </div>

            {/* Book button */}
            <div className="pb-2 pt-4 lg:p-0">
              <Link href="/booking" className={buttonClass} onClick={closeMenu}>
                <span>Book Now</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
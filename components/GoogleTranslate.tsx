"use client";

import { useEffect, useRef, useState } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

interface GoogleTranslateProps {
  isScrolled?: boolean;
}

const languages = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Español", short: "ES" },
  { code: "hi", label: "हिन्दी", short: "HI" },
  // { code: "pt", label: "Português", short: "PT" },
];

/** Read active language from googtrans cookie — only call client-side */
const getLangFromCookie = (): string => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("googtrans="));
  if (!match) return "en";
  const parts = match.split("=")[1]?.split("/"); // "/en/es" → ["","en","es"]
  return parts?.[2] || "en";
};

const GoogleTranslate = ({ isScrolled = false }: GoogleTranslateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Always "EN" on server — cookie read happens only in useEffect after hydration
  const [currentLang, setCurrentLang] = useState("EN");
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Step 1: Read cookie AFTER hydration to avoid server/client mismatch
    const code = getLangFromCookie();
    const short = languages.find((l) => l.code === code)?.short ?? "EN";
    setCurrentLang(short);
    setMounted(true);

    // Step 2: Hidden Google widget — one instance in the DOM
    if (!document.getElementById("gt-widget-container")) {
      const container = document.createElement("div");
      container.id = "gt-widget-container";
      container.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";
      container.innerHTML = `<div id="google_translate_element"></div>`;
      document.body.appendChild(container);
    }

    // Step 3: Load script once
    if (!document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es,hi",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element",
        );
      };
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Step 4: Suppress Google's banner
    if (!document.getElementById("gt-global-suppress")) {
      const style = document.createElement("style");
      style.id = "gt-global-suppress";
      style.innerHTML = `
        .goog-te-banner-frame { display: none !important; }
        body { top: 0px !important; }
        .gt-trigger-btn:hover { border-color: #c2c2c2 !important; }
        .gt-lang-item:hover { background: var(--gt-hover-bg) !important; }
      `;
      document.head.appendChild(style);
    }

    // Step 5: Close dropdown on outside click
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  const handleLanguageSelect = (code: string, short: string) => {
    const hostname = window.location.hostname;
    const rootDomain = hostname.split(".").slice(-2).join(".");

    // 1️⃣ Clear ALL possible googtrans cookies first
    const expire = "Thu, 01 Jan 1970 00:00:00 UTC";

    // no domain
    document.cookie = `googtrans=; expires=${expire}; path=/;`;

    // current domain
    document.cookie = `googtrans=; expires=${expire}; path=/; domain=${hostname};`;

    // root domain
    document.cookie = `googtrans=; expires=${expire}; path=/; domain=.${rootDomain};`;

    // 2️⃣ If English → just reload (no cookie needed)
    if (code === "en") {
      window.location.reload();
      return;
    }

    // 3️⃣ Set fresh cookie consistently on root domain
    document.cookie = `googtrans=/en/${code}; path=/; domain=.${rootDomain};`;

    window.location.reload();
  };

  const textColor = isScrolled ? "#111111" : "#ffffff";
  const borderColor = isScrolled ? "#000000" : "#ffffff";
  const bgColor = isScrolled ? "#ffffff" : "rgba(255,255,255,0.12)";
  const dropdownBg = isScrolled ? "#000000" : "#1c1c1c";
  const dropdownText = "#ffffff";
  const hoverBg = "#636563";

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative", display: "inline-flex" }}
      // suppress the hydration warning on this subtree only
      suppressHydrationWarning
    >
      <button
        type="button"
        className="gt-trigger-btn"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Select language"
        aria-expanded={isOpen}
        suppressHydrationWarning
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "5px",
          padding: "7px 12px 7px 10px",
          borderRadius: "999px",
          border: `1.5px solid ${borderColor}`,
          background: bgColor,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          color: textColor,
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "inherit",
          cursor: "pointer",
          transition: "border-color 0.2s",
          whiteSpace: "nowrap",
          userSelect: "none",
          WebkitUserSelect: "none",
          minHeight: "36px",
          minWidth: "76px",
          outline: "none",
        }}
      >
        <Languages
          size={14}
          strokeWidth={2}
          style={{ pointerEvents: "none", flexShrink: 0 }}
          aria-hidden="true"
        />
        {/* suppressHydrationWarning lets React skip the EN→ES/HI mismatch warning */}
        <span style={{ pointerEvents: "none" }} suppressHydrationWarning>
          {currentLang}
        </span>
        <ChevronDown
          size={11}
          strokeWidth={2.5}
          aria-hidden="true"
          style={{
            pointerEvents: "none",
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Only render dropdown after mount to avoid SSR issues */}
      {mounted && isOpen && (
        <div
          role="listbox"
          aria-label="Language options"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: "140px",
            background: dropdownBg,
            border: `1px solid ${borderColor}`,
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 9999,
            ["--gt-hover-bg" as any]: hoverBg,
          }}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={currentLang === l.short}
              className="gt-lang-item"
              onClick={() => handleLanguageSelect(l.code, l.short)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "10px 14px",
                minHeight: "44px",
                background: currentLang === l.short ? hoverBg : "transparent",
                color: dropdownText,
                fontSize: "13px",
                fontWeight: currentLang === l.short ? 600 : 400,
                fontFamily: "inherit",
                cursor: "pointer",
                border: "none",
                textAlign: "left",
                transition: "background 0.15s",
              }}
            >
              <span style={{ width: 14, flexShrink: 0 }}>
                {currentLang === l.short && (
                  <Check
                    size={12}
                    strokeWidth={3}
                    color="#fff"
                    aria-hidden="true"
                  />
                )}
              </span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
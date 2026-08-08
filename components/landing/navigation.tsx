"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Media", href: "#how-it-works" },
  { name: "Reviews", href: "#testamonials" },
  { name: "Pricing", href: "#pricing" },
  { name: "Us", href: "#infrastructure" },
  { name: "Contact", href: "#footer" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* =========================
          DESKTOP / NORMAL NAV
          ========================= */}
      <header
        className={`fixed z-50 transition-all duration-500 ${
          isScrolled
            ? "top-4 left-4 right-4"
            : "top-0 left-0 right-0"
        }`}
      >
        <nav
          className={`mx-auto transition-all duration-500 ${
            isScrolled
              ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
              : "bg-transparent max-w-[1400px]"
          }`}
        >
          <div
            className={`flex items-center justify-between px-6 lg:px-8 transition-all duration-500 ${
              isScrolled ? "h-14" : "h-20"
            }`}
          >
            {/* Logo */}
            <a
              href="#"
              onClick={closeMobileMenu}
              className={`tracking-tight transition-all duration-500 ${
    isScrolled ? "text-xl" : "text-2xl"
  }`}
  style={{ fontFamily: "MediQLogo, sans-serif" }}
            >
              MediQ

              <span
                className={`font-mono transition-all duration-500 ${
                  isScrolled
                    ? "text-[10px] mt-0.5"
                    : "text-xs mt-1"
                }`}
                style={{ color: "#1f71a1" }}
              >
                
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-12">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
                >
                  {link.name}

                  <span
                    className="absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #1f71a1, #46a65c)",
                    }}
                  />
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="#security"
                className={`group text-foreground/70 hover:text-foreground transition-all duration-500 ${
                  isScrolled ? "text-xs" : "text-sm"
                }`}
              >
                <span className="transition-colors duration-300 group-hover:text-[#1f71a1]">
                  Find us
                </span>
              </a>

              <Button
                size="sm"
                className={`bg-foreground hover:bg-foreground/90 text-background rounded-full transition-all duration-500 ${
                  isScrolled ? "px-4 h-8 text-xs" : "px-6"
                }`}
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(31,113,161,0.35), 0 0 0 2px rgba(70,166,92,0.15)",
                }}
                onClick={() =>
                  window.open(
                    "https://forms.gle/18KshEMPAuw6mUAc6",
                    "_blank"
                  )
                }
              >
                Apply for Mentorship
              </Button>
            </div>

            {/* Desktop-hidden mobile button placeholder */}
            <div className="md:hidden w-10 h-10" />
          </div>
        </nav>
      </header>

      {/* =========================
          MOBILE MENU
          ========================= */}
      <div
        className={`md:hidden fixed inset-0 z-[100] bg-background transition-opacity duration-500 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Mobile menu header */}
        <div className="absolute top-0 left-0 right-0 h-20 px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={closeMobileMenu}
            className="font-display text-2xl tracking-tight"
            style={{ fontFamily: "MediQLogo, sans-serif" }}
          >
            MediQ

            <span
              className="font-mono text-xs ml-0.5"
              style={{ color: "#1f71a1" }}
            >
              
            </span>
          </a>

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center rounded-full text-foreground hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
          >
            <X
              className="w-6 h-6"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* Mobile content */}
        <div className="flex flex-col h-full px-6 pt-24 pb-6">
          {/* Navigation links */}
          <div className="flex-1 flex flex-col justify-center gap-5">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={closeMobileMenu}
                className={`text-4xl sm:text-5xl font-display transition-all duration-500 ${
                  i % 2 === 0
                    ? "text-[#1f71a1] hover:text-[#46a65c]"
                    : "text-[#46a65c] hover:text-[#1f71a1]"
                } ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
                style={{
                  transitionDelay: isMobileMenuOpen
                    ? `${i * 60}ms`
                    : "0ms",
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Bottom CTAs */}
          <div
            className={`pt-6 border-t border-foreground/10 transition-all duration-500 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDelay: isMobileMenuOpen
                ? "300ms"
                : "0ms",
            }}
          >
            <div className="flex gap-2">
              {/* Find us */}
              <a
                href="#security"
                onClick={closeMobileMenu}
                className="flex-1 min-w-0"
              >
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-full px-2 text-xs sm:text-sm whitespace-nowrap hover:text-[#1f71a1] transition-colors"
                >
                  Find us
                </Button>
              </a>

              {/* Apply */}
              <Button
                className="flex-1 min-w-0 h-12 rounded-full px-2 text-xs sm:text-sm whitespace-nowrap bg-foreground text-background hover:bg-foreground/90"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(31,113,161,0.35), 0 0 0 2px rgba(70,166,92,0.15)",
                }}
                onClick={() => {
                  closeMobileMenu();

                  window.open(
                    "https://forms.gle/18KshEMPAuw6mUAc6",
                    "_blank"
                  );
                }}
              >
                Apply for Mentorship
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          MOBILE MENU TOGGLE
          =========================
          
          This is deliberately OUTSIDE both
          the desktop nav and mobile overlay.
      */}
      <button
        type="button"
        onClick={() =>
          setIsMobileMenuOpen((prev) => !prev)
        }
        aria-label={
          isMobileMenuOpen
            ? "Close menu"
            : "Open menu"
        }
        aria-expanded={isMobileMenuOpen}
        className={`md:hidden fixed z-[200] top-5 right-6 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
          isMobileMenuOpen
            ? "text-foreground"
            : "text-foreground hover:bg-foreground/5"
        }`}
      >
        {isMobileMenuOpen ? (
          <X
            className="w-6 h-6"
            strokeWidth={2}
          />
        ) : (
          <Menu
            className="w-6 h-6"
            strokeWidth={2}
          />
        )}
      </button>
    </>
  );
}
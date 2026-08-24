"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";

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

  return (
    <header
      className={`fixed z-[60] transition-all duration-500 ${
        isScrolled ? "top-4 left-4 right-4" : "top-0 left-0 right-0"
      }`}
    >
      <nav
          className={`relative z-[60] mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
          <a
            className={`tracking-tight transition-all duration-500 ${
            isScrolled ? "text-xl" : "text-2xl"
            }`}
            style={{ fontFamily: "MediQLogo, sans-serif" }}
          >
            MediQ

            <span
              className={`font-mono transition-all duration-500 ${
                isScrolled ? "text-[10px] mt-0.5" : "text-xs mt-1"
              }`}
              style={{
                color: "#1f71a1",
              }}
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
              href="https://forms.gle/18KshEMPAuw6mUAc6"
              className={`group text-foreground/70 hover:text-foreground transition-all duration-500 ${
                isScrolled ? "text-xs" : "text-sm"
              }`}
            >
              <span className="transition-colors duration-300 group-hover:text-[#1f71a1]">
                Apply To Mentorship
              </span>
            </a>

          <Link href="/login">
            <Button
              size="sm"
              className={`bg-foreground hover:bg-foreground/90 text-background rounded-full transition-all duration-500 ${
                isScrolled ? "px-4 h-8 text-xs" : "px-6"
              }`}
              style={{
                boxShadow:
                  "0 0 0 1px rgba(31,113,161,0.35), 0 0 0 2px rgba(70,166,92,0.15)",
              }}
            >
              Log Into Mentorship
            </Button>
          </Link>
          </div>



          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 relative z-50"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-50 transition-all duration-500 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Subtle MediQ background mark */}
        <div
          className={`absolute right-[-30px] top-1/2 -translate-y-1/2 font-display text-[18rem] leading-none select-none pointer-events-none transition-all duration-1000 ${
            isMobileMenuOpen
              ? "opacity-[0.025] translate-x-0"
              : "opacity-0 translate-x-12"
          }`}
        >
          M
        </div>

        <div className="relative z-10 flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-6">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-baseline gap-4 text-[clamp(2.5rem,10vw,4rem)] leading-none font-display transition-all duration-500 ${
                  isMobileMenuOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                } ${
                  i % 2 === 0
                    ? "hover:text-[#1f71a1]"
                    : "hover:text-[#46a65c]"
                }`}
                style={{
                  transitionDelay: isMobileMenuOpen
                    ? `${i * 90}ms`
                    : "0ms",
                }}
              >
                {/* Number */}
                <span
                  className={`font-mono text-xs shrink-0 transition-colors duration-300 ${
                    i % 2 === 0
                      ? "text-[#1f71a1]/50 group-hover:text-[#1f71a1]"
                      : "text-[#46a65c]/50 group-hover:text-[#46a65c]"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Link name */}
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  {link.name}
                </span>
              </a>
            ))}
          </div>

          {/* Bottom Actions */}
          <div
            className={`pt-8 border-t border-foreground/10 transition-all duration-700 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              transitionDelay: isMobileMenuOpen ? "550ms" : "0ms",
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              {/* Find Us */}
              <a
                href="#security"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-16 rounded-2xl border border-[#1f71a1]/20 bg-[#1f71a1]/[0.04] flex flex-col items-center justify-center transition-all duration-300 hover:bg-[#1f71a1]/[0.09] hover:border-[#1f71a1]/40"
              >
                <span className="text-sm font-medium">
                  Find us
                </span>

                <span className="text-[10px] font-mono text-muted-foreground mt-1">
                  OUR CHANNELS
                </span>
              </a>

              {/* Apply */}
              <button
                onClick={() =>
                  window.open(
                    "https://forms.gle/18KshEMPAuw6mUAc6",
                    "_blank"
                  )
                }
                className="h-16 rounded-2xl bg-[#46a65c] text-white flex flex-col items-center justify-center transition-all duration-300 hover:bg-[#3d914f]"
              >
                <span className="text-sm font-medium">
                  Apply for Mentorship
                </span>

                <span className="text-[10px] font-mono text-white/60 mt-1">
                  JOIN MEDIQ
                </span>
              </button>
            </div>

            {/* Tiny footer identity */}
            <div className="flex items-center justify-between mt-5">
              <span className="text-[10px] font-mono text-muted-foreground">
                MEDIQ™
              </span>

              <span className="text-[10px] font-mono text-muted-foreground">
                MEDICAL • EDUCATION • COMMUNITY
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
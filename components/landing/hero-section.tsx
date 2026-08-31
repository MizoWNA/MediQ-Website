"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedSphere } from "./animated-sphere";

const words = ["notes", "mindmaps", "lessons", "mentorship"];

export function HeroSection() {
const [isVisible, setIsVisible] = useState(false);
const [wordIndex, setWordIndex] = useState(0);

useEffect(() => {
setIsVisible(true);
}, []);

useEffect(() => {
const interval = setInterval(() => {
setWordIndex((prev) => (prev + 1) % words.length);
}, 2500);

return () => clearInterval(interval);


}, []);

return ( <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
{/* Animated sphere background */} <div className="pointer-events-none absolute right-0 top-1/2 h-[600px] w-[600px] -translate-y-1/2 opacity-40 lg:h-[800px] lg:w-[800px]"> <AnimatedSphere /> </div>

  {/* Subtle grid lines */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
    {[...Array(8)].map((_, i) => {
      const isAccent = i === 1 || i === 5;
      const isBlue = i === 1;

      return (
        <div
          key={`h-${i}`}
          className="absolute h-px"
          style={{
            top: `${12.5 * (i + 1)}%`,
            left: 0,
            right: 0,
            backgroundColor: isAccent
              ? isBlue
                ? "var(--mediq-blue)"
                : "var(--mediq-green)"
              : "currentColor",
            opacity: isAccent ? 0.16 : 0.1,
          }}
        />
      );
    })}

    {[...Array(12)].map((_, i) => {
      const isAccent = i === 3 || i === 9;
      const isBlue = i === 3;

      return (
        <div
          key={`v-${i}`}
          className="absolute w-px"
          style={{
            left: `${8.33 * (i + 1)}%`,
            top: 0,
            bottom: 0,
            backgroundColor: isAccent
              ? isBlue
                ? "var(--mediq-blue)"
                : "var(--mediq-green)"
              : "currentColor",
            opacity: isAccent ? 0.16 : 0.1,
          }}
        />
      );
    })}
  </div>

  <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-32 lg:px-12 lg:py-40">
    {/* Eyebrow */}
    <div
      className={`mb-8 transition-all duration-700 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
        <span
          className="h-px w-8"
          style={{
            background:
              "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
          }}
        />

        The platform for modern doctors
      </span>
    </div>

    {/* Main headline */}
    <div className="mb-12">
      <h1
        className={`font-display text-[clamp(3rem,12vw,10rem)] leading-[0.9] tracking-tight transition-all duration-1000 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <span className="block">Your platform</span>

        <span className="mt-3 block sm:mt-2 lg:mt-3">
          for{" "}
          <span className="relative inline-block">
            <span
              key={wordIndex}
              className="inline-flex"
              style={{
                color:
                  wordIndex % 2 === 0
                    ? "var(--mediq-blue)"
                    : "var(--mediq-green)",
              }}
            >
              {words[wordIndex].split("").map((char, i) => (
                <span
                  key={`${wordIndex}-${i}`}
                  className="inline-block animate-char-in"
                  style={{
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {char}
                </span>
              ))}
            </span>

            <span
              className="absolute -bottom-1 left-0 right-0 h-[3px] opacity-80 lg:-bottom-2 lg:h-2"
              style={{
                background:
                  "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
              }}
            />

            <span
              className="absolute -right-2 -top-1.5 h-1.5 w-1.5 rounded-full lg:-right-3 lg:-top-2 lg:h-2 lg:w-2"
              style={{
                backgroundColor:
                  wordIndex % 2 === 0
                    ? "var(--mediq-blue)"
                    : "var(--mediq-green)",
                boxShadow:
                  wordIndex % 2 === 0
                    ? "0 0 8px var(--mediq-blue)"
                    : "0 0 12px var(--mediq-green)",
              }}
            />
          </span>
        </span>
      </h1>
    </div>

    {/* Description + CTAs */}
    <div className="grid items-end gap-10 lg:grid-cols-2 lg:gap-24">
      <div>
        <p
          className={`max-w-xl text-xl leading-relaxed text-muted-foreground transition-all delay-200 duration-700 lg:text-2xl ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          We're with you from day one until the day you graduate.
        </p>

        {/* Mentorship Actions */}
        <div
          className={`mt-8 flex flex-col gap-3 transition-all delay-300 duration-700 sm:flex-row ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          {/* Log In */}
          <Link
            href="/login"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-foreground px-7 text-sm font-medium text-background transition-all duration-300 hover:bg-foreground/90 sm:px-8"
            style={{
              boxShadow:
                "0 0 0 1px rgba(31,113,161,0.35), 0 0 0 2px rgba(70,166,92,0.15)",
            }}
          >
            Log Into Mentorship

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Sign Up */}
          <Link
            href="/signup"
            className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-foreground/15 bg-foreground/[0.03] px-7 text-sm font-medium text-foreground/80 backdrop-blur-sm transition-all duration-300 hover:border-[#1f71a1]/40 hover:bg-[#1f71a1]/[0.05] hover:text-foreground sm:px-8"
          >
            Sign Up for Mentorship

            <span className="h-1.5 w-1.5 rounded-full bg-[#46a65c] opacity-60 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-[0_0_8px_#46a65c]" />
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>

);
}

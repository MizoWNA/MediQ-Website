"use client";

import { useEffect, useState } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({
  onComplete,
}: BootSequenceProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      // Atmosphere
      window.setTimeout(() => setPhase(1), 350),

      // Logo
      window.setTimeout(() => setPhase(2), 850),

      // Brand
      window.setTimeout(() => setPhase(3), 1400),

      // Platform label
      window.setTimeout(() => setPhase(4), 1950),

      // Progress line
      window.setTimeout(() => setPhase(5), 2450),

      // Preparing status
      window.setTimeout(() => setPhase(6), 2950),

      // Start fading out
      window.setTimeout(() => setPhase(7), 4050),

      // Fully complete
      window.setTimeout(() => onComplete(), 4700),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b0d10] transition-opacity duration-650 ${
        phase >= 7 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ============================================================
          ATMOSPHERE
          ============================================================ */}

      <div className="pointer-events-none absolute inset-0">
        {/* Main blue glow */}

        <div
          className={`absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.065] blur-[140px] transition-all duration-[1600ms] ease-out ${
            phase >= 1
              ? "scale-125 opacity-100"
              : "scale-75 opacity-0"
          }`}
        />

        {/* Secondary glow */}

        <div
          className={`absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#46a65c]/[0.025] blur-[100px] transition-all duration-[1800ms] ${
            phase >= 3
              ? "scale-150 opacity-100"
              : "scale-50 opacity-0"
          }`}
        />

        {/* Grid */}

        <div
          className={`absolute inset-0 transition-opacity duration-[1400ms] ${
            phase >= 1
              ? "opacity-[0.025]"
              : "opacity-0"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Vignette */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0d10/30%_65%,#0b0d10_100%)]" />
      </div>

      {/* ============================================================
          CENTER
          ============================================================ */}

      <div className="relative z-10 flex flex-col items-center">
        {/* ============================================================
            LOGO
            ============================================================ */}

        <div
          className={`relative flex h-28 w-28 items-center justify-center transition-all duration-900 ease-out ${
            phase >= 2
              ? "scale-100 opacity-100"
              : "scale-85 opacity-0"
          }`}
        >
          {/* Glow */}

          <div
            className={`absolute inset-[-18px] rounded-[34px] bg-[#1f71a1]/[0.12] blur-3xl transition-all duration-[1200ms] ${
              phase >= 3
                ? "scale-110 opacity-100"
                : "scale-75 opacity-0"
            }`}
          />

          {/* Logo container */}

          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/[0.08] bg-[#111419]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(31,113,161,0.14), 0 0 0 2px rgba(70,166,92,0.05), 0 20px 60px rgba(0,0,0,0.35)",
            }}
          >
            <img
              src="/mediq.svg"
              alt="MediQ"
              className="h-12 w-12 object-contain"
            />
          </div>
        </div>

        {/* ============================================================
            BRAND
            ============================================================ */}

        <div
          className={`mt-6 text-sm font-semibold tracking-[0.34em] text-white transition-all duration-700 ease-out ${
            phase >= 3
              ? "translate-y-0 opacity-85"
              : "translate-y-3 opacity-0"
          }`}
        >
          MEDIQ
        </div>

        {/* ============================================================
            PLATFORM
            ============================================================ */}

        <div
          className={`mt-3 flex items-center gap-2.5 transition-all duration-700 ease-out ${
            phase >= 4
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#5aa9d8] shadow-[0_0_10px_rgba(90,169,216,0.45)]" />

          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/30">
            Mentorship Platform
          </span>
        </div>

        {/* ============================================================
            PROGRESS
            ============================================================ */}

        <div
          className={`mt-9 h-px w-52 overflow-hidden bg-white/[0.07] transition-opacity duration-700 ${
            phase >= 5
              ? "opacity-100"
              : "opacity-0"
          }`}
        >
          <div
            className={`h-full w-full bg-gradient-to-r from-transparent via-[#5aa9d8]/70 to-transparent transition-transform duration-[1100ms] ease-out ${
              phase >= 5
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
          />
        </div>

        {/* ============================================================
            STATUS
            ============================================================ */}

        <div
          className={`mt-4 text-[9px] font-medium uppercase tracking-[0.2em] text-white/20 transition-all duration-700 ${
            phase >= 6
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          Preparing your workspace
        </div>
      </div>
    </div>
  );
}
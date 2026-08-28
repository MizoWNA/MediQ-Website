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
      window.setTimeout(() => setPhase(1), 250),
      window.setTimeout(() => setPhase(2), 650),
      window.setTimeout(() => setPhase(3), 1100),
      window.setTimeout(() => setPhase(4), 1550),
      window.setTimeout(() => onComplete(), 2050),
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [onComplete]);

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b0d10] transition-opacity duration-500 ${
        phase >= 4 ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Atmosphere */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className={`absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.06] blur-[120px] transition-all duration-1000 ${
            phase >= 2
              ? "scale-125 opacity-100"
              : "scale-75 opacity-0"
          }`}
        />

        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            phase >= 2 ? "opacity-[0.025]" : "opacity-0"
          }`}
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Center */}

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}

        <div
          className={`relative flex h-20 w-20 items-center justify-center transition-all duration-700 ${
            phase >= 1
              ? "scale-100 opacity-100"
              : "scale-90 opacity-0"
          }`}
        >
          <div
            className={`absolute inset-[-12px] rounded-[28px] bg-[#1f71a1]/10 blur-2xl transition-opacity duration-700 ${
              phase >= 2 ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#111419]"
            style={{
              boxShadow:
                "0 0 0 1px rgba(31,113,161,0.12), 0 0 0 2px rgba(70,166,92,0.04)",
            }}
          >
            <img
              src="/mediq.svg"
              alt="MediQ"
              className="h-10 w-10 object-contain"
            />
          </div>
        </div>

        {/* Brand */}

        <div
          className={`mt-5 text-[11px] font-semibold tracking-[0.28em] text-white transition-all duration-500 ${
            phase >= 2
              ? "translate-y-0 opacity-80"
              : "translate-y-2 opacity-0"
          }`}
        >
          MEDIQ
        </div>

        {/* System text */}

        <div
          className={`mt-2 flex items-center gap-2 transition-all duration-500 ${
            phase >= 3
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          <span className="h-1 w-1 rounded-full bg-[#5aa9d8]" />

          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">
            Mentorship Platform
          </span>
        </div>

        {/* Boot line */}

        <div
          className={`mt-7 h-px w-40 overflow-hidden bg-white/[0.06] transition-opacity duration-500 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`h-full bg-gradient-to-r from-transparent via-[#5aa9d8]/60 to-transparent transition-transform duration-700 ease-out ${
              phase >= 3
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
          />
        </div>

        {/* Status */}

        <div
          className={`mt-3 text-[8px] uppercase tracking-[0.18em] text-white/15 transition-opacity duration-500 ${
            phase >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          Preparing your workspace
        </div>
      </div>
    </div>
  );
}
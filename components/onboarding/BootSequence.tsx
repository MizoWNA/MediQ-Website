"use client";

import { useEffect, useState } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({
  onComplete,
}: BootSequenceProps) {
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    /*
     * ================================================================
     * BOOT TIMELINE
     *
     * 0ms     — Initial black screen
     * 350ms   — Logo appears
     * 850ms   — Brand appears
     * 1250ms  — Platform label appears
     * 1650ms  — Preparing line appears
     * 2150ms  — Everything settles
     * 2550ms  — Begin exit
     * 3100ms  — Hand control back to onboarding
     * ================================================================
     */

    const timers = [
      window.setTimeout(() => {
        setPhase(1);
      }, 350),

      window.setTimeout(() => {
        setPhase(2);
      }, 850),

      window.setTimeout(() => {
        setPhase(3);
      }, 1250),

      window.setTimeout(() => {
        setPhase(4);
      }, 1650),

      window.setTimeout(() => {
        setPhase(5);
      }, 2150),

      window.setTimeout(() => {
        setExiting(true);
      }, 2550),

      window.setTimeout(() => {
        onComplete();
      }, 3100),
    ];

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [onComplete]);

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b0d10] transition-opacity duration-500 ease-out ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* ============================================================
          ATMOSPHERE
          ============================================================ */}

      <div className="pointer-events-none absolute inset-0">
        {/* Main blue glow */}

        <div
          className={`absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.06] blur-[120px] transition-all duration-[1400ms] ease-out ${
            phase >= 1
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          }`}
        />

        {/* Secondary glow */}

        <div
          className={`absolute bottom-[-180px] right-[-100px] h-[380px] w-[380px] rounded-full bg-[#46a65c]/[0.025] blur-[120px] transition-all duration-[1800ms] ease-out ${
            phase >= 3
              ? "scale-100 opacity-100"
              : "scale-75 opacity-0"
          }`}
        />

        {/* Grid */}

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

        {/* Vignette */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0d10/30%_65%,#0b0d10_100%)]" />
      </div>

      {/* ============================================================
          CENTER
          ============================================================ */}

      <div className="relative z-10 flex flex-col items-center">

        {/* ==========================================================
            LOGO
            ========================================================== */}

        <div
          className={`relative flex h-20 w-20 items-center justify-center transition-all duration-[900ms] ease-out ${
            phase >= 1
              ? "scale-100 opacity-100"
              : "scale-90 opacity-0"
          }`}
        >
          {/* Glow */}

          <div
            className={`absolute inset-[-14px] rounded-[28px] bg-[#1f71a1]/10 blur-2xl transition-all duration-[1200ms] ${
              phase >= 2
                ? "scale-110 opacity-100"
                : "scale-75 opacity-0"
            }`}
          />

          {/* Logo container */}

          <div
            className={`relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#111419] transition-all duration-700 ${
              phase >= 1
                ? "scale-100"
                : "scale-90"
            }`}
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

        {/* ==========================================================
            BRAND
            ========================================================== */}

        <div
          className={`mt-5 text-[11px] font-semibold tracking-[0.28em] text-white transition-all duration-700 ease-out ${
            phase >= 2
              ? "translate-y-0 opacity-80"
              : "translate-y-3 opacity-0"
          }`}
        >
          MEDIQ
        </div>

        {/* ==========================================================
            PLATFORM LABEL
            ========================================================== */}

        <div
          className={`mt-2 flex items-center gap-2 transition-all duration-700 ease-out ${
            phase >= 3
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          <span
            className={`h-1 w-1 rounded-full bg-[#5aa9d8] transition-all duration-500 ${
              phase >= 3
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0"
            }`}
          />

          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">
            Mentorship Platform
          </span>
        </div>

        {/* ==========================================================
            PROGRESS LINE
            ========================================================== */}

        <div
          className={`mt-7 h-px w-44 overflow-hidden bg-white/[0.06] transition-opacity duration-700 ${
            phase >= 4 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`h-full w-full bg-gradient-to-r from-transparent via-[#5aa9d8]/70 to-transparent transition-transform duration-[900ms] ease-out ${
              phase >= 4
                ? "translate-x-0"
                : "-translate-x-full"
            }`}
          />
        </div>

        {/* ==========================================================
            STATUS
            ========================================================== */}

        <div
          className={`mt-3 text-[8px] uppercase tracking-[0.18em] text-white/15 transition-all duration-700 ease-out ${
            phase >= 4
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          Preparing your workspace
        </div>

        {/* ==========================================================
            READY INDICATOR
            ========================================================== */}

        <div
          className={`mt-5 flex items-center gap-2 transition-all duration-700 ease-out ${
            phase >= 5
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#46a65c]/70 shadow-[0_0_10px_rgba(70,166,92,0.35)]" />

          <span className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/20">
            Ready
          </span>
        </div>
      </div>

      {/* ============================================================
          EXIT VEIL
          ============================================================ */}

      <div
        className={`pointer-events-none absolute inset-0 bg-[#0b0d10] transition-opacity duration-500 ${
          exiting ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
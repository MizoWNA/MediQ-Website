"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Crosshair,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

/*
 * ================================================================
 * READY SECTION
 * ================================================================
 *
 * The final onboarding moment.
 *
 * Instead of introducing another feature, this section brings
 * everything together around MediQ.
 *
 * Animation:
 *
 *   1. MediQ logo appears
 *   2. Four subtle connection lines draw outward
 *   3. Mentor / Plan / Tasks / Progress appear
 *   4. The system gently settles
 *   5. Final message fades in
 *
 * No external data.
 * No Supabase.
 * Fully self-contained.
 * ================================================================
 */

const ITEMS = [
  {
    label: "Mentor",
    icon: GraduationCap,
    side: "left",
    position: "top-[18%]",
  },
  {
    label: "Plan",
    icon: ClipboardList,
    side: "right",
    position: "top-[18%]",
  },
  {
    label: "Tasks",
    icon: Crosshair,
    side: "left",
    position: "bottom-[18%]",
  },
  {
    label: "Progress",
    icon: TrendingUp,
    side: "right",
    position: "bottom-[18%]",
  },
];

export default function ReadySection() {
  const [started, setStarted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showMessage, setShowMessage] =
    useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => {
      setStarted(true);
    }, 350);

    const connectionTimer = window.setTimeout(() => {
      setConnected(true);
    }, 1250);

    const messageTimer = window.setTimeout(() => {
      setShowMessage(true);
    }, 2700);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(connectionTimer);
      window.clearTimeout(messageTimer);
    };
  }, []);

  return (
    <section className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-5 py-6 text-white sm:px-8">
      {/* =========================================================
       * AMBIENT LIGHT
       * ========================================================= */}

      <div
        className={[
          "pointer-events-none absolute left-1/2 top-[39%]",
          "h-[460px] w-[460px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full bg-[#1f71a1]/[0.035] blur-[140px]",
          "transition-all duration-[2200ms]",
          started
            ? "scale-100 opacity-100"
            : "scale-75 opacity-0",
        ].join(" ")}
      />

      <div
        className={[
          "pointer-events-none absolute left-1/2 top-[39%]",
          "h-[220px] w-[220px]",
          "-translate-x-1/2 -translate-y-1/2",
          "rounded-full bg-[#46a65c]/[0.025] blur-[90px]",
          "transition-all duration-[2000ms]",
          connected
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0",
        ].join(" ")}
      />

      {/* =========================================================
       * CONTENT
       * ========================================================= */}

      <div className="relative z-10 flex h-full w-full max-w-3xl flex-col items-center justify-center">
        {/* =======================================================
         * SYSTEM VISUAL
         * ======================================================= */}

        <div className="relative h-[300px] w-full sm:h-[330px]">
          {/* -----------------------------------------------------
           * CONNECTION LINES
           * ----------------------------------------------------- */}

          {/* Top left */}
          <div
            className={[
              "absolute left-[20%] top-[28%]",
              "h-px origin-left",
              "bg-gradient-to-r from-[#5aa9d8]/30 to-white/[0.04]",
              "transition-all duration-[1000ms]",
              connected
                ? "w-[23%] opacity-100"
                : "w-0 opacity-0",
            ].join(" ")}
          />

          {/* Top right */}
          <div
            className={[
              "absolute right-[20%] top-[28%]",
              "h-px origin-right",
              "bg-gradient-to-l from-[#5aa9d8]/30 to-white/[0.04]",
              "transition-all duration-[1000ms]",
              connected
                ? "w-[23%] opacity-100"
                : "w-0 opacity-0",
            ].join(" ")}
          />

          {/* Bottom left */}
          <div
            className={[
              "absolute bottom-[28%] left-[20%]",
              "h-px origin-left",
              "bg-gradient-to-r from-[#5aa9d8]/20 to-white/[0.03]",
              "transition-all duration-[1000ms]",
              connected
                ? "w-[23%] opacity-100"
                : "w-0 opacity-0",
            ].join(" ")}
          />

          {/* Bottom right */}
          <div
            className={[
              "absolute bottom-[28%] right-[20%]",
              "h-px origin-right",
              "bg-gradient-to-l from-[#5aa9d8]/20 to-white/[0.03]",
              "transition-all duration-[1000ms]",
              connected
                ? "w-[23%] opacity-100"
                : "w-0 opacity-0",
            ].join(" ")}
          />

          {/* -----------------------------------------------------
           * SMALL CONNECTION NODES
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-[19%] top-[calc(28%-2px)]",
              "h-1 w-1 rounded-full bg-[#5aa9d8]/40",
              "transition-all duration-700",
              connected
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "absolute right-[19%] top-[calc(28%-2px)]",
              "h-1 w-1 rounded-full bg-[#5aa9d8]/40",
              "transition-all duration-700",
              connected
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "absolute bottom-[calc(28%-2px)] left-[19%]",
              "h-1 w-1 rounded-full bg-[#5aa9d8]/30",
              "transition-all duration-700",
              connected
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "absolute bottom-[calc(28%-2px)] right-[19%]",
              "h-1 w-1 rounded-full bg-[#5aa9d8]/30",
              "transition-all duration-700",
              connected
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0",
            ].join(" ")}
          />

          {/* -----------------------------------------------------
           * FOUR CONCEPTS
           * ----------------------------------------------------- */}

          {ITEMS.map((item, index) => {
            const Icon = item.icon;

            const isLeft = item.side === "left";

            return (
              <div
                key={item.label}
                className={[
                  "absolute",
                  item.position,
                  isLeft
                    ? "left-[6%] sm:left-[11%]"
                    : "right-[6%] sm:right-[11%]",
                  "transition-all duration-[1000ms]",
                  connected
                    ? "translate-y-0 scale-100 opacity-100"
                    : isLeft
                      ? "-translate-x-5 scale-95 opacity-0"
                      : "translate-x-5 scale-95 opacity-0",
                ].join(" ")}
                style={{
                  transitionDelay: `${index * 120}ms`,
                }}
              >
                <div
                  className={[
                    "flex items-center gap-2.5",
                    isLeft
                      ? "flex-row"
                      : "flex-row-reverse",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center",
                      "rounded-xl border",
                      "bg-[#111419]/90",
                      "backdrop-blur-sm",
                      "transition-all duration-1000",
                      connected
                        ? "border-white/[0.08]"
                        : "border-transparent",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 text-white/35" />
                  </div>

                  <span
                    className={[
                      "text-[10px] font-medium uppercase",
                      "tracking-[0.16em] text-white/25",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}

          {/* -----------------------------------------------------
           * CENTRAL RINGS
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-1/2 top-1/2",
              "h-[150px] w-[150px]",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border border-white/[0.045]",
              "transition-all duration-[1600ms]",
              started
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "absolute left-1/2 top-1/2",
              "h-[112px] w-[112px]",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border border-[#5aa9d8]/[0.10]",
              "transition-all duration-[1600ms]",
              connected
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0",
            ].join(" ")}
          />

          {/* -----------------------------------------------------
           * MEDIQ LOGO
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-1/2 top-1/2 z-20",
              "flex h-[78px] w-[78px]",
              "-translate-x-1/2 -translate-y-1/2",
              "items-center justify-center",
              "rounded-[24px]",
              "border border-white/[0.09]",
              "bg-[#111419]",
              "transition-all duration-[1200ms]",
              started
                ? "scale-100 opacity-100"
                : "scale-75 opacity-0",
            ].join(" ")}
            style={{
              boxShadow:
                connected
                  ? "0 0 0 1px rgba(31,113,161,0.14), 0 0 55px rgba(31,113,161,0.07)"
                  : "0 0 0 1px rgba(31,113,161,0.08)",
            }}
          >
            <img
              src="/mediq.svg"
              alt="MediQ"
              className="relative z-10 h-11 w-11 object-contain"
            />
          </div>

          {/* -----------------------------------------------------
           * CENTER PULSE
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-1/2 top-1/2 z-30",
              "h-1.5 w-1.5",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full bg-[#5aa9d8]/60",
              "transition-all duration-700",
              connected
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0",
            ].join(" ")}
            style={{
              boxShadow:
                "0 0 14px rgba(90,169,216,0.4)",
            }}
          />
        </div>

        {/* =======================================================
         * FINAL MESSAGE
         * ======================================================= */}

        <div
          className={[
            "-mt-1 text-center",
            "transition-all duration-[1200ms]",
            showMessage
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0",
          ].join(" ")}
        >
          <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            You're ready.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/35 sm:text-base">
            Your mentor, your plan, your tasks,
            <br className="hidden sm:block" />
            and your progress — all in one place.
          </p>

          <p
            className={[
              "mt-7 text-[10px] font-medium uppercase",
              "tracking-[0.18em] text-white/20",
              "transition-opacity duration-1000 delay-300",
              showMessage
                ? "opacity-100"
                : "opacity-0",
            ].join(" ")}
          >
            Take it one step at a time.
          </p>
        </div>
      </div>

      {/* =========================================================
       * REDUCED MOTION
       * ========================================================= */}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            transition-duration: 1ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </section>
  );
}

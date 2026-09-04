"use client";

import { useEffect, useState } from "react";
import {
  Check,
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
 * Final onboarding moment.
 *
 * The four things the student has just been introduced to:
 *
 *   Mentor
 *   Plan
 *   Tasks
 *   Progress
 *
 * gradually come together around MediQ before the final message
 * appears.
 *
 * This is intentionally self-contained.
 * No Supabase.
 * No external data.
 * ================================================================
 */

const TIMINGS = {
  start: 500,
  itemStep: 750,
  settle: 1100,
  message: 900,
};

/* ================================================================
 * TYPES
 * ================================================================ */

type Phase =
  | "intro"
  | "items"
  | "settle"
  | "message";

/* ================================================================
 * DATA
 * ================================================================ */

const ITEMS = [
  {
    label: "Mentor",
    icon: GraduationCap,
    position:
      "left-[8%] top-[18%] sm:left-[14%] sm:top-[20%]",
    delay: 0,
  },
  {
    label: "Plan",
    icon: ClipboardList,
    position:
      "right-[8%] top-[18%] sm:right-[14%] sm:top-[20%]",
    delay: 1,
  },
  {
    label: "Tasks",
    icon: Crosshair,
    position:
      "left-[8%] bottom-[18%] sm:left-[14%] sm:bottom-[20%]",
    delay: 2,
  },
  {
    label: "Progress",
    icon: TrendingUp,
    position:
      "right-[8%] bottom-[18%] sm:right-[14%] sm:bottom-[20%]",
    delay: 3,
  },
];

/* ================================================================
 * MAIN COMPONENT
 * ================================================================ */

export default function ReadySection() {
  const [phase, setPhase] =
    useState<Phase>("intro");

  const [visibleItems, setVisibleItems] =
    useState(0);

  useEffect(() => {
    let timer: number | undefined;

    if (phase === "intro") {
      timer = window.setTimeout(() => {
        setPhase("items");
      }, TIMINGS.start);
    }

    if (phase === "items") {
      if (visibleItems < ITEMS.length) {
        timer = window.setTimeout(() => {
          setVisibleItems((current) =>
            Math.min(current + 1, ITEMS.length)
          );
        }, TIMINGS.itemStep);
      } else {
        timer = window.setTimeout(() => {
          setPhase("settle");
        }, TIMINGS.settle);
      }
    }

    if (phase === "settle") {
      timer = window.setTimeout(() => {
        setPhase("message");
      }, TIMINGS.message);
    }

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [phase, visibleItems]);

  const showItems =
    phase === "items" ||
    phase === "settle" ||
    phase === "message";

  const settled =
    phase === "settle" ||
    phase === "message";

  return (
    <section className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-5 py-6 text-white sm:px-8">
      {/* =========================================================
       * AMBIENT LIGHT
       * ========================================================= */}

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.045] blur-[140px]" />

      <div
        className={[
          "pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px]",
          "-translate-x-1/2 -translate-y-1/2 rounded-full",
          "bg-[#46a65c]/[0.025] blur-[100px]",
          "transition-all duration-[1800ms]",
          settled
            ? "scale-125 opacity-100"
            : "scale-75 opacity-0",
        ].join(" ")}
      />

      {/* =========================================================
       * MAIN CONTENT
       * ========================================================= */}

      <div className="relative z-10 flex h-full w-full max-w-3xl flex-col items-center justify-center">
        {/* =======================================================
         * VISUAL
         * ======================================================= */}

        <div
          className="relative h-[300px] w-full sm:h-[330px]"
          aria-hidden="true"
        >
          {/* -----------------------------------------------------
           * CONNECTING LINES
           * ----------------------------------------------------- */}

          <div
            className={[
              "pointer-events-none absolute left-1/2 top-1/2",
              "h-[1px] w-[58%] -translate-x-1/2",
              "bg-gradient-to-r from-transparent via-white/[0.08] to-transparent",
              "transition-opacity duration-[1400ms]",
              settled ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "pointer-events-none absolute left-1/2 top-1/2",
              "h-[58%] w-[1px] -translate-x-1/2 -translate-y-1/2",
              "bg-gradient-to-b from-transparent via-white/[0.08] to-transparent",
              "transition-opacity duration-[1400ms]",
              settled ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          {/* -----------------------------------------------------
           * OUTER RING
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-1/2 top-1/2",
              "h-[150px] w-[150px]",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border border-white/[0.055]",
              "transition-all duration-[1400ms]",
              settled
                ? "scale-110 opacity-100"
                : "scale-75 opacity-40",
            ].join(" ")}
          />

          <div
            className={[
              "absolute left-1/2 top-1/2",
              "h-[116px] w-[116px]",
              "-translate-x-1/2 -translate-y-1/2",
              "rounded-full border border-[#5aa9d8]/[0.12]",
              "transition-all duration-[1400ms]",
              settled
                ? "scale-110 opacity-100"
                : "scale-90 opacity-60",
            ].join(" ")}
          />

          {/* -----------------------------------------------------
           * CENTRAL MEDIQ LOGO
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-1/2 top-1/2",
              "flex h-[78px] w-[78px]",
              "-translate-x-1/2 -translate-y-1/2",
              "items-center justify-center",
              "rounded-[24px]",
              "border border-white/[0.09]",
              "bg-[#111419]",
              "transition-all duration-[1200ms]",
              "z-20",
              settled
                ? "scale-100 opacity-100"
                : "scale-90 opacity-100",
            ].join(" ")}
            style={{
              boxShadow:
                settled
                  ? "0 0 0 1px rgba(31,113,161,0.14), 0 0 50px rgba(31,113,161,0.08)"
                  : "0 0 0 1px rgba(31,113,161,0.08)",
            }}
          >
            <img
              src="/mediq.svg"
              alt=""
              className="h-11 w-11 object-contain"
            />
          </div>

          {/* -----------------------------------------------------
           * CENTRAL CHECK
           * ----------------------------------------------------- */}

          <div
            className={[
              "absolute left-1/2 top-1/2 z-30",
              "flex h-6 w-6",
              "-translate-y-1/2 translate-x-[28px]",
              "items-center justify-center",
              "rounded-full border border-[#46a65c]/20",
              "bg-[#101713]",
              "transition-all duration-700",
              settled
                ? "scale-100 opacity-100"
                : "scale-50 opacity-0",
            ].join(" ")}
          >
            <Check className="h-3 w-3 text-emerald-400/80" />
          </div>

          {/* -----------------------------------------------------
           * FOUR CONCEPTS
           * ----------------------------------------------------- */}

          {ITEMS.map((item, index) => {
            const Icon = item.icon;

            const visible =
              showItems &&
              visibleItems > index;

            return (
              <div
                key={item.label}
                className={[
                  "absolute flex items-center gap-2",
                  item.position,
                  "transition-all duration-[1100ms]",
                  visible
                    ? "translate-x-0 translate-y-0 scale-100 opacity-100"
                    : "scale-90 opacity-0",
                  settled
                    ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.72] opacity-0"
                    : "",
                ].join(" ")}
                style={{
                  transitionDelay: settled
                    ? `${item.delay * 70}ms`
                    : "0ms",
                }}
              >
                <div
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center",
                    "rounded-xl border border-white/[0.07]",
                    "bg-[#111419]/95",
                    "shadow-[0_8px_30px_rgba(0,0,0,0.18)]",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4 text-white/35" />
                </div>

                <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* =======================================================
         * FINAL MESSAGE
         * ======================================================= */}

        <div
          className={[
            "relative -mt-2 text-center",
            "transition-all duration-[1000ms]",
            phase === "message"
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0",
          ].join(" ")}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/25">
            MediQ Mentorship
          </div>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
            You're ready.
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-white/35 sm:text-base">
            Your mentor, your plan, your tasks,
            <br className="hidden sm:block" />
            and your progress — all in one place.
          </p>

          <p
            className={[
              "mt-7 text-[10px] uppercase tracking-[0.18em]",
              "text-white/20",
              "transition-all duration-1000 delay-300",
              phase === "message"
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            ].join(" ")}
          >
            Take it one step at a time.
          </p>
        </div>
      </div>

      {/* =========================================================
       * MOTION
       * ========================================================= */}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
            transition-duration: 1ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </section>
  );
}

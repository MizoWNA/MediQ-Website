"use client";

import { useEffect, useState } from "react";
import {
CheckCircle2,
Circle,
ClipboardCheck,
Target,
} from "lucide-react";

/*

* ================================================================
* TASK SECTION
* ================================================================
*
* Cinematic demonstration of how tasks turn into progress.
*
* Animation:
*
* 1. MCQ task appears
* 2. Questions are progressively solved
* 3. 75% completion threshold is reached
* 4. Task reaches 100%
* 5. Task becomes complete
* 6. Regular task replaces it
* 7. Regular task becomes complete
* 8. Both tasks settle together
* 9. Sequence loops
*
* This is intentionally self-contained.
* It does not depend on Supabase or real task data.
*
* ================================================================
  */

/* ================================================================

* ANIMATION
* ================================================================ */

const TIMINGS = {
initialDelay: 700,

mcqAppear: 900,

progressStart: 2200,
progressStep: 650,

thresholdPause: 900,
completionPause: 1100,

regularAppear: 900,
regularComplete: 1300,

finalPause: 2600,
};

const MCQ_PROGRESS = [0, 4, 8, 12, 15, 20];

/* ================================================================

* TYPES
* ================================================================ */

type Phase =
| "mcq"
| "regular"
| "finished";

type McqProgress = {
solved: number;
percentage: number;
};

/* ================================================================

* SHARED TASK CARD
* ================================================================ */

function TaskCard({
children,
accent,
completed = false,
className = "",
}: {
children: React.ReactNode;
accent: string;
completed?: boolean;
className?: string;
}) {
return (
<div
className={[
"relative overflow-hidden rounded-2xl border",
"transition-all duration-700",
completed
? "border-white/[0.05] bg-white/[0.015]"
: "bg-[#111419]/95",
className,
].join(" ")}
style={{
borderColor: completed
? "rgba(255,255,255,0.05)"
: `color-mix(in srgb, ${accent} 20%, rgba(255,255,255,0.07))`,
backgroundColor: completed
? "rgba(255,255,255,0.015)"
: `color-mix(in srgb, ${accent} 7%, #111419)`,
}}
>
{/* Left accent */}
<div
className="pointer-events-none absolute inset-y-0 left-0 w-[2px]"
style={{
backgroundColor: completed
? "rgba(255,255,255,0.08)"
: accent,
}}
/>

  {/* Soft ambient glow */}
  {!completed && (
    <div
      className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-[0.06]"
      style={{
        backgroundColor: accent,
      }}
    />
  )}

  <div className="relative p-5 sm:p-6">
    {children}
  </div>
</div>

);
}

/* ================================================================

* MCQ TASK
* ================================================================ */

function McqTaskCard({
solved,
completed,
}: {
solved: number;
completed: boolean;
}) {
const total = 20;
const percentage = Math.round(
(solved / total) * 100
);

const accent = "#5aa9d8";

return ( <TaskCard
   accent={accent}
   completed={completed}
   className="w-full max-w-xl"
 > <div className="flex items-start gap-3">
{/* Indicator */} <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
{completed ? ( <CheckCircle2 className="h-5 w-5 text-emerald-400" />
) : (
<span
className="h-2.5 w-2.5 rounded-full"
style={{
backgroundColor: accent,
}}
/>
)} </div>

    <div className="min-w-0 flex-1">
      {/* Subject */}
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{
          color: completed
            ? "rgba(255,255,255,0.25)"
            : accent,
        }}
      >
        Anatomy
      </div>

      {/* Type */}
      <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
        Solve MCQ
      </div>

      {/* Name */}
      <div
        className={[
          "mt-2 text-sm font-medium leading-5 sm:text-base",
          completed
            ? "text-white/30 line-through"
            : "text-white/75",
        ].join(" ")}
      >
        Upper Limb — Brachial Plexus
      </div>

      {/* MCQ progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] text-white/35">
            <Target className="h-3.5 w-3.5" />

            <span>
              {solved} / {total} questions
            </span>
          </div>

          <span className="text-[10px] font-medium text-white/35">
            {percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full transition-[width] duration-600 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: accent,
              boxShadow:
                percentage > 0
                  ? `0 0 12px ${accent}40`
                  : "none",
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <span className="text-[9px] text-white/20">
            Required: 75%
          </span>

          {completed ? (
            <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400/70">
              <ClipboardCheck className="h-3 w-3" />
              Complete
            </span>
          ) : percentage >= 75 ? (
            <span className="text-[9px] font-medium text-[#5aa9d8]/65">
              Threshold reached
            </span>
          ) : (
            <span className="text-[9px] text-white/20">
              Keep going
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
</TaskCard>

);
}

/* ================================================================

* REGULAR TASK
* ================================================================ */

function RegularTaskCard({
completed,
}: {
completed: boolean;
}) {
const accent = "#62b878";

return ( <TaskCard
   accent={accent}
   completed={completed}
   className="w-full max-w-xl"
 > <div className="flex items-start gap-3">
{/* Indicator */} <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
{completed ? ( <CheckCircle2 className="h-5 w-5 text-emerald-400" />
) : ( <Circle className="h-5 w-5 text-white/20" />
)} </div>

    <div className="min-w-0 flex-1">
      {/* Subject */}
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{
          color: completed
            ? "rgba(255,255,255,0.25)"
            : accent,
        }}
      >
        Physiology
      </div>

      {/* Type */}
      <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white/30">
        Review
      </div>

      {/* Name */}
      <div
        className={[
          "mt-2 text-sm font-medium leading-5 sm:text-base",
          completed
            ? "text-white/30 line-through"
            : "text-white/75",
        ].join(" ")}
      >
        Review the cardiac cycle
      </div>

      {/* Simple task footer */}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-3">
        <span className="text-[9px] text-white/20">
          One step at a time
        </span>

        {completed ? (
          <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400/70">
            <ClipboardCheck className="h-3 w-3" />
            Complete
          </span>
        ) : (
          <span className="text-[9px] text-white/20">
            Ready
          </span>
        )}
      </div>
    </div>
  </div>
</TaskCard>

);
}

/* ================================================================

* PROGRESS DOTS
* ================================================================ */

function ProgressDots({
activeIndex,
}: {
activeIndex: number;
}) {
return ( <div className="flex items-center justify-center gap-1.5">
{MCQ_PROGRESS.map((_, index) => (
<div
key={index}
className="h-1 w-1 rounded-full transition-all duration-500"
style={{
backgroundColor:
index <= activeIndex
? "rgba(90,169,216,0.55)"
: "rgba(255,255,255,0.10)",
transform:
index === activeIndex
? "scale(1.5)"
: "scale(1)",
}}
/>
))} </div>
);
}

/* ================================================================

* MAIN COMPONENT
* ================================================================ */

export default function TaskSection() {
const [phase, setPhase] = useState<Phase>("mcq");
const [progressIndex, setProgressIndex] =
useState(0);
const [regularCompleted, setRegularCompleted] =
useState(false);
const [cycle, setCycle] = useState(0);

const solved = MCQ_PROGRESS[progressIndex];

useEffect(() => {
let timer: number | undefined;

if (phase === "mcq") {
  if (progressIndex < MCQ_PROGRESS.length - 1) {
    const delay =
      progressIndex === 0
        ? TIMINGS.progressStart
        : TIMINGS.progressStep;

    timer = window.setTimeout(() => {
      setProgressIndex((current) =>
        Math.min(
          current + 1,
          MCQ_PROGRESS.length - 1
        )
      );
    }, delay);
  } else {
    timer = window.setTimeout(() => {
      setPhase("regular");
    }, TIMINGS.completionPause);
  }
}

if (phase === "regular") {
  timer = window.setTimeout(() => {
    setRegularCompleted(true);

    timer = window.setTimeout(() => {
      setPhase("finished");
    }, TIMINGS.regularComplete);
  }, TIMINGS.regularAppear);
}

if (phase === "finished") {
  timer = window.setTimeout(() => {
    setProgressIndex(0);
    setRegularCompleted(false);
    setPhase("mcq");
    setCycle((current) => current + 1);
  }, TIMINGS.finalPause);
}

return () => {
  if (timer !== undefined) {
    window.clearTimeout(timer);
  }
};

}, [phase, progressIndex]);

const mcqCompleted =
phase === "regular" ||
phase === "finished";

return ( <section className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-5 py-6 text-white sm:px-8">
{/* ============================================================
AMBIENT
============================================================ */}

  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.035] blur-[130px]" />

  {/* ============================================================
      CONTENT
      ============================================================ */}

  <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
    {/* Heading */}
    <div
      className="mb-7 text-center sm:mb-9"
      key={`heading-${cycle}`}
      style={{
        animation:
          "taskHeadingIn 700ms cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/25">
        Make Progress
      </div>

      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white/80 sm:text-3xl">
        Small tasks.
        <span className="text-white/45">
          {" "}
          Real progress.
        </span>
      </h2>
    </div>

    {/* ==========================================================
        TASK STAGE
        ========================================================== */}

    <div className="relative flex min-h-[250px] w-full items-center justify-center sm:min-h-[275px]">
      {/* MCQ */}
      <div
        className={[
          "absolute w-full",
          phase === "mcq"
            ? "pointer-events-auto"
            : "pointer-events-none",
        ].join(" ")}
        style={{
          opacity: phase === "mcq" ? 1 : 0,
          transform:
            phase === "mcq"
              ? "translateY(0) scale(1)"
              : "translateY(-20px) scale(0.97)",
          transition:
            "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex justify-center">
          <McqTaskCard
            solved={solved}
            completed={false}
          />
        </div>
      </div>

      {/* Completed MCQ */}
      <div
        className="absolute w-full"
        style={{
          opacity: mcqCompleted ? 1 : 0,
          transform: mcqCompleted
            ? "translateY(0) scale(1)"
            : "translateY(-18px) scale(0.97)",
          transition:
            "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex justify-center">
          <McqTaskCard
            solved={20}
            completed
          />
        </div>
      </div>

      {/* Regular task */}
      <div
        className="absolute w-full"
        style={{
          opacity:
            phase === "regular" ||
            phase === "finished"
              ? 1
              : 0,
          transform:
            phase === "regular" ||
            phase === "finished"
              ? "translateY(0) scale(1)"
              : "translateY(22px) scale(0.97)",
          transition:
            "opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex justify-center">
          <RegularTaskCard
            completed={regularCompleted}
          />
        </div>
      </div>
    </div>

    {/* ==========================================================
        PROGRESS INDICATOR
        ========================================================== */}

    <div className="mt-6">
      {phase === "mcq" ? (
        <ProgressDots
          activeIndex={progressIndex}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-1.5 rounded-full bg-emerald-400/55"
            style={{
              boxShadow:
                "0 0 10px rgba(52,211,153,0.2)",
            }}
          />

          <span className="text-[9px] uppercase tracking-[0.16em] text-white/20">
            Progress made
          </span>
        </div>
      )}
    </div>

    {/* ==========================================================
        EXPLANATION
        ========================================================== */}

    <div
      className="mt-6 min-h-[32px] text-center"
      aria-live="polite"
    >
      <p
        key={`${phase}-${progressIndex}-${regularCompleted}`}
        className="text-[10px] leading-5 text-white/25 sm:text-[11px]"
        style={{
          animation:
            "taskCaptionIn 500ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {phase === "mcq" &&
          progressIndex === 0 &&
          "Start with the next thing you need to do."}

        {phase === "mcq" &&
          progressIndex > 0 &&
          progressIndex < MCQ_PROGRESS.length - 1 &&
          "Every question moves the task forward."}

        {phase === "mcq" &&
          progressIndex ===
            MCQ_PROGRESS.length - 1 &&
          "The work is complete."}

        {phase === "regular" &&
          !regularCompleted &&
          "Not every task needs a progress bar."}

        {(phase === "regular" &&
          regularCompleted) ||
        phase === "finished"
          ? "Finished tasks become visible progress."
          : null}
      </p>
    </div>
  </div>

  {/* ============================================================
      LOCAL ANIMATIONS
      ============================================================ */}

  <style jsx>{`
    @keyframes taskHeadingIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes taskCaptionIn {
      from {
        opacity: 0;
        transform: translateY(5px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 1ms !important;
        animation-delay: 0ms !important;
        transition-duration: 1ms !important;
      }
    }
  `}</style>
</section>

);
}

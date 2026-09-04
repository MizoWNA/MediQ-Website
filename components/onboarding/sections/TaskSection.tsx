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
* 6. MCQ task leaves completely
* 7. Regular task appears
* 8. Regular task becomes complete
* 9. Sequence settles
* 10. Sequence loops
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
  /*
  
  * Initial entrance.
    */
  initialDelay: 900,

  /*
  
  * Time before the first MCQ progress update.
    */
  progressStart: 3000,

  /*
  
  * Time between each MCQ progress state.
  *
  * Deliberately slow so the user can actually read
  * each change rather than watching a loading animation.
    */
  progressStep: 1800,

  /*
  
  * Pause after reaching 100%.
    */
  completionPause: 1800,

  /*
  
  * Time between the MCQ disappearing and the
  * regular task appearing.
    */
  taskTransition: 900,

  /*
  
  * Time the regular task remains visible before
  * being completed.
    */
  regularAppear: 2600,

  /*
  
  * Pause after regular task completion.
    */
  regularComplete: 1800,

  /*
  
  * Final pause before the entire sequence restarts.
    */
  finalPause: 3000,
};

const MCQ_PROGRESS = [0, 4, 8, 12, 15, 20];

/* ================================================================

* TYPES
* ================================================================ */

type Phase =
  | "mcq"
  | "mcq-exit"
  | "regular"
  | "regular-complete"
  | "finished";

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

  return (<TaskCard
    accent={accent}
    completed={completed}
    className="w-full max-w-xl"
  > <div className="flex items-start gap-3">
      {/* Indicator */} <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        {completed ? (<CheckCircle2 className="h-5 w-5 text-emerald-400" />
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
              className="h-full rounded-full transition-[width] duration-1000 ease-out"
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

  return (<TaskCard
    accent={accent}
    completed={completed}
    className="w-full max-w-xl"
  > <div className="flex items-start gap-3">
      {/* Indicator */} <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        {completed ? (<CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (<Circle className="h-5 w-5 text-white/20" />
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
  return (<div className="flex items-center justify-center gap-1.5">
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
  const [phase, setPhase] =
    useState<Phase>("mcq");

  const [progressIndex, setProgressIndex] =
    useState(0);

  const [cycle, setCycle] = useState(0);

  const solved = MCQ_PROGRESS[progressIndex];

  /*
  
  * ==============================================================
  * ANIMATION SEQUENCE
  * ==============================================================
  *
  * Each phase owns one timeout.
  *
  * This means there is never a pile of timers running at once,
  * and the previous timer is cleaned up whenever the phase
  * changes.
  * ==============================================================
    */

  useEffect(() => {
    let timer: number | undefined;


    if (phase === "mcq") {
      if (progressIndex === 0) {
        timer = window.setTimeout(() => {
          setProgressIndex(1);
        }, TIMINGS.progressStart);
      } else if (
        progressIndex <
        MCQ_PROGRESS.length - 1
      ) {
        timer = window.setTimeout(() => {
          setProgressIndex((current) =>
            Math.min(
              current + 1,
              MCQ_PROGRESS.length - 1
            )
          );
        }, TIMINGS.progressStep);
      } else {
        /*
         * 20 / 20 reached.
         * Give the completed state time to breathe.
         */
        timer = window.setTimeout(() => {
          setPhase("mcq-exit");
        }, TIMINGS.completionPause);
      }
    }

    /*
     * The MCQ card gets its own exit phase.
     *
     * During this phase the MCQ card is rendered with an
     * exit animation and NO regular task exists yet.
     *
     * This is the key fix for the previous overlap bug.
     */
    if (phase === "mcq-exit") {
      timer = window.setTimeout(() => {
        setPhase("regular");
      }, TIMINGS.taskTransition);
    }

    /*
     * Regular task enters and sits there for a while.
     */
    if (phase === "regular") {
      timer = window.setTimeout(() => {
        setPhase("regular-complete");
      }, TIMINGS.regularAppear);
    }

    /*
     * Give the completed regular task time to be seen.
     */
    if (phase === "regular-complete") {
      timer = window.setTimeout(() => {
        setPhase("finished");
      }, TIMINGS.regularComplete);
    }

    /*
     * Everything has been demonstrated.
     * Hold the finished state, then restart.
     */
    if (phase === "finished") {
      timer = window.setTimeout(() => {
        setProgressIndex(0);
        setCycle((current) => current + 1);
        setPhase("mcq");
      }, TIMINGS.finalPause);
    }

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };


  }, [phase, progressIndex]);

  const mcqCompleted =
    progressIndex === MCQ_PROGRESS.length - 1 &&
    phase === "mcq";

  const regularCompleted =
    phase === "regular-complete" ||
    phase === "finished";

  /* ================================================================
  
  * CAPTION
  * ================================================================ */

  function getCaption() {
    if (
      phase === "mcq" &&
      progressIndex === 0
    ) {
      return "Start with the next thing you need to do.";
    }


    if (
      phase === "mcq" &&
      progressIndex > 0 &&
      progressIndex <
      MCQ_PROGRESS.length - 1
    ) {
      return "Every question moves the task forward.";
    }

    if (mcqCompleted) {
      return "The work is complete.";
    }

    if (phase === "mcq-exit") {
      return "One task finished. Onto the next.";
    }

    if (phase === "regular") {
      return "Not every task needs a progress bar.";
    }

    if (
      phase === "regular-complete"
    ) {
      return "Finished tasks become visible progress.";
    }

    return "Small tasks become real progress.";


  }

  /* ================================================================
  
  * RENDER
  * ================================================================ */

  return (<section className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-5 py-6 text-white sm:px-8">
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
        {/* ========================================================
          MCQ TASK
          ======================================================== */}

        {phase === "mcq" && (
          <div
            key={`mcq-${cycle}`}
            className="flex w-full justify-center"
            style={{
              animation:
                "taskCardEnter 850ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <McqTaskCard
              solved={solved}
              completed={mcqCompleted}
            />
          </div>
        )}

        {/* ========================================================
          MCQ EXIT
          ======================================================== */}

        {phase === "mcq-exit" && (
          <div
            key={`mcq-exit-${cycle}`}
            className="flex w-full justify-center"
            style={{
              animation:
                "taskCardExit 800ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <McqTaskCard
              solved={20}
              completed
            />
          </div>
        )}

        {/* ========================================================
          REGULAR TASK
          ======================================================== */}

        {(phase === "regular" ||
          phase === "regular-complete" ||
          phase === "finished") && (
            <div
              key={`regular-${cycle}`}
              className="flex w-full justify-center"
              style={{
                animation:
                  "taskCardEnter 850ms cubic-bezier(0.22,1,0.36,1) both",
              }}
            >
              <RegularTaskCard
                completed={regularCompleted}
              />
            </div>
          )}
      </div>

      {/* ==========================================================
        PROGRESS INDICATOR
        ========================================================== */}

      <div className="mt-6">
        {phase === "mcq" ||
          phase === "mcq-exit" ? (
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

      <div className="mt-6 min-h-[32px] text-center">
        <p
          key={`${phase}-${progressIndex}-${cycle}`}
          className="text-[10px] leading-5 text-white/25 sm:text-[11px]"
          style={{
            animation:
              "taskCaptionIn 500ms cubic-bezier(0.22,1,0.36,1) both",
          }}
        >
          {getCaption()}
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

    @keyframes taskCardEnter {
      from {
        opacity: 0;
        transform: translateY(22px) scale(0.97);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes taskCardExit {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }

      to {
        opacity: 0;
        transform: translateY(-18px) scale(0.97);
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

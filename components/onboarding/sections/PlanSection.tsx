"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BookOpen,
  Check,
  FileQuestion,
  ListChecks,
  RotateCcw,
  Sparkles,
} from "lucide-react";

/*
 * ================================================================
 * PLAN SECTION — ANIMATION TIMELINE
 * ================================================================
 *
 * All values are milliseconds.
 *
 * enter = time before the scene is considered fully settled
 * hold  = time the scene remains readable
 * exit  = time allocated for the transition
 *
 * The total time for each scene is:
 *
 *   enter + hold + exit
 *
 * These values are intentionally kept in one place so they can
 * later be synchronized with the voice-over.
 *
 * The visual slide transition itself uses:
 *
 *   PLAN_TRANSITION_DURATION
 *
 * ================================================================
 */

export const PLAN_ANIMATION_TIMINGS = {
  module: {
    enter: 900,
    hold: 3600,
    exit: 900,
  },

  breakdown: {
    enter: 900,
    hold: 3800,
    exit: 900,
  },

  tasks: {
    enter: 900,
    hold: 4300,
    exit: 900,
  },

  week: {
    enter: 1000,
    hold: 4200,
    exit: 1000,
  },

  today: {
    enter: 1000,
    hold: 4200,
    exit: 1000,
  },

  overview: {
    enter: 1200,
    hold: 5200,
    exit: 1000,
  },
} as const;

/*
 * The actual movement between scenes.
 *
 * Keep this separate from the voice-over timings so you can
 * change the feel of the animation without changing the script.
 */
const PLAN_TRANSITION_DURATION = 900;

type SceneName =
  | "module"
  | "breakdown"
  | "tasks"
  | "week"
  | "today"
  | "overview";

const SCENES: SceneName[] = [
  "module",
  "breakdown",
  "tasks",
  "week",
  "today",
  "overview",
];

/* ================================================================
DATA
================================================================ */

const MODULE_STATS = [
  {
    value: "12",
    label: "Topics",
  },
  {
    value: "42",
    label: "Lectures",
  },
  {
    value: "380",
    label: "Questions",
  },
];

const TASKS = [
  {
    icon: BookOpen,
    title: "Respiratory Mechanics",
    type: "Lecture",
    meta: "25 min",
  },
  {
    icon: FileQuestion,
    title: "Practice Questions",
    type: "20 MCQs",
    meta: "20 min",
  },
  {
    icon: RotateCcw,
    title: "Review Mistakes",
    type: "Reinforcement",
    meta: "10 min",
  },
];

const WEEK_TASKS = [
  {
    day: "MON",
    title: "Respiratory Mechanics",
    meta: "Lecture · 25 min",
  },
  {
    day: "TUE",
    title: "20 Anatomy MCQs",
    meta: "Practice · 20 min",
  },
  {
    day: "WED",
    title: "Review Mistakes",
    meta: "Review · 10 min",
  },
  {
    day: "THU",
    title: "Cardiac Cycle",
    meta: "Lecture · 30 min",
  },
  {
    day: "FRI",
    title: "15 Physiology MCQs",
    meta: "Practice · 15 min",
  },
];

/* ================================================================
SHARED UI
================================================================ */

function SceneCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/[0.08] bg-[#111419]/95 shadow-[0_25px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/* ================================================================
SCENE 01 — MODULE
================================================================ */

function ModuleScene() {
  return (
    <SceneCard className="mx-auto w-full max-w-md p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/65">
            Module 101
          </p>

          <h2 className="mt-2 text-lg font-semibold tracking-[-0.025em] text-white sm:text-xl">
            Cardiopulmonary
          </h2>

          <p className="mt-1 text-[10px] text-white/25">
            The bigger picture.
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] sm:h-10 sm:w-10">
          <BookOpen className="h-4 w-4 text-white/30" />
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-white/[0.06]" />

      <div className="mt-4 grid grid-cols-3 gap-2">
        {MODULE_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.05] bg-white/[0.018] px-2 py-2.5 text-center sm:py-3"
          >
            <p className="text-sm font-semibold text-white/65">
              {stat.value}
            </p>

            <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-white/20">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </SceneCard>
  );
}

/* ================================================================
SCENE 02 — BREAKDOWN
================================================================ */

function BreakdownScene() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 text-center sm:mb-5">
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
          Module 101
        </p>

        <p className="mt-2 text-sm text-white/35">
          Let&apos;s break it down.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <BreakdownCard
          icon={<BookOpen className="h-4 w-4" />}
          title="Lectures"
          subtitle="Learn"
        />

        <BreakdownCard
          icon={<FileQuestion className="h-4 w-4" />}
          title="MCQs"
          subtitle="Practice"
        />

        <BreakdownCard
          icon={<RotateCcw className="h-4 w-4" />}
          title="Review"
          subtitle="Reinforce"
        />
      </div>
    </div>
  );
}

function BreakdownCard({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111419]/95 p-3 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-5">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#5aa9d8]/65 sm:h-10 sm:w-10">
        {icon}
      </div>

      <p className="mt-2.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white/55 sm:mt-3 sm:text-[10px] sm:tracking-[0.14em]">
        {title}
      </p>

      <p className="mt-1 text-[7px] text-white/20 sm:text-[8px]">
        {subtitle}
      </p>
    </div>
  );
}

/* ================================================================
SCENE 03 — TASKS
================================================================ */

function TasksScene() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 text-center">
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
          Manageable tasks
        </p>

        <p className="mt-2 text-sm text-white/35">
          Big work becomes something you can actually do.
        </p>
      </div>

      <div className="space-y-2">
        {TASKS.map((task) => {
          const Icon = task.icon;

          return (
            <div
              key={task.title}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#111419]/95 px-3 py-3 shadow-[0_15px_50px_rgba(0,0,0,0.18)] sm:px-4 sm:py-3.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] sm:h-9 sm:w-9">
                <Icon className="h-3.5 w-3.5 text-[#5aa9d8]/65 sm:h-4 sm:w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[9px] font-medium text-white/65 sm:text-[10px]">
                  {task.title}
                </p>

                <p className="mt-1 text-[7px] uppercase tracking-[0.13em] text-white/20 sm:text-[8px]">
                  {task.type}
                </p>
              </div>

              <span className="shrink-0 text-[7px] text-white/20 sm:text-[8px]">
                {task.meta}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
SCENE 04 — WEEK
================================================================ */

function WeekScene() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3 flex items-end justify-between px-1 sm:mb-4">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
            Your week
          </p>

          <p className="mt-1.5 text-[11px] text-white/40 sm:text-sm">
            A little progress, consistently.
          </p>
        </div>

        <ListChecks className="mb-1 h-4 w-4 text-white/15" />
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {WEEK_TASKS.map((task, index) => (
          <div
            key={task.day}
            className={[
              "min-w-0 rounded-xl border p-2 sm:rounded-2xl sm:p-3",
              index === 1
                ? "border-[#5aa9d8]/20 bg-[#5aa9d8]/[0.045]"
                : "border-white/[0.07] bg-[#111419]/95",
            ].join(" ")}
          >
            <p
              className={[
                "text-[6px] font-medium tracking-[0.14em] sm:text-[8px]",
                index === 1
                  ? "text-[#5aa9d8]/65"
                  : "text-white/20",
              ].join(" ")}
            >
              {task.day}
            </p>

            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.05] sm:mt-3 sm:h-1.5">
              <div
                className={[
                  "h-full rounded-full",
                  index === 1
                    ? "w-[72%] bg-[#5aa9d8]/45"
                    : index === 3
                      ? "w-[52%] bg-white/15"
                      : "w-[38%] bg-white/10",
                ].join(" ")}
              />
            </div>

            <p className="mt-2 min-h-[24px] text-[7px] font-medium leading-3 text-white/50 sm:mt-3 sm:min-h-[28px] sm:text-[9px] sm:leading-4">
              {task.title}
            </p>

            <p className="mt-1 text-[6px] leading-3 text-white/20 sm:text-[7px]">
              {task.meta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
SCENE 05 — TODAY
================================================================ */

function TodayScene() {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-[#5aa9d8]/15 bg-[#111419]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:p-5">
        <div className="mb-4 flex items-start justify-between sm:mb-5">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/65">
              Today
            </p>

            <h3 className="mt-2 text-base font-semibold tracking-[-0.025em] text-white/80 sm:text-lg">
              Just focus on what&apos;s next.
            </h3>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#5aa9d8]/15 bg-[#5aa9d8]/[0.05] sm:h-9 sm:w-9">
            <Sparkles className="h-3.5 w-3.5 text-[#5aa9d8]/55 sm:h-4 sm:w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <TodayTask
            title="Review Respiratory Mechanics"
            meta="Anatomy · 25 min"
          />

          <TodayTask
            title="Complete 20 MCQs"
            meta="Practice · 20 questions"
          />

          <TodayTask
            title="Review your mistakes"
            meta="Reinforcement · 10 min"
          />
        </div>
      </div>
    </div>
  );
}

function TodayTask({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] px-3 py-2.5 sm:px-3.5 sm:py-3">
      <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/15 sm:h-4 sm:w-4" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-medium text-white/60 sm:text-[10px]">
          {title}
        </p>

        <p className="mt-1 text-[7px] text-white/20 sm:text-[8px]">
          {meta}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
SCENE 06 — OVERVIEW
================================================================ */

function OverviewScene() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 text-center sm:mb-6">
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
          The bigger picture
        </p>

        <h2 className="mt-2.5 text-xl font-semibold tracking-[-0.035em] text-white sm:mt-3 sm:text-3xl">
          One step at a time.
        </h2>

        <p className="mx-auto mt-2 max-w-md text-[9px] leading-4 text-white/30 sm:mt-3 sm:text-[11px] sm:leading-5">
          You focus on what comes next.
          <br />
          MediQ keeps the bigger picture in view.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div className="absolute left-1/2 top-14 hidden h-px w-[72%] -translate-x-1/2 bg-white/[0.06] sm:block" />

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 sm:gap-2">
          <OverviewNode
            label="Module"
            value="101"
            icon={<BookOpen className="h-3.5 w-3.5" />}
          />

          <OverviewNode
            label="Learn"
            value="Lectures"
            icon={<BookOpen className="h-3.5 w-3.5" />}
          />

          <OverviewNode
            label="Practice"
            value="MCQs"
            icon={<FileQuestion className="h-3.5 w-3.5" />}
            active
          />

          <OverviewNode
            label="Reinforce"
            value="Review"
            icon={<RotateCcw className="h-3.5 w-3.5" />}
          />

          <OverviewNode
            label="Today"
            value="3 tasks"
            icon={<Check className="h-3.5 w-3.5" />}
          />
        </div>
      </div>
    </div>
  );
}

function OverviewNode({
  label,
  value,
  icon,
  active = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <div className="relative z-10 rounded-xl border border-white/[0.07] bg-[#111419]/95 p-2 text-center shadow-[0_15px_45px_rgba(0,0,0,0.16)] sm:rounded-2xl sm:p-3">
      <div
        className={[
          "mx-auto flex h-7 w-7 items-center justify-center rounded-lg border sm:h-8 sm:w-8 sm:rounded-xl",
          active
            ? "border-[#5aa9d8]/20 bg-[#5aa9d8]/[0.06] text-[#5aa9d8]/65"
            : "border-white/[0.06] bg-white/[0.02] text-white/25",
        ].join(" ")}
      >
        {icon}
      </div>

      <p className="mt-1.5 text-[6px] uppercase tracking-[0.12em] text-white/20 sm:mt-2 sm:text-[7px] sm:tracking-[0.14em]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[8px] font-medium text-white/50 sm:mt-1 sm:text-[9px]">
        {value}
      </p>
    </div>
  );
}

/* ================================================================
SCENE RENDERER
================================================================ */

function renderScene(scene: SceneName) {
  switch (scene) {
    case "module":
      return <ModuleScene />;

    case "breakdown":
      return <BreakdownScene />;

    case "tasks":
      return <TasksScene />;

    case "week":
      return <WeekScene />;

    case "today":
      return <TodayScene />;

    case "overview":
      return <OverviewScene />;

    default:
      return null;
  }
}

/* ================================================================
MAIN COMPONENT
================================================================ */

export default function PlanSection() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);

  /*
   * Measure the available animation stage.
   *
   * This lets mobile calculate the exact distance required to move
   * one scene upward while keeping two scenes visible at once.
   */
  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;

    const updateHeight = () => {
      setStageHeight(stage.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(stage);

    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Advance the animation according to the configurable timing
   * for the currently visible scene.
   */
  useEffect(() => {
    const scene = SCENES[sceneIndex];
    const timing = PLAN_ANIMATION_TIMINGS[scene];

    const totalDuration =
      timing.enter +
      timing.hold +
      timing.exit;

    const timeout = window.setTimeout(() => {
      setSceneIndex((current) => {
        if (current >= SCENES.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, totalDuration);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [sceneIndex]);

  /*
   * Desktop:
   *
   *   One scene occupies the entire stage.
   *
   * Mobile:
   *
   *   Two scenes occupy the stage.
   *
   * The gap is included in the calculation so each movement
   * lands exactly on the next scene.
   */
  const mobileGap = 16;
  const mobileSlotHeight =
    stageHeight > 0
      ? Math.max(
          0,
          (stageHeight - mobileGap) / 2
        )
      : 0;

  const mobileOffset =
    sceneIndex * (mobileSlotHeight + mobileGap);

  const desktopOffset =
    sceneIndex * stageHeight;

  return (
    <section className="relative h-full min-h-0 w-full overflow-hidden text-white">
      {/* ==========================================================
          BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.045] blur-[110px] sm:h-[500px] sm:w-[500px] sm:blur-[130px]" />

        <div className="absolute bottom-[-150px] left-1/2 h-[250px] w-[400px] -translate-x-1/2 rounded-full bg-[#46a65c]/[0.018] blur-[100px]" />
      </div>

      {/* ==========================================================
          ANIMATION STAGE
      ========================================================== */}

      <div
        ref={stageRef}
        className="absolute inset-0 overflow-hidden px-3 pb-2 pt-2 sm:px-5 sm:pb-4 sm:pt-4"
      >
        {/* ========================================================
            DESKTOP — ONE SCENE
        ======================================================== */}

        <div className="absolute inset-0 hidden items-center justify-center px-5 md:flex">
          <div
            className="w-full max-w-4xl"
            style={{
              transform: `translateY(-${desktopOffset}px)`,
              transitionProperty: "transform",
              transitionDuration: `${PLAN_TRANSITION_DURATION}ms`,
              transitionTimingFunction:
                "cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
          >
            {SCENES.map((sceneName) => (
              <div
                key={sceneName}
                className="flex h-full min-h-[1px] w-full items-center justify-center"
                style={{
                  height:
                    stageHeight > 0
                      ? `${stageHeight}px`
                      : "100vh",
                }}
              >
                {renderScene(sceneName)}
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            MOBILE — TWO SCENES
        ======================================================== */}

        <div className="absolute inset-0 md:hidden">
          <div
            className="flex w-full flex-col"
            style={{
              gap: `${mobileGap}px`,
              transform: `translateY(-${mobileOffset}px)`,
              transitionProperty: "transform",
              transitionDuration: `${PLAN_TRANSITION_DURATION}ms`,
              transitionTimingFunction:
                "cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
          >
            {SCENES.map((sceneName) => (
              <div
                key={sceneName}
                className="flex w-full shrink-0 items-center justify-center"
                style={{
                  height:
                    mobileSlotHeight > 0
                      ? `${mobileSlotHeight}px`
                      : "calc(50vh - 8px)",
                }}
              >
                <div className="w-full">
                  {renderScene(sceneName)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

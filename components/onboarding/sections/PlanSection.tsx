"use client";

import { useEffect, useState, type ReactNode } from "react";
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
 * enter = scene entrance duration
 * hold  = time the scene remains readable
 * exit  = scene exit duration
 *
 * Total scene duration:
 *
 *   enter + hold + exit
 *
 * These values are intentionally kept in one place so they can
 * later be synchronized with the voice-over.
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
 * DATA
 * ================================================================ */

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
 * SHARED UI
 * ================================================================ */

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
 * SCENE 01 — MODULE
 * ================================================================ */

function ModuleScene() {
  return (
    <SceneCard className="mx-auto w-full max-w-md p-5 sm:p-6 md:max-w-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/65">
            Module 101
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white sm:text-2xl">
            Cardiopulmonary
          </h2>

          <p className="mt-1 text-[10px] text-white/25">
            The bigger picture.
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]">
          <BookOpen className="h-4 w-4 text-white/30" />
        </div>
      </div>

      <div className="mt-5 h-px w-full bg-white/[0.06]" />

      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {MODULE_STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.05] bg-white/[0.018] px-2 py-3 text-center sm:py-4"
          >
            <p className="text-base font-semibold text-white/65 sm:text-lg">
              {stat.value}
            </p>

            <p className="mt-1 text-[7px] uppercase tracking-[0.12em] text-white/20 sm:text-[8px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </SceneCard>
  );
}

/* ================================================================
 * SCENE 02 — BREAKDOWN
 * ================================================================ */

function BreakdownScene() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4 text-center sm:mb-5">
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
          Module 101
        </p>

        <p className="mt-2 text-sm text-white/35 sm:text-base">
          Let's break it down.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 md:gap-3">
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
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#111419]/95 p-4 text-left shadow-[0_20px_60px_rgba(0,0,0,0.2)] md:block md:p-5 md:text-center">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-[#5aa9d8]/65">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
          {title}
        </p>

        <p className="mt-1 text-[8px] text-white/20">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
 * SCENE 03 — TASKS
 * ================================================================ */

function TasksScene() {
  return (
    <div className="mx-auto w-full max-w-md md:max-w-lg">
      <div className="mb-4 text-center">
        <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
          Manageable tasks
        </p>

        <p className="mt-2 text-sm text-white/35 sm:text-base">
          Big work becomes something you can actually do.
        </p>
      </div>

      <div className="space-y-2.5">
        {TASKS.map((task) => {
          const Icon = task.icon;

          return (
            <div
              key={task.title}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#111419]/95 px-4 py-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.18)] sm:px-5 sm:py-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
                <Icon className="h-4 w-4 text-[#5aa9d8]/65" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-white/65 sm:text-[11px]">
                  {task.title}
                </p>

                <p className="mt-1 text-[7px] uppercase tracking-[0.13em] text-white/20 sm:text-[8px]">
                  {task.type}
                </p>
              </div>

              <span className="shrink-0 text-[8px] text-white/20 sm:text-[9px]">
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
 * SCENE 04 — WEEK
 * ================================================================ */

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

      {/* Mobile: vertical timeline */}
      <div className="space-y-2.5 md:hidden">
        {WEEK_TASKS.map((task, index) => (
          <div
            key={task.day}
            className={[
              "flex items-center gap-3 rounded-2xl border px-4 py-3.5",
              index === 1
                ? "border-[#5aa9d8]/20 bg-[#5aa9d8]/[0.045]"
                : "border-white/[0.07] bg-[#111419]/95",
            ].join(" ")}
          >
            <div className="flex w-10 shrink-0 flex-col items-center">
              <p
                className={[
                  "text-[8px] font-medium tracking-[0.14em]",
                  index === 1
                    ? "text-[#5aa9d8]/65"
                    : "text-white/25",
                ].join(" ")}
              >
                {task.day}
              </p>

              <div
                className={[
                  "mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]",
                ].join(" ")}
              >
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
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-white/55 sm:text-[11px]">
                {task.title}
              </p>

              <p className="mt-1 text-[8px] text-white/20">
                {task.meta}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal week */}
      <div className="hidden md:grid md:grid-cols-5 md:gap-2">
        {WEEK_TASKS.map((task, index) => (
          <div
            key={task.day}
            className={[
              "min-w-0 rounded-2xl border p-3",
              index === 1
                ? "border-[#5aa9d8]/20 bg-[#5aa9d8]/[0.045]"
                : "border-white/[0.07] bg-[#111419]/95",
            ].join(" ")}
          >
            <p
              className={[
                "text-[8px] font-medium tracking-[0.14em]",
                index === 1
                  ? "text-[#5aa9d8]/65"
                  : "text-white/20",
              ].join(" ")}
            >
              {task.day}
            </p>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
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

            <p className="mt-3 min-h-[28px] text-[9px] font-medium leading-4 text-white/50">
              {task.title}
            </p>

            <p className="mt-1 text-[7px] leading-3 text-white/20">
              {task.meta}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
 * SCENE 05 — TODAY
 * ================================================================ */

function TodayScene() {
  return (
    <div className="mx-auto w-full max-w-md md:max-w-lg">
      <div className="rounded-3xl border border-[#5aa9d8]/15 bg-[#111419]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.25)] sm:p-5">
        <div className="mb-4 flex items-start justify-between sm:mb-5">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/65">
              Today
            </p>

            <h3 className="mt-2 text-base font-semibold tracking-[-0.025em] text-white/80 sm:text-lg">
              Just focus on what's next.
            </h3>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#5aa9d8]/15 bg-[#5aa9d8]/[0.05]">
            <Sparkles className="h-4 w-4 text-[#5aa9d8]/55" />
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.018] px-3.5 py-3 sm:px-4 sm:py-3.5">
      <div className="h-4 w-4 shrink-0 rounded-full border border-white/15" />

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
 * SCENE 06 — OVERVIEW
 * ================================================================ */

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
        {/* Mobile vertical connector */}
        <div className="absolute bottom-5 left-6 top-5 w-px bg-white/[0.06] md:hidden" />

        {/* Desktop horizontal connector */}
        <div className="absolute left-1/2 top-14 hidden h-px w-[72%] -translate-x-1/2 bg-white/[0.06] md:block" />

        {/* Mobile: vertical */}
        <div className="space-y-2.5 md:hidden">
          <OverviewNode
            label="Module"
            value="101"
            icon={<BookOpen className="h-4 w-4" />}
          />

          <OverviewNode
            label="Learn"
            value="Lectures"
            icon={<BookOpen className="h-4 w-4" />}
          />

          <OverviewNode
            label="Practice"
            value="MCQs"
            icon={<FileQuestion className="h-4 w-4" />}
            active
          />

          <OverviewNode
            label="Reinforce"
            value="Review"
            icon={<RotateCcw className="h-4 w-4" />}
          />

          <OverviewNode
            label="Today"
            value="3 tasks"
            icon={<Check className="h-4 w-4" />}
          />
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden md:grid md:grid-cols-5 md:gap-2">
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
    <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#111419]/95 p-3 text-left shadow-[0_15px_45px_rgba(0,0,0,0.16)] md:block md:rounded-2xl md:p-3 md:text-center">
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border md:mx-auto md:h-8 md:w-8",
          active
            ? "border-[#5aa9d8]/20 bg-[#5aa9d8]/[0.06] text-[#5aa9d8]/65"
            : "border-white/[0.06] bg-white/[0.02] text-white/25",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[7px] uppercase tracking-[0.14em] text-white/20 md:mt-2 md:text-[7px]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-medium text-white/50 md:text-[9px]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
 * SCENE LAYER
 * ================================================================ */

function SceneLayer({
  children,
  active,
  previous,
}: {
  children: ReactNode;
  active: boolean;
  previous: boolean;
}) {
  const transform = active
    ? "translateY(0) scale(1)"
    : previous
      ? "translateY(-110px) scale(0.9)"
      : "translateY(110px) scale(0.94)";

  return (
    <div
      className="absolute inset-0 flex items-center justify-center opacity-0 transition-all ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        transform,
        opacity: active ? 1 : 0,
        transitionDuration: "900ms",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <div className="w-full">{children}</div>
    </div>
  );
}

/* ================================================================
 * MAIN COMPONENT
 * ================================================================ */

export default function PlanSection() {
  const [sceneIndex, setSceneIndex] = useState(0);

  const scene = SCENES[sceneIndex];
  const timing = PLAN_ANIMATION_TIMINGS[scene];

  useEffect(() => {
    const totalDuration =
      timing.enter +
      timing.hold +
      timing.exit;

    const timeout = window.setTimeout(() => {
      setSceneIndex((current) =>
        current >= SCENES.length - 1
          ? 0
          : current + 1
      );
    }, totalDuration);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [scene, timing]);

  return (
    <section className="relative h-full min-h-0 w-full overflow-hidden text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.045] blur-[110px] sm:h-[500px] sm:w-[500px] sm:blur-[130px]" />

        <div className="pointer-events-none absolute bottom-[-150px] left-1/2 h-[250px] w-[400px] -translate-x-1/2 rounded-full bg-[#46a65c]/[0.018] blur-[100px]" />

        <div className="absolute inset-0 flex items-center justify-center px-4 py-4 sm:px-5">
          <div className="relative h-full w-full max-w-4xl">
            <SceneLayer
              active={scene === "module"}
              previous={sceneIndex > 0}
            >
              <ModuleScene />
            </SceneLayer>

            <SceneLayer
              active={scene === "breakdown"}
              previous={sceneIndex > 1}
            >
              <BreakdownScene />
            </SceneLayer>

            <SceneLayer
              active={scene === "tasks"}
              previous={sceneIndex > 2}
            >
              <TasksScene />
            </SceneLayer>

            <SceneLayer
              active={scene === "week"}
              previous={sceneIndex > 3}
            >
              <WeekScene />
            </SceneLayer>

            <SceneLayer
              active={scene === "today"}
              previous={sceneIndex > 4}
            >
              <TodayScene />
            </SceneLayer>

            <SceneLayer
              active={scene === "overview"}
              previous={sceneIndex > 5}
            >
              <OverviewScene />
            </SceneLayer>
          </div>
        </div>
      </div>
    </section>
  );
}


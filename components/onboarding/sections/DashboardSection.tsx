"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Menu,
  Play,
} from "lucide-react";

/*
 * ================================================================
 * DASHBOARD SECTION
 * ================================================================
 *
 * Cinematic miniature of the real MediQ student dashboard.
 *
 * The dashboard assembles itself progressively:
 *
 *   1. Dashboard frame
 *   2. Sidebar
 *   3. Planner header
 *   4. Objectives
 *   5. Focus / Pomodoro
 *   6. Weekly schedule
 *
 * This is an onboarding illustration, not a functional dashboard.
 *
 * ================================================================
 */

/* ================================================================
 * DATA
 * ================================================================ */

const OBJECTIVES = [
  {
    title: "Revise biochem",
    completed: true,
  },
  {
    title: "Revise physio",
    completed: true,
  },
  {
    title: "Revise histo",
    completed: false,
  },
  {
    title: "Revise Anatomy",
    completed: false,
  },
];

/*
 * The schedule intentionally does not contain task names.
 * Section 5 will focus on the actual TaskCard.
 *
 * Each task has its own subtle accent so the schedule feels
 * visually varied without becoming colorful or noisy.
 */
const WEEK_DAYS = [
  {
    day: "SUN",
    date: "30",
    task: false,
  },
  {
    day: "MON",
    date: "31",
    task: true,
    accent: "blue",
  },
  {
    day: "TUE",
    date: "1",
    task: true,
    accent: "green",
  },
  {
    day: "WED",
    date: "2",
    task: true,
    accent: "purple",
  },
  {
    day: "THU",
    date: "3",
    task: true,
    accent: "amber",
  },
  {
    day: "FRI",
    date: "4",
    task: true,
    accent: "cyan",
    today: true,
  },
  {
    day: "SAT",
    date: "5",
    task: false,
  },
];

/* ================================================================
 * ANIMATION
 * ================================================================ */

const ANIMATION = {
  sidebar: 150,
  header: 300,
  objectives: 500,
  focus: 650,
  schedule: 800,
  scheduleStep: 90,
};

function revealStyle(
  delay: number,
  duration = 650
) {
  return {
    opacity: 0,
    transform: "translateY(12px) scale(0.985)",
    animation: `dashboardReveal ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms forwards`,
  };
}

/* ================================================================
 * SHARED CARD
 * ================================================================ */

function DashboardCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/[0.07] bg-[#111419]/95 shadow-[0_20px_60px_rgba(0,0,0,0.22)]",
        className,
      ].join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

/* ================================================================
 * SIDEBAR
 * ================================================================ */

function DashboardSidebar() {
  return (
    <aside
      className="hidden w-[150px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0e1014]/95 p-3.5 md:flex"
      style={revealStyle(ANIMATION.sidebar)}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111419]">
          <img
            src="/mediq.svg"
            alt="MediQ"
            className="h-4 w-4"
          />
        </div>

        <div>
          <p className="text-[9px] font-semibold text-white/70">
            MediQ
          </p>

          <p className="text-[7px] text-white/20">
            Mentorship
          </p>
        </div>
      </div>

      {/* Student */}
      <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.018] p-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.07] text-[8px] font-medium text-white/40">
            S
          </div>

          <div className="min-w-0">
            <p className="truncate text-[8px] font-medium text-white/60">
              Student Name
            </p>

            <p className="mt-0.5 text-[7px] text-white/20">
              Medical Student
            </p>
          </div>
        </div>
      </div>

      {/* Mentor */}
      <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.018] p-2.5">
        <p className="text-[7px] uppercase tracking-[0.12em] text-white/20">
          Your mentor
        </p>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5aa9d8]/10 text-[8px] font-medium text-[#5aa9d8]/55">
            M
          </div>

          <div className="min-w-0">
            <p className="truncate text-[8px] font-medium text-white/55">
              Mentor Name
            </p>

            <p className="mt-0.5 text-[7px] text-white/20">
              Academic Mentor
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-3 space-y-1.5">
        <SidebarStat
          label="Days until exam"
          value="124"
        />

        <SidebarStat
          label="Days until intern"
          value="52"
        />

        <SidebarStat
          label="Academic year"
          value="Year 3"
        />
      </div>

      {/* Tasks */}
      <div className="mt-auto pt-4">
        <div className="border-t border-white/[0.06] pt-3">
          <div className="flex items-center justify-between">
            <p className="text-[7px] uppercase tracking-[0.12em] text-white/20">
              Tasks this week
            </p>

            <span className="text-[7px] text-white/25">
              0
            </span>
          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div className="h-full w-0 rounded-full bg-[#5aa9d8]/45" />
          </div>
        </div>

        <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.06] py-1.5 text-[7px] text-white/20">
          <Menu className="h-3 w-3" />
          Collapse
        </button>
      </div>
    </aside>
  );
}

function SidebarStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5">
      <span className="text-[7px] text-white/20">
        {label}
      </span>

      <span className="text-[9px] font-medium text-white/45">
        {value}
      </span>
    </div>
  );
}

/* ================================================================
 * MOBILE HEADER
 * ================================================================ */

function MobileDashboardHeader() {
  return (
    <div
      className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5 md:hidden"
      style={revealStyle(ANIMATION.sidebar)}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111419]">
          <img
            src="/mediq.svg"
            alt="MediQ"
            className="h-3.5 w-3.5"
          />
        </div>

        <span className="text-[9px] font-semibold text-white/65">
          MediQ
        </span>
      </div>

      <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] text-white/25">
        <Menu className="h-3 w-3" />
      </div>
    </div>
  );
}

/* ================================================================
 * PLANNER HEADER
 * ================================================================ */

function PlannerHeader() {
  return (
    <div
      className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-3 sm:px-5 sm:py-4"
      style={revealStyle(ANIMATION.header)}
    >
      <div>
        <p className="text-[10px] font-semibold text-white/70 sm:text-xs">
          Weekly Planner
        </p>

        <p className="mt-0.5 text-[7px] text-white/20 sm:text-[8px]">
          August 30 – September 5
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] text-white/25">
          <ChevronLeft className="h-3 w-3" />
        </button>

        <button className="rounded-lg border border-white/[0.06] px-2 py-1 text-[7px] text-white/30">
          Today
        </button>

        <button className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] text-white/25">
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ================================================================
 * OBJECTIVES
 * ================================================================ */

function ObjectivesCard() {
  return (
    <DashboardCard
      className="p-3.5 sm:p-4"
      style={revealStyle(ANIMATION.objectives)}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-white/65 sm:text-xs">
            Objectives
          </p>

          <p className="mt-0.5 text-[7px] text-white/20 sm:text-[8px]">
            Your ongoing goals
          </p>
        </div>

        <span className="text-[8px] text-white/25 sm:text-[9px]">
          2 of 6 complete
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {OBJECTIVES.map((objective, index) => (
          <div
            key={objective.title}
            className="flex items-center gap-2 rounded-lg px-1 py-1"
            style={revealStyle(
              ANIMATION.objectives + 180 + index * 100,
              500
            )}
          >
            {objective.completed ? (
              <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#5aa9d8]/20">
                <Check className="h-2.5 w-2.5 text-[#5aa9d8]/65" />
              </div>
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 text-white/15" />
            )}

            <span
              className={[
                "text-[8px] sm:text-[9px]",
                objective.completed
                  ? "text-white/30 line-through"
                  : "text-white/55",
              ].join(" ")}
            >
              {objective.title}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

/* ================================================================
 * POMODORO
 * ================================================================ */

function FocusCard() {
  const [seconds, setSeconds] = useState(25 * 60);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) =>
        current > 0 ? current - 1 : 25 * 60
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const remainingSeconds = (seconds % 60)
    .toString()
    .padStart(2, "0");

  return (
    <DashboardCard
      className="relative overflow-hidden p-3.5 sm:p-4"
      style={revealStyle(ANIMATION.focus)}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#5aa9d8]/[0.035] blur-2xl" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-white/65 sm:text-xs">
              Focus
            </p>

            <p className="mt-0.5 text-[7px] text-white/20 sm:text-[8px]">
              Pomodoro timer
            </p>
          </div>

          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.018]">
            <Play className="ml-0.5 h-2.5 w-2.5 text-[#5aa9d8]/55" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-4">
          <div className="relative flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[#5aa9d8]/15">
            <div className="absolute inset-[5px] rounded-full border border-white/[0.045]" />

            <div className="relative text-center">
              <p className="font-mono text-sm font-medium tracking-[-0.02em] text-white/70 sm:text-base">
                {minutes}:{remainingSeconds}
              </p>

              <p className="mt-0.5 text-[6px] uppercase tracking-[0.16em] text-white/20">
                Focus
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5">
          <span className="text-[7px] text-white/20">
            25 minute session
          </span>

          <span className="text-[7px] text-[#5aa9d8]/45">
            Ready
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}

/* ================================================================
 * WEEKLY SCHEDULE
 * ================================================================ */

function WeeklySchedule() {
  return (
    <DashboardCard
      className="overflow-hidden"
      style={revealStyle(ANIMATION.schedule)}
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-3 sm:px-4">
        <div>
          <p className="text-[10px] font-semibold text-white/65 sm:text-xs">
            Weekly Schedule
          </p>

          <p className="mt-0.5 text-[7px] text-white/20 sm:text-[8px]">
            Your tasks for the entire week
          </p>
        </div>

        <span className="text-[8px] text-white/20">
          7 days
        </span>
      </div>

      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day, index) => (
          <ScheduleDay
            key={`${day.day}-${day.date}`}
            day={day}
            index={index}
          />
        ))}
      </div>
    </DashboardCard>
  );
}

function ScheduleDay({
  day,
  index,
}: {
  day: (typeof WEEK_DAYS)[number];
  index: number;
}) {
  return (
    <div
      className={[
        "min-w-0 border-r border-white/[0.05] last:border-r-0",
        day.today ? "bg-white/[0.025]" : "",
      ].join(" ")}
      style={revealStyle(
        ANIMATION.schedule +
          150 +
          index * ANIMATION.scheduleStep,
        500
      )}
    >
      {/* Day header */}
      <div className="flex flex-col items-center border-b border-white/[0.05] px-1 py-2">
        <span className="text-[6px] font-medium tracking-[0.12em] text-white/20 sm:text-[7px]">
          {day.day}
        </span>

        <div
          className={[
            "mt-1 flex h-5 w-5 items-center justify-center rounded-full text-[7px] sm:h-6 sm:w-6 sm:text-[8px]",
            day.today
              ? "bg-white text-[#0b0d10]"
              : "text-white/35",
          ].join(" ")}
        >
          {day.date}
        </div>
      </div>

      {/* Visual task block */}
      <div className="min-h-[78px] p-1.5 sm:min-h-[90px] sm:p-2">
        {day.task ? (
          <TaskBlock accent={day.accent ?? "blue"} />
        ) : (
          <div className="flex h-full min-h-[60px] items-center justify-center">
            <div className="h-1 w-1 rounded-full bg-white/[0.08]" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
 * COLORED TASK BLOCK
 * ================================================================ */

function TaskBlock({
  accent,
}: {
  accent: string;
}) {
  const accents: Record<
    string,
    {
      background: string;
      border: string;
      dot: string;
    }
  > = {
    blue: {
      background: "bg-[#5aa9d8]/[0.055]",
      border: "border-[#5aa9d8]/15",
      dot: "bg-[#5aa9d8]/55",
    },
    green: {
      background: "bg-[#62b878]/[0.055]",
      border: "border-[#62b878]/15",
      dot: "bg-[#62b878]/55",
    },
    purple: {
      background: "bg-[#9b86c7]/[0.055]",
      border: "border-[#9b86c7]/15",
      dot: "bg-[#9b86c7]/55",
    },
    amber: {
      background: "bg-[#c7a35a]/[0.055]",
      border: "border-[#c7a35a]/15",
      dot: "bg-[#c7a35a]/55",
    },
    cyan: {
      background: "bg-[#58c0c0]/[0.055]",
      border: "border-[#58c0c0]/15",
      dot: "bg-[#58c0c0]/55",
    },
  };

  const style = accents[accent] ?? accents.blue;

  return (
    <div
      className={[
        "flex min-h-[60px] items-center justify-center rounded-lg border",
        style.background,
        style.border,
      ].join(" ")}
    >
      <div
        className={[
          "h-1.5 w-1.5 rounded-full",
          style.dot,
        ].join(" ")}
      />
    </div>
  );
}

/* ================================================================
 * MAIN COMPONENT
 * ================================================================ */

export default function DashboardSection() {
  return (
    <section className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-3 py-4 text-white sm:px-5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.035] blur-[120px]" />

      {/* Dashboard frame */}
      <div
        className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f13]/95 shadow-[0_30px_100px_rgba(0,0,0,0.4)]"
        style={{
          opacity: 0,
          transform: "translateY(18px) scale(0.975)",
          animation:
            "dashboardReveal 850ms cubic-bezier(0.22,1,0.36,1) forwards",
        }}
      >
        <DashboardSidebar />

        <div className="min-w-0 flex-1">
          <MobileDashboardHeader />

          <PlannerHeader />

          <div className="space-y-3 p-3 sm:space-y-4 sm:p-4">
            {/* Upper widgets */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <ObjectivesCard />
              <FocusCard />
            </div>

            {/* Weekly schedule */}
            <WeeklySchedule />
          </div>
        </div>
      </div>

      {/* Local animation definition */}
      <style jsx>{`
        @keyframes dashboardReveal {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 1ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </section>
  );
}

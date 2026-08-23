"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  GraduationCap,
  Target,
  BookOpen,
  Clock3,
  UserRound,
} from "lucide-react";

const days = [
  {
    name: "Monday",
    short: "MON",
    date: "24",
    tasks: [
      { subject: "Anatomy", title: "Upper Limb", color: "blue" },
      { subject: "Physiology", title: "Cardiac Cycle", color: "red" },
      { subject: "Histology", title: "Muscle Tissue", color: "green" },
    ],
  },
  {
    name: "Tuesday",
    short: "TUE",
    date: "25",
    tasks: [
      { subject: "Anatomy", title: "Thorax", color: "blue" },
      { subject: "Physiology", title: "Blood Pressure", color: "red" },
      { subject: "Histology", title: "Connective Tissue", color: "green" },
    ],
  },
  {
    name: "Wednesday",
    short: "WED",
    date: "26",
    tasks: [
      { subject: "Anatomy", title: "Abdomen", color: "blue" },
      { subject: "Physiology", title: "ECG", color: "red" },
    ],
  },
  {
    name: "Thursday",
    short: "THU",
    date: "27",
    tasks: [
      { subject: "Anatomy", title: "Pelvis", color: "blue" },
      { subject: "Physiology", title: "Cardiac Output", color: "red" },
      { subject: "Histology", title: "Epithelium", color: "green" },
    ],
  },
  {
    name: "Friday",
    short: "FRI",
    date: "28",
    tasks: [],
  },
  {
    name: "Saturday",
    short: "SAT",
    date: "29",
    tasks: [
      { subject: "Anatomy", title: "Revision", color: "blue" },
      { subject: "Physiology", title: "Revision", color: "red" },
    ],
  },
  {
    name: "Sunday",
    short: "SUN",
    date: "30",
    tasks: [
      { subject: "Histology", title: "Revision", color: "green" },
      { subject: "Anatomy", title: "Practice Questions", color: "blue" },
    ],
  },
];

const objectives = [
  {
    text: "Finish Anatomy lectures",
    completed: true,
  },
  {
    text: "Finish Physiology lectures",
    completed: false,
  },
  {
    text: "Review Histology notes",
    completed: false,
  },
  {
    text: "Complete weekly question bank",
    completed: false,
  },
];

const colorClasses = {
  blue: {
    card: "bg-sky-500/10 border-sky-500/20",
    dot: "bg-sky-400",
    text: "text-sky-300",
  },
  red: {
    card: "bg-rose-500/10 border-rose-500/20",
    dot: "bg-rose-400",
    text: "text-rose-300",
  },
  green: {
    card: "bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
  },
};

export function MentorshipDashboard() {
  return (
    <div className="min-h-screen bg-[#0b0d10] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111419] shadow-2xl">
        {/* ================================================================
            SIDEBAR
        ================================================================= */}

        <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.07] bg-[#0d0f12] lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-black">
                M
              </div>

              <div>
                <div className="text-sm font-semibold tracking-tight">
                  MediQ
                </div>
                <div className="text-[11px] text-white/40">
                  Mentorship
                </div>
              </div>
            </div>
          </div>

          {/* Student */}
          <div className="border-b border-white/[0.07] px-5 py-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
              <UserRound className="h-3.5 w-3.5" />
              Student
            </div>

            <div className="text-xl font-semibold tracking-tight">
              Ahmed
            </div>

            <div className="mt-1 text-sm text-white/40">
              Medical Student
            </div>
          </div>

          {/* Mentor */}
          <div className="px-5 py-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
              <GraduationCap className="h-3.5 w-3.5" />
              Mentor
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="text-sm font-medium">
                Dr. Ahmed Khaled
              </div>

              <div className="mt-1 text-xs text-white/35">
                Academic Mentor
              </div>
            </div>
          </div>

          {/* Week summary */}
          <div className="mt-auto border-t border-white/[0.07] p-5">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
              <Clock3 className="h-3.5 w-3.5" />
              This Week
            </div>

            <div className="text-2xl font-semibold tracking-tight">
              10
            </div>

            <div className="mt-1 text-xs text-white/35">
              tasks planned
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full w-[35%] rounded-full bg-white" />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-white/30">
              <span>3 completed</span>
              <span>10 total</span>
            </div>
          </div>
        </aside>

        {/* ================================================================
            MAIN CONTENT
        ================================================================= */}

        <main className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-7">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/35">
                <CalendarDays className="h-3.5 w-3.5" />
                Weekly Planner
              </div>

              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                August 24 — August 30
              </h1>
            </div>

            {/* Week navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                className="hidden h-9 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white sm:block"
              >
                Today
              </button>

              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="space-y-5 p-4 sm:p-6">
            {/* ============================================================
                OBJECTIVES
            ============================================================= */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                    <Target className="h-4 w-4 text-white/70" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      Weekly Objectives
                    </h2>

                    <p className="mt-0.5 text-xs text-white/35">
                      What you want to accomplish this week
                    </p>
                  </div>
                </div>

                <span className="hidden text-xs text-white/30 sm:block">
                  1 of 4 complete
                </span>
              </div>

              <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
                {objectives.map((objective) => (
                  <div
                    key={objective.text}
                    className="flex items-start gap-3 bg-[#15181d] px-5 py-4"
                  >
                    {objective.completed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
                    )}

                    <span
                      className={`text-sm leading-5 ${
                        objective.completed
                          ? "text-white/35 line-through"
                          : "text-white/70"
                      }`}
                    >
                      {objective.text}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* ============================================================
                WEEKLY CALENDAR
            ============================================================= */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
              {/* Calendar heading */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                    <BookOpen className="h-4 w-4 text-white/70" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold">
                      Weekly Schedule
                    </h2>

                    <p className="mt-0.5 text-xs text-white/35">
                      Your tasks for the entire week
                    </p>
                  </div>
                </div>

                <div className="hidden items-center gap-4 text-[11px] text-white/35 sm:flex">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Anatomy
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    Physiology
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Histology
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="overflow-x-auto">
                <div className="grid min-w-[900px] grid-cols-7 divide-x divide-white/[0.06]">
                  {days.map((day) => (
                    <div
                      key={day.name}
                      className="min-h-[420px] bg-[#121519]"
                    >
                      {/* Day header */}
                      <div className="border-b border-white/[0.06] px-3 py-4 text-center">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                          {day.short}
                        </div>

                        <div
                          className={`mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            day.date === "24"
                              ? "bg-white text-black"
                              : "text-white/65"
                          }`}
                        >
                          {day.date}
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2 p-2.5">
                        {day.tasks.length > 0 ? (
                          day.tasks.map((task, index) => {
                            const colors =
                              colorClasses[
                                task.color as keyof typeof colorClasses
                              ];

                            return (
                              <div
                                key={`${task.subject}-${task.title}-${index}`}
                                className={`group rounded-xl border p-3 transition hover:bg-white/[0.04] ${colors.card}`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <span
                                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colors.dot}`}
                                  />

                                  <div className="min-w-0 flex-1">
                                    <div
                                      className={`text-[10px] font-medium uppercase tracking-wide ${colors.text}`}
                                    >
                                      {task.subject}
                                    </div>

                                    <div className="mt-1 text-xs font-medium leading-4 text-white/75">
                                      {task.title}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    className="shrink-0 text-white/20 transition hover:text-white/60"
                                    aria-label={`Complete ${task.title}`}
                                  >
                                    <Circle className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex min-h-[260px] items-center justify-center">
                            <div className="text-center">
                              <div className="text-xs font-medium text-white/30">
                                Rest day
                              </div>

                              <div className="mt-1 text-[10px] text-white/15">
                                No tasks scheduled
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
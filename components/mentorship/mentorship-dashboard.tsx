"use client";

import { useEffect, useMemo, useState } from "react";
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
  CalendarClock,
  Timer,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/*
 * ================================================================
 * TEMPORARY TEST AUTH
 * ================================================================
 *
 * We are not using Supabase Auth yet.
 * This UUID represents Ahmed, the student we're testing with.
 *
 * When real authentication is implemented, this will be replaced
 * with the authenticated user's ID.
 */

const TEST_STUDENT_ID = "21a7364d-561b-4b5d-b419-b6c5d6492c63";

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  role: string | null;
  year: number | null;
  start_date: string | null;
  end_date: string | null;
  exam_date: string | null;
  mentor_id: string | null;
};

type Objective = {
  id: string;
  text: string;
  completed: boolean;
};

type Task = {
  id: string;
  name: string;
  subject: string | null;
  type: string | null;
  student_id: string;
  completed: boolean;
  date: string;
};

type CalendarDay = {
  name: string;
  short: string;
  date: string;
  isoDate: string;
  tasks: Task[];
};

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
  default: {
    card: "bg-white/[0.025] border-white/[0.08]",
    dot: "bg-white/40",
    text: "text-white/50",
  },
};

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getSubjectColor(subject: string | null) {
  if (!subject) return "default";

  const normalized = subject.toLowerCase();

  if (normalized.includes("anatom")) return "blue";
  if (normalized.includes("physio")) return "red";
  if (normalized.includes("histo")) return "green";

  return "default";
}

function formatWeekRange(start: Date, end: Date) {
  const startMonth = start.toLocaleDateString("en-US", {
    month: "long",
  });

  const endMonth = end.toLocaleDateString("en-US", {
    month: "long",
  });

  const startDay = start.getDate();
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} — ${endDay}`;
  }

  return `${startMonth} ${startDay} — ${endMonth} ${endDay}`;
}

function formatDays(value: number) {
  if (value < 0) return "Passed";
  if (value === 0) return "Today";

  return `${value} ${value === 1 ? "day" : "days"}`;
}

export function MentorshipDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentorName, setMentorName] = useState<string | null>(null);

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [weekStart, setWeekStart] = useState(() =>
    getMonday(new Date())
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * ================================================================
   * WEEK DATES
   * ================================================================
   */

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);

      return {
        date,
        isoDate: formatDate(date),
        name: date.toLocaleDateString("en-US", {
          weekday: "long",
        }),
        short: date
          .toLocaleDateString("en-US", {
            weekday: "short",
          })
          .toUpperCase(),
      };
    });
  }, [weekStart]);

  const weekEnd = weekDays[6]?.date ?? weekStart;

  /*
   * ================================================================
   * LOAD PROFILE + OBJECTIVES + TASKS
   * ================================================================
   */

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        /*
         * ==========================================================
         * TEMPORARY AUTH
         * ==========================================================
         *
         * We are using Ahmed's UUID directly until authentication
         * is implemented.
         */

        const studentId = TEST_STUDENT_ID;

        /*
         * ==========================================================
         * PROFILE
         * ==========================================================
         */

        const { data: profileData, error: profileError } =
          await supabase
            .from("profiles")
            .select(
              "id, username, display_name, role, year, start_date, end_date, exam_date, mentor_id"
            )
            .eq("id", studentId)
            .single();

        if (profileError) {
          throw new Error(
            `Profile query failed: ${profileError.message}`
          );
        }

        if (!profileData) {
          throw new Error("Student profile was not found.");
        }

        setProfile(profileData);

        /*
         * ==========================================================
         * MENTOR
         * ==========================================================
         *
         * We fetch the mentor separately for now.
         */

        if (profileData.mentor_id) {
          const { data: mentorData, error: mentorError } =
            await supabase
              .from("profiles")
              .select("display_name, username")
              .eq("id", profileData.mentor_id)
              .single();

          if (!mentorError && mentorData) {
            setMentorName(
              mentorData.display_name ||
                mentorData.username ||
                "Assigned Mentor"
            );
          } else {
            setMentorName("Assigned Mentor");
          }
        } else {
          setMentorName(null);
        }

        /*
         * ==========================================================
         * OBJECTIVES
         * ==========================================================
         *
         * Objectives are persistent.
         * There is intentionally NO week/date filter here.
         */

const { data: objectiveData, error: objectiveError } =
  await supabase
    .from("objectives")
    .select("id, text, completed")
    .eq("student_id", TEST_STUDENT_ID)
    .order("id");

if (objectiveError) {
  throw objectiveError;
}

setObjectives(Array.isArray(objectiveData) ? objectiveData : []);


        setObjectives(objectiveData ?? []);

        /*
         * ==========================================================
         * TASKS
         * ==========================================================
         *
         * Tasks are date-based, so only load the currently
         * displayed week.
         */

        const { data: taskData, error: taskError } =
          await supabase
            .from("tasks")
            .select(
              "id, name, subject, type, student_id, completed, date"
            )
            .eq("student_id", studentId)
            .gte("date", formatDate(weekStart))
            .lte("date", formatDate(weekEnd))
            .order("date")
            .order("created_at");

        if (taskError) {
          throw taskError;
        }

        setTasks(Array.isArray(taskData) ? taskData : []);

        setTasks(taskData ?? []);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [weekStart, weekEnd]);

  /*
   * ================================================================
   * GROUP TASKS INTO DAYS
   * ================================================================
   */

  const days: CalendarDay[] = useMemo(() => {
    return weekDays.map((day) => ({
      name: day.name,
      short: day.short,
      date: String(day.date.getDate()),
      isoDate: day.isoDate,
      tasks: tasks.filter(
        (task) => task.date === day.isoDate
      ),
    }));
  }, [weekDays, tasks]);

  /*
   * ================================================================
   * TOGGLE OBJECTIVE
   * ================================================================
   */

  async function toggleObjective(objective: Objective) {
    const newCompleted = !objective.completed;

    /*
     * Optimistic UI update
     */

    setObjectives((current) =>
      current.map((item) =>
        item.id === objective.id
          ? {
              ...item,
              completed: newCompleted,
            }
          : item
      )
    );

    const { error } = await supabase
      .from("objectives")
      .update({
        completed: newCompleted,
      })
      .eq("id", objective.id);

    if (error) {
      console.error("Objective update failed:", error);

      /*
       * Revert if Supabase rejected the update
       */

      setObjectives((current) =>
        current.map((item) =>
          item.id === objective.id
            ? {
                ...item,
                completed: objective.completed,
              }
            : item
        )
      );
    }
  }

  /*
   * ================================================================
   * TOGGLE TASK
   * ================================================================
   */

  async function toggleTask(task: Task) {
    const newCompleted = !task.completed;

    /*
     * Optimistic UI update
     */

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              completed: newCompleted,
            }
          : item
      )
    );

    const { error } = await supabase
      .from("tasks")
      .update({
        completed: newCompleted,
      })
      .eq("id", task.id);

    if (error) {
      console.error("Task update failed:", error);

      /*
       * Revert if Supabase rejected the update
       */

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? {
                ...item,
                completed: task.completed,
              }
            : item
        )
      );
    }
  }

  /*
   * ================================================================
   * WEEK NAVIGATION
   * ================================================================
   */

  function previousWeek() {
    setWeekStart((current) => addDays(current, -7));
  }

  function nextWeek() {
    setWeekStart((current) => addDays(current, 7));
  }

  function goToToday() {
    setWeekStart(getMonday(new Date()));
  }

  /*
   * ================================================================
   * STATS
   * ================================================================
   */

  const today = new Date();

  const daysUntilExam = profile?.exam_date
    ? Math.ceil(
        (new Date(profile.exam_date).getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const daysLeftInPlan = profile?.end_date
    ? Math.ceil(
        (new Date(profile.end_date).getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const totalTasks = tasks.length;

  const completedObjectives = objectives.filter(
    (objective) => objective.completed
  ).length;

  const objectiveCount = objectives.length;

  const studentStats = [
    {
      label: "Days Until Exam",
      value:
        daysUntilExam === null
          ? "Not set"
          : formatDays(daysUntilExam),
      icon: CalendarClock,
    },
    {
      label: "Days Left in Plan",
      value:
        daysLeftInPlan === null
          ? "Not set"
          : formatDays(daysLeftInPlan),
      icon: Timer,
    },
    {
      label: "Academic Year",
      value: profile?.year
        ? `Year ${profile.year}`
        : "Not set",
      icon: GraduationCap,
    },
  ];

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  return (
    <div className="min-h-screen bg-[#0b0d10] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="flex min-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111419] shadow-2xl">

        {/* ============================================================
            SIDEBAR
        ============================================================= */}

        <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.07] bg-[#0d0f12] lg:flex lg:flex-col">

          {/* Logo */}

          <div className="flex h-20 items-center border-b border-white/[0.07] px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center">
                <img
                  src="/mediq.svg"
                  alt="MediQ"
                  className="h-9 w-9 object-contain"
                />
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
              {profile?.display_name ||
                profile?.username ||
                "Student"}
            </div>

            <div className="mt-1 text-sm text-white/40">
              Medical Student
            </div>
          </div>

          {/* Mentor */}

          <div className="border-b border-white/[0.07] px-5 py-6">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
              <GraduationCap className="h-3.5 w-3.5" />
              Mentor
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="text-sm font-medium">
                {mentorName || "No mentor assigned"}
              </div>

              <div className="mt-1 text-xs text-white/35">
                Academic Mentor
              </div>
            </div>
          </div>

          {/* Student information */}

          <div className="px-5 py-5">
            <div className="space-y-0">
              {studentStats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`py-4 ${
                      index !== studentStats.length - 1
                        ? "border-b border-white/[0.06]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
                      <Icon className="h-3.5 w-3.5" />
                      {stat.label}
                    </div>

                    <div className="mt-1.5 text-sm font-medium text-white/75">
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Week summary */}

          <div className="mt-auto border-t border-white/[0.07] p-5">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
              <Clock3 className="h-3.5 w-3.5" />
              This Week
            </div>

            <div className="text-2xl font-semibold tracking-tight">
              {totalTasks}
            </div>

            <div className="mt-1 text-xs text-white/35">
              tasks planned
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{
                  width:
                    totalTasks > 0
                      ? `${(completedTasks / totalTasks) * 100}%`
                      : "0%",
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-white/30">
              <span>{completedTasks} completed</span>
              <span>{totalTasks} total</span>
            </div>
          </div>
        </aside>

        {/* ============================================================
            MAIN CONTENT
        ============================================================= */}

        <main className="min-w-0 flex-1">

          {/* Header */}

          <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-7">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/35">
                <CalendarDays className="h-3.5 w-3.5" />
                Weekly Planner
              </div>

              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                {formatWeekRange(weekStart, weekEnd)}
              </h1>
            </div>

            {/* Week navigation */}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={previousWeek}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="hidden h-9 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white sm:block"
              >
                Today
              </button>

              <button
                type="button"
                onClick={nextWeek}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* Loading */}

          {loading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-sm text-white/40">
                Loading your planner...
              </div>
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="p-6">
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
                <div className="text-sm font-medium text-rose-300">
                  Could not load your planner
                </div>

                <div className="mt-2 text-xs text-white/50">
                  {error}
                </div>
              </div>
            </div>
          )}

          {/* Actual dashboard */}

          {!loading && !error && (
            <div className="space-y-5 p-4 sm:p-6">

              {/* ======================================================
                  OBJECTIVES
              ====================================================== */}

              <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">

                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
                      <Target className="h-4 w-4 text-white/70" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold">
                        Objectives
                      </h2>

                      <p className="mt-0.5 text-xs text-white/35">
                        Your ongoing goals
                      </p>
                    </div>
                  </div>

                  <span className="hidden text-xs text-white/30 sm:block">
                    {completedObjectives} of {objectiveCount} complete
                  </span>
                </div>

                {objectives.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-white/30">
                    No objectives yet.
                  </div>
                ) : (
                  <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
                    {objectives.map((objective) => (
                      <button
                        key={objective.id}
                        type="button"
                        onClick={() =>
                          toggleObjective(objective)
                        }
                        className="flex items-start gap-3 bg-[#15181d] px-5 py-4 text-left transition hover:bg-white/[0.025]"
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
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* ======================================================
                  WEEKLY CALENDAR
              ====================================================== */}

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
                        key={day.isoDate}
                        className="min-h-[420px] bg-[#121519]"
                      >

                        {/* Day header */}

                        <div className="border-b border-white/[0.06] px-3 py-4 text-center">
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                            {day.short}
                          </div>

                          <div
                            className={`mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                              day.isoDate === formatDate(today)
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
                            day.tasks.map((task) => {
                              const color =
                                getSubjectColor(task.subject);

                              const colors =
                                colorClasses[color];

                              return (
                                <div
                                  key={task.id}
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
                                        {task.subject ||
                                          task.type ||
                                          "Task"}
                                      </div>

                                      <div
                                        className={`mt-1 text-xs font-medium leading-4 ${
                                          task.completed
                                            ? "text-white/30 line-through"
                                            : "text-white/75"
                                        }`}
                                      >
                                        {task.name}
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleTask(task)
                                      }
                                      className="shrink-0"
                                      aria-label={`Complete ${task.name}`}
                                    >
                                      {task.completed ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                      ) : (
                                        <Circle className="h-4 w-4 text-white/20 transition hover:text-white/60" />
                                      )}
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
          )}
        </main>
      </div>
    </div>
  );
}
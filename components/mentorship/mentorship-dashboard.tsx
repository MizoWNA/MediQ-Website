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
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  getSubjectOption,
  DEFAULT_SUBJECT_COLOR,
} from "@/lib/task-options";

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
function formatWeekRange(
  start: Date | null,
  end: Date | null
) {
  if (!start || !end) {
    return "Loading week...";
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];

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

const [weekStart, setWeekStart] = useState<Date | null>(null);
const [today, setToday] = useState<Date | null>(null);

useEffect(() => {
  const currentDate = new Date();

  setToday(currentDate);
  setWeekStart(getMonday(currentDate));
}, []);


  async function handleLogout() {
  await supabase.auth.signOut();
  router.replace("/login");
}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const router = useRouter();

  /*
   * ================================================================
   * WEEK DATES
   * ================================================================
   */

const weekDays = useMemo(() => {
  if (!weekStart) return [];

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const weekdayShortNames = [
    "SUN",
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
  ];

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);

    return {
      date,
      isoDate: formatDate(date),
      name: weekdayNames[date.getDay()],
      short: weekdayShortNames[date.getDay()],
    };
  });
}, [weekStart]);

  const weekEnd = weekDays[6]?.date ?? weekStart;

  /*
   * ================================================================
   * LOAD DASHBOARD
   * ================================================================
   */

  useEffect(() => {

    if (!weekStart || !weekEnd) {
  return;
}

    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(
            `Authentication failed: ${authError.message}`
          );
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        const studentId = user.id;

        /*
         * PROFILE
         */

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, role, year, start_date, end_date, exam_date, mentor_id"
          )
          .eq("id", studentId)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            `Profile query failed: ${profileError.message}`
          );
        }

        if (!profileData) {
          throw new Error(
            "Your account is authenticated, but no student profile was found for this account."
          );
        }

        if (cancelled) return;

        setProfile(profileData);

        /*
         * MENTOR
         */

        setMentorName(null);

        if (profileData.mentor_id) {
          const {
            data: mentorData,
            error: mentorError,
          } = await supabase
            .from("profiles")
            .select("display_name, username")
            .eq("id", profileData.mentor_id)
            .maybeSingle();

          if (!mentorError && mentorData) {
            setMentorName(
              mentorData.display_name ||
                mentorData.username ||
                "Assigned Mentor"
            );
          } else {
            setMentorName("Assigned Mentor");
          }
        }

        /*
         * OBJECTIVES
         */

        const {
          data: objectiveData,
          error: objectiveError,
        } = await supabase
          .from("objectives")
          .select("id, text, completed")
          .eq("student_id", studentId)
          .order("id");

        if (objectiveError) {
          throw new Error(
            `Objectives query failed: ${objectiveError.message}`
          );
        }

        if (cancelled) return;

        setObjectives(
          Array.isArray(objectiveData) ? objectiveData : []
        );

        /*
         * TASKS
         */

        const {
          data: taskData,
          error: taskError,
        } = await supabase
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
          throw new Error(
            `Tasks query failed: ${taskError.message}`
          );
        }

        if (cancelled) return;

        setTasks(
          Array.isArray(taskData) ? taskData : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Dashboard loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
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
   * WEEK SUBJECTS
   * ================================================================
   */

  const weekSubjects = useMemo(() => {
    const subjects = new Set<string>();

    tasks.forEach((task) => {
      if (task.subject) {
        const option = getSubjectOption(task.subject);

        if (option) {
          subjects.add(option.value);
        }
      }
    });

    return Array.from(subjects)
      .map((value) => getSubjectOption(value))
      .filter(
        (
          option
        ): option is NonNullable<
          ReturnType<typeof getSubjectOption>
        > => option !== null
      );
  }, [tasks]);

  /*
   * ================================================================
   * TOGGLE OBJECTIVE
   * ================================================================
   */

  async function toggleObjective(objective: Objective) {
    const newCompleted = !objective.completed;

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
      console.error(
        "Objective update failed:",
        error
      );

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
      console.error(
        "Task update failed:",
        error
      );

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
    setWeekStart((current) =>
      addDays(current, -7)
    );
  }

  function nextWeek() {
    setWeekStart((current) =>
      addDays(current, 7)
    );
  }

  function goToToday() {
    setWeekStart(getMonday(new Date()));
  }

  /*
   * ================================================================
   * STATS
   * ================================================================
   */

const daysUntilExam =
  profile?.exam_date && today
    ? Math.ceil(
        (new Date(profile.exam_date).getTime() -
          today.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

const daysLeftInPlan =
  profile?.end_date && today
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

  const completedObjectives =
    objectives.filter(
      (objective) => objective.completed
    ).length;

  const objectiveCount =
    objectives.length;

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
   * SIDEBAR CONTENT
   * ================================================================
   */

  const sidebarContent = (
    <>
      {/* Logo */}

      <div
        className={`flex h-20 shrink-0 items-center border-b border-white/[0.07] ${
          sidebarCollapsed
            ? "justify-center px-3"
            : "px-6"
        }`}
      >
        <div
          className={`flex items-center ${
            sidebarCollapsed
              ? "justify-center"
              : "gap-3"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center">
            <img
              src="/mediq.svg"
              alt="MediQ"
              className="h-9 w-9 object-contain"
            />
          </div>

          {!sidebarCollapsed && (
            <div>
              <div className="text-sm font-semibold tracking-tight">
                MediQ
              </div>

              <div className="text-[11px] text-white/40">
                Mentorship
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student */}

      <div
        className={`border-b border-white/[0.07] ${
          sidebarCollapsed
            ? "px-3 py-5"
            : "px-5 py-6"
        }`}
      >
        {!sidebarCollapsed ? (
          <>
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
          </>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/70">
              {(profile?.display_name ||
                profile?.username ||
                "S"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Mentor */}

      <div
        className={`border-b border-white/[0.07] ${
          sidebarCollapsed
            ? "px-3 py-5"
            : "px-5 py-6"
        }`}
      >
        {!sidebarCollapsed ? (
          <>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-white/35">
              <GraduationCap className="h-3.5 w-3.5" />
              Mentor
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="text-sm font-medium">
                {mentorName ||
                  "No mentor assigned"}
              </div>

              <div className="mt-1 text-xs text-white/35">
                Academic Mentor
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div
              title={
                mentorName ||
                "No mentor assigned"
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025]"
            >
              <GraduationCap className="h-4 w-4 text-white/50" />
            </div>
          </div>
        )}
      </div>

      {/* Student information */}

      <div
        className={`${
          sidebarCollapsed
            ? "px-3 py-4"
            : "px-5 py-5"
        }`}
      >
        {!sidebarCollapsed ? (
          <div className="space-y-0">
            {studentStats.map(
              (stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`py-4 ${
                      index !==
                      studentStats.length - 1
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
              }
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {studentStats.map(
              (stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    title={`${stat.label}: ${stat.value}`}
                    className="flex justify-center"
                  >
                    <Icon className="h-4 w-4 text-white/35" />
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

{/* Logout */}

<div className="border-t border-white/[0.07] p-3">
  <button
    type="button"
    onClick={handleLogout}
    className={`group flex w-full items-center rounded-xl text-white/40 transition-all duration-200 hover:bg-rose-500/[0.06] hover:text-rose-300 ${
      sidebarCollapsed
        ? "justify-center px-0 py-2.5"
        : "gap-3 px-3 py-2.5"
    }`}
    aria-label="Log Out"
    title={sidebarCollapsed ? "Log Out" : undefined}
  >
    <LogOut className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />

    {!sidebarCollapsed && (
      <span className="text-sm">
        Log Out
      </span>
    )}
  </button>
</div>




      {/* Week summary */}

      <div
        className={`mt-auto border-t border-white/[0.07] ${
          sidebarCollapsed
            ? "p-3"
            : "p-5"
        }`}
      >
        {!sidebarCollapsed ? (
          <>
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
                      ? `${
                          (completedTasks /
                            totalTasks) *
                          100
                        }%`
                      : "0%",
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-white/30">
              <span>
                {completedTasks} completed
              </span>

              <span>
                {totalTasks} total
              </span>
            </div>
          </>
        ) : (
          <div
            title={`${completedTasks} of ${totalTasks} tasks completed`}
            className="flex flex-col items-center gap-3"
          >
            <Clock3 className="h-4 w-4 text-white/35" />

            <div className="h-24 w-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="w-full rounded-full bg-white transition-all"
                style={{
                  height:
                    totalTasks > 0
                      ? `${
                          (completedTasks /
                            totalTasks) *
                          100
                        }%`
                      : "0%",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Desktop collapse control */}

      <div className="hidden border-t border-white/[0.07] p-3 lg:block">
        <button
          type="button"
          onClick={() =>
            setSidebarCollapsed(
              (current) => !current
            )
          }
          className={`flex h-9 w-full items-center rounded-lg border border-white/[0.07] bg-white/[0.02] text-white/40 transition hover:bg-white/[0.05] hover:text-white ${
            sidebarCollapsed
              ? "justify-center"
              : "justify-center gap-2"
          }`}
          aria-label={
            sidebarCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">
                Collapse
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  return (
    <div className="min-h-screen bg-[#0b0d10] px-0 py-0 text-white sm:px-4 sm:py-4">
      <div className="relative flex min-h-screen w-full overflow-hidden rounded-none border border-white/[0.07] bg-[#111419] shadow-2xl sm:min-h-[calc(100vh-2rem)] sm:rounded-2xl">

        {/* ============================================================
            MOBILE OVERLAY
        ============================================================= */}

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}

        {/* ============================================================
            DESKTOP SIDEBAR
        ============================================================= */}

        <aside
          className={`hidden shrink-0 border-r border-white/[0.07] bg-[#0d0f12] transition-[width] duration-300 lg:flex lg:flex-col ${
            sidebarCollapsed
              ? "w-[76px]"
              : "w-[280px]"
          }`}
        >
          {sidebarContent}
        </aside>

        {/* ============================================================
            MOBILE SIDEBAR
        ============================================================= */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.07] bg-[#0d0f12] shadow-2xl transition-transform duration-300 lg:hidden ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* Mobile close button */}

          <div className="absolute right-4 top-6">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition hover:bg-white/[0.07] hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {sidebarContent}
        </aside>

        {/* ============================================================
            MAIN CONTENT
        ============================================================= */}

        <main className="min-w-0 flex-1">

          {/* Header */}

          <header className="border-b border-white/[0.07] px-4 py-4 sm:px-6 lg:px-7">
            <div className="flex items-center justify-between gap-3">

              {/* Left */}

              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setSidebarOpen(true)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-white/35">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Weekly Planner
                    </span>
                  </div>

                  <h1 className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-2xl">
                    {formatWeekRange(
                      weekStart,
                      weekEnd
                    )}
                  </h1>
                </div>
              </div>

              {/* Week navigation */}

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={previousWeek}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Previous week"
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
                  aria-label="Next week"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile Today button */}

            <div className="mt-3 sm:hidden">
              <button
                type="button"
                onClick={goToToday}
                className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
              >
                Today
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
            <div className="p-4 sm:p-6">
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

                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
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

                  <span className="text-[11px] text-white/30 sm:text-xs">
                    {completedObjectives} of{" "}
                    {objectiveCount} complete
                  </span>
                </div>

                {objectives.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-white/30">
                    No objectives yet.
                  </div>
                ) : (
                  <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
                    {objectives.map(
                      (objective) => (
                        <button
                          key={objective.id}
                          type="button"
                          onClick={() =>
                            toggleObjective(
                              objective
                            )
                          }
                          className="flex items-start gap-3 bg-[#15181d] px-4 py-4 text-left transition hover:bg-white/[0.025] sm:px-5"
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
                      )
                    )}
                  </div>
                )}
              </section>

              {/* ======================================================
                  WEEKLY CALENDAR
              ====================================================== */}

              <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">

                {/* Calendar heading */}

                <div className="flex flex-col gap-3 border-b border-white/[0.07] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
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

                  {weekSubjects.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/35">
                      {weekSubjects.map(
                        (subject) => (
                          <div
                            key={
                              subject.value
                            }
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${subject.color.dot}`}
                            />
                            {subject.label}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* ==================================================
                    DESKTOP CALENDAR
                ================================================== */}

                <div className="hidden overflow-x-auto md:block">
                  <div className="grid grid-cols-7 divide-x divide-white/[0.06]">

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
                              today && day.isoDate === formatDate(today)
                                ? "bg-white text-black"
                                : "text-white/65"
                            }`}
                          >
                            {day.date}
                          </div>
                        </div>

                        {/* Tasks */}

                        <div className="space-y-2 p-2.5">
                          {day.tasks.length >
                          0 ? (
                            day.tasks.map(
                              (task) => {
                                const subject =
                                  getSubjectOption(
                                    task.subject
                                  );

                                const colors =
                                  subject?.color ??
                                  DEFAULT_SUBJECT_COLOR;

                                return (
                                  <div
                                    key={
                                      task.id
                                    }
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
                                          {
                                            task.name
                                          }
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleTask(
                                            task
                                          )
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
                              }
                            )
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

                {/* ==================================================
                    MOBILE CALENDAR
                ================================================== */}

                <div className="divide-y divide-white/[0.06] md:hidden">
                  {days.map((day) => {
                    const isToday =
                      today !== null &&
                      day.isoDate === formatDate(today);

                    return (
                      <div
                        key={day.isoDate}
                        className="bg-[#121519]"
                      >
                        {/* Mobile day header */}

                        <div className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                                isToday
                                  ? "bg-white text-black"
                                  : "bg-white/[0.04] text-white/65"
                              }`}
                            >
                              {day.date}
                            </div>

                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                                {day.name}
                              </div>

                              {isToday && (
                                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
                                  Today
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="text-[11px] text-white/25">
                            {day.tasks.length}{" "}
                            {day.tasks.length ===
                            1
                              ? "task"
                              : "tasks"}
                          </div>
                        </div>

                        {/* Mobile tasks */}

                        <div className="space-y-2 px-3 pb-3">
                          {day.tasks.length >
                          0 ? (
                            day.tasks.map(
                              (task) => {
                                const subject =
                                  getSubjectOption(
                                    task.subject
                                  );

                                const colors =
                                  subject?.color ??
                                  DEFAULT_SUBJECT_COLOR;

                                return (
                                  <div
                                    key={
                                      task.id
                                    }
                                    className={`rounded-xl border p-3.5 ${colors.card}`}
                                  >
                                    <div className="flex items-start gap-3">

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
                                          className={`mt-1 text-sm font-medium leading-5 ${
                                            task.completed
                                              ? "text-white/30 line-through"
                                              : "text-white/75"
                                          }`}
                                        >
                                          {
                                            task.name
                                          }
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          toggleTask(
                                            task
                                          )
                                        }
                                        className="shrink-0"
                                        aria-label={`Complete ${task.name}`}
                                      >
                                        {task.completed ? (
                                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                        ) : (
                                          <Circle className="h-5 w-5 text-white/20 transition hover:text-white/60" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-5 text-center">
                              <div className="text-xs font-medium text-white/25">
                                Rest day
                              </div>

                              <div className="mt-1 text-[10px] text-white/15">
                                No tasks scheduled
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
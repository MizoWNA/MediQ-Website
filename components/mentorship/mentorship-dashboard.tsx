"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  GraduationCap,
  Target,
  BookOpen,
  Clock3,
  UserRound,
  CalendarClock,
  Timer,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardLeaderboard } from "@/components/dashboard/DashboardLeaderboard";
import type { LeaderboardEntry } from "@/components/dashboard/DashboardLeaderboard";

/*
 * ================================================================
 * TEMP LEADERBOARD DATA
 * ================================================================
 *
 * This will eventually come from weekly_leaderboards +
 * weekly_leaderboard_entries.
 *
 * Keep this here for now while we build the database logic.
 */

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Ahmed Mohamed",
    score: 94,
    completedTasks: 23,
    totalTasks: 24,
    completionPercentage: 96,
  },
  {
    id: "2",
    name: "Sara Ahmed",
    score: 91,
    completedTasks: 20,
    totalTasks: 22,
    completionPercentage: 91,
  },
  {
    id: "3",
    name: "You",
    score: 87,
    completedTasks: 18,
    totalTasks: 21,
    completionPercentage: 86,
    isCurrentUser: true,
  },
  {
    id: "4",
    name: "Omar Hassan",
    score: 84,
    completedTasks: 19,
    totalTasks: 24,
    completionPercentage: 79,
  },
  {
    id: "5",
    name: "Youssef Ali",
    score: 81,
    completedTasks: 16,
    totalTasks: 21,
    completionPercentage: 76,
  },
];

/*
 * ================================================================
 * TYPES
 * ================================================================
 */

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

type Subject = {
  id: string;
  name: string;
  display_name: string;
  category: string;
  color: string;
  active: boolean;
  display_order: number;
};

type TaskType = {
  id: string;
  name: string;
  points: number;
  active: boolean;
  display_order: number;
};

type Objective = {
  id: string;
  text: string;
  completed: boolean;
};

type Task = {
  id: string;
  name: string;
  subject_id: string;
  task_type_id: string;
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

/*
 * ================================================================
 * DATE HELPERS
 * ================================================================
 */

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getSunday(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const diff = day === 0 ? 0 : -day;

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

/*
 * ================================================================
 * DASHBOARD
 * ================================================================
 */

export function MentorshipDashboard() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [mentorName, setMentorName] =
    useState<string | null>(null);

  const [objectives, setObjectives] =
    useState<Objective[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [taskTypes, setTaskTypes] =
    useState<TaskType[]>([]);

  const [weekStart, setWeekStart] =
    useState<Date | null>(null);

  const [today, setToday] =
    useState<Date | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  /*
   * ================================================================
   * INITIAL DATE
   * ================================================================
   */

  useEffect(() => {
    const currentDate = new Date();

    setToday(currentDate);
    setWeekStart(getSunday(currentDate));
  }, []);

  /*
   * ================================================================
   * LOGOUT
   * ================================================================
   */

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

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

  const weekEnd =
    weekDays[6]?.date ?? weekStart;

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
        /*
         * AUTH
         */

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
          Array.isArray(objectiveData)
            ? objectiveData
            : []
        );

        /*
         * SUBJECTS
         */

        const {
          data: subjectData,
          error: subjectError,
        } = await supabase
          .from("subjects")
          .select(
            "id, name, display_name, category, color, active, display_order"
          )
          .eq("active", true)
          .order("display_order");

        if (subjectError) {
          throw new Error(
            `Subjects query failed: ${subjectError.message}`
          );
        }

        if (cancelled) return;

        setSubjects(
          Array.isArray(subjectData)
            ? subjectData
            : []
        );

        /*
         * TASK TYPES
         */

        const {
          data: taskTypeData,
          error: taskTypeError,
        } = await supabase
          .from("task_types")
          .select(
            "id, name, points, active, display_order"
          )
          .eq("active", true)
          .order("display_order");

        if (taskTypeError) {
          throw new Error(
            `Task types query failed: ${taskTypeError.message}`
          );
        }

        if (cancelled) return;

        setTaskTypes(
          Array.isArray(taskTypeData)
            ? taskTypeData
            : []
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
            "id, name, subject_id, task_type_id, student_id, completed, date"
          )
          .eq("student_id", studentId)
          .gte(
            "date",
            formatDate(weekStart)
          )
          .lte(
            "date",
            formatDate(weekEnd)
          )
          .order("date")
          .order("created_at");

        if (taskError) {
          throw new Error(
            `Tasks query failed: ${taskError.message}`
          );
        }

        if (cancelled) return;

        setTasks(
          Array.isArray(taskData)
            ? taskData
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Dashboard loading error:",
          err
        );

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

  const days: CalendarDay[] =
    useMemo(() => {
      return weekDays.map((day) => ({
        name: day.name,
        short: day.short,
        date: String(day.date.getDate()),
        isoDate: day.isoDate,
        tasks: tasks.filter(
          (task) =>
            task.date === day.isoDate
        ),
      }));
    }, [weekDays, tasks]);

  /*
   * ================================================================
   * WEEK SUBJECTS
   * ================================================================
   */

  const weekSubjects = useMemo(() => {
    const subjectIds = new Set(
      tasks.map(
        (task) => task.subject_id
      )
    );

    return subjects.filter(
      (subject) =>
        subjectIds.has(subject.id)
    );
  }, [tasks, subjects]);

  /*
   * ================================================================
   * TOGGLE OBJECTIVE
   * ================================================================
   */

  async function toggleObjective(
    objective: Objective
  ) {
    const newCompleted =
      !objective.completed;

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
                completed:
                  objective.completed,
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
    const newCompleted =
      !task.completed;

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
                completed:
                  task.completed,
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
      current
        ? addDays(current, -7)
        : current
    );
  }

  function nextWeek() {
    setWeekStart((current) =>
      current
        ? addDays(current, 7)
        : current
    );
  }

  function goToToday() {
    setWeekStart(
      getSunday(new Date())
    );
  }

  /*
   * ================================================================
   * STATS
   * ================================================================
   */

  const daysUntilExam =
    profile?.exam_date && today
      ? Math.ceil(
          (new Date(
            profile.exam_date
          ).getTime() -
            today.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        )
      : null;

  const daysLeftInPlan =
    profile?.end_date && today
      ? Math.ceil(
          (new Date(
            profile.end_date
          ).getTime() -
            today.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        )
      : null;

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const totalTasks =
    tasks.length;

  const completedObjectives =
    objectives.filter(
      (objective) =>
        objective.completed
    ).length;

  const objectiveCount =
    objectives.length;

  const studentStats = [
    {
      label: "Days Until Exam",
      value:
        daysUntilExam === null
          ? "Not set"
          : formatDays(
              daysUntilExam
            ),
      icon: CalendarClock,
    },
    {
      label: "Days Left in Plan",
      value:
        daysLeftInPlan === null
          ? "Not set"
          : formatDays(
              daysLeftInPlan
            ),
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
   * SIDEBAR
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
              {(
                profile?.display_name ||
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
                const Icon =
                  stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`py-4 ${
                      index !==
                      studentStats.length -
                        1
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
                const Icon =
                  stat.icon;

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
          title={
            sidebarCollapsed
              ? "Log Out"
              : undefined
          }
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
                {completedTasks}{" "}
                completed
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
    <DashboardShell
      sidebarOpen={sidebarOpen}
      onSidebarOpenChange={
        setSidebarOpen
      }
      sidebarCollapsed={
        sidebarCollapsed
      }
      onSidebarCollapsedChange={
        setSidebarCollapsed
      }
      sidebarContent={
        sidebarContent
      }
    >
      <DashboardHeader
        onSidebarOpen={() =>
          setSidebarOpen(true)
        }
        weekRangeText={formatWeekRange(
          weekStart,
          weekEnd
        )}
        onPreviousWeek={
          previousWeek
        }
        onNextWeek={nextWeek}
        onGoToToday={
          goToToday
        }
      />

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
              OBJECTIVES + LEADERBOARD
          ====================================================== */}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

            {/* OBJECTIVES */}

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
                  {completedObjectives}{" "}
                  of{" "}
                  {objectiveCount}{" "}
                  complete
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
                        key={
                          objective.id
                        }
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
                          {
                            objective.text
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </section>

            {/* LEADERBOARD */}

            <DashboardLeaderboard
              entries={
                mockLeaderboard
              }
            />
          </div>

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

              {weekSubjects.length >
                0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-white/35">
                  {weekSubjects.map(
                    (subject) => (
                      <div
                        key={
                          subject.id
                        }
                        className="flex items-center gap-1.5"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              subject.color,
                          }}
                        />

                        {
                          subject.display_name
                        }
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            <DashboardCalendar
              days={days}
              today={today}
              onToggleTask={
                toggleTask
              }
              breakpoint="md"
            />
          </section>
        </div>
      )}
    </DashboardShell>
  );
}
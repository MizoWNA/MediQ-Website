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
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

type StudentSummary = Profile & {
  weeklyTasks: number;
  completedTasks: number;
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

export function MentorDashboard() {
  const router = useRouter();

  const [mentorProfile, setMentorProfile] =
    useState<Profile | null>(null);

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] =
    useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] =
    useState<Profile | null>(null);

  const [objectives, setObjectives] =
    useState<Objective[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [weekStart, setWeekStart] = useState(() =>
    getMonday(new Date())
  );

  const [loading, setLoading] = useState(true);
  const [loadingStudent, setLoadingStudent] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [studentError, setStudentError] =
    useState<string | null>(null);

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

  const weekEnd =
    weekDays[6]?.date ?? weekStart;

  /*
   * ================================================================
   * LOAD MENTOR + STUDENTS
   * ================================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadMentorDashboard() {
      setLoading(true);
      setError(null);

      try {
        /*
         * ==========================================================
         * AUTHENTICATED USER
         * ==========================================================
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

        /*
         * ==========================================================
         * MENTOR PROFILE
         * ==========================================================
         */

        const {
          data: mentorData,
          error: mentorError,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, role, year, start_date, end_date, exam_date, mentor_id"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (mentorError) {
          throw new Error(
            `Mentor profile query failed: ${mentorError.message}`
          );
        }

        if (!mentorData) {
          throw new Error(
            "Your account is authenticated, but no mentor profile was found."
          );
        }

        if (mentorData.role !== "mentor") {
          router.replace("/dashboard");
          return;
        }

        if (cancelled) return;

        setMentorProfile(mentorData);

        /*
         * ==========================================================
         * ASSIGNED STUDENTS
         * ==========================================================
         *
         * RLS ensures that this only returns students assigned to
         * the authenticated mentor.
         */

        const {
          data: studentData,
          error: studentsError,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, role, year, start_date, end_date, exam_date, mentor_id"
          )
          .eq("role", "student")
          .eq("mentor_id", user.id)
          .order("display_name");

        if (studentsError) {
          throw new Error(
            `Students query failed: ${studentsError.message}`
          );
        }

        if (cancelled) return;

        const assignedStudents =
          Array.isArray(studentData)
            ? studentData
            : [];

        /*
         * ==========================================================
         * LOAD CURRENT WEEK TASK COUNTS
         * ==========================================================
         */

        let summaries: StudentSummary[] =
          assignedStudents.map((student) => ({
            ...student,
            weeklyTasks: 0,
            completedTasks: 0,
          }));

        if (assignedStudents.length > 0) {
          const studentIds =
            assignedStudents.map(
              (student) => student.id
            );

          const {
            data: taskData,
            error: taskError,
          } = await supabase
            .from("tasks")
            .select(
              "id, student_id, completed, date"
            )
            .in("student_id", studentIds)
            .gte(
              "date",
              formatDate(weekStart)
            )
            .lte(
              "date",
              formatDate(weekEnd)
            );

          if (taskError) {
            throw new Error(
              `Student task summary failed: ${taskError.message}`
            );
          }

          if (cancelled) return;

          const weeklyTasks =
            Array.isArray(taskData)
              ? taskData
              : [];

          summaries = assignedStudents.map(
            (student) => {
              const studentTasks =
                weeklyTasks.filter(
                  (task) =>
                    task.student_id ===
                    student.id
                );

              return {
                ...student,
                weeklyTasks:
                  studentTasks.length,
                completedTasks:
                  studentTasks.filter(
                    (task) =>
                      task.completed
                  ).length,
              };
            }
          );
        }

        if (cancelled) return;

        setStudents(summaries);

        /*
         * Automatically select the first student.
         */

        setSelectedStudentId(
          (current) =>
            current &&
            summaries.some(
              (student) =>
                student.id === current
            )
              ? current
              : summaries[0]?.id ?? null
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Mentor dashboard loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load mentor dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMentorDashboard();

    return () => {
      cancelled = true;
    };
  }, [router, weekStart, weekEnd]);

  /*
   * ================================================================
   * LOAD SELECTED STUDENT
   * ================================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadStudent() {
      if (!selectedStudentId) {
        setSelectedStudent(null);
        setObjectives([]);
        setTasks([]);
        return;
      }

      setLoadingStudent(true);
      setStudentError(null);

      try {
        /*
         * ==========================================================
         * STUDENT PROFILE
         * ==========================================================
         */

        const {
          data: studentData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "id, username, display_name, role, year, start_date, end_date, exam_date, mentor_id"
          )
          .eq("id", selectedStudentId)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            `Student profile query failed: ${profileError.message}`
          );
        }

        if (!studentData) {
          throw new Error(
            "The selected student could not be found."
          );
        }

        /*
         * ==========================================================
         * OBJECTIVES
         * ==========================================================
         */

        const {
          data: objectiveData,
          error: objectiveError,
        } = await supabase
          .from("objectives")
          .select(
            "id, text, completed"
          )
          .eq(
            "student_id",
            selectedStudentId
          )
          .order("id");

        if (objectiveError) {
          throw new Error(
            `Objectives query failed: ${objectiveError.message}`
          );
        }

        /*
         * ==========================================================
         * TASKS
         * ==========================================================
         */

        const {
          data: taskData,
          error: taskError,
        } = await supabase
          .from("tasks")
          .select(
            "id, name, subject, type, student_id, completed, date"
          )
          .eq(
            "student_id",
            selectedStudentId
          )
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

        setSelectedStudent(studentData);

        setObjectives(
          Array.isArray(objectiveData)
            ? objectiveData
            : []
        );

        setTasks(
          Array.isArray(taskData)
            ? taskData
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Selected student loading error:",
          err
        );

        setStudentError(
          err instanceof Error
            ? err.message
            : "Failed to load student."
        );
      } finally {
        if (!cancelled) {
          setLoadingStudent(false);
        }
      }
    }

    loadStudent();

    return () => {
      cancelled = true;
    };
  }, [
    selectedStudentId,
    weekStart,
    weekEnd,
  ]);

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
        (task) =>
          task.date === day.isoDate
      ),
    }));
  }, [weekDays, tasks]);

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
   * SELECTED STUDENT STATS
   * ================================================================
   */

  const today = new Date();

  const daysUntilExam =
    selectedStudent?.exam_date
      ? Math.ceil(
          (new Date(
            selectedStudent.exam_date
          ).getTime() -
            today.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const daysLeftInPlan =
    selectedStudent?.end_date
      ? Math.ceil(
          (new Date(
            selectedStudent.end_date
          ).getTime() -
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
      value: selectedStudent?.year
        ? `Year ${selectedStudent.year}`
        : "Not set",
      icon: GraduationCap,
    },
  ];

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d10] text-white">
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading mentor dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0d10] px-4 py-4 text-white sm:px-6 lg:px-8">
        <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#111419] p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400" />

              <div className="text-sm font-medium text-rose-300">
                Could not load mentor dashboard
              </div>
            </div>

            <div className="mt-3 text-xs leading-5 text-white/45">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d10] px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="flex min-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111419] shadow-2xl">

        {/* ============================================================
            SIDEBAR
        ============================================================= */}

        <aside className="flex w-[280px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0f12]">

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

          {/* Mentor */}

          <div className="border-b border-white/[0.07] px-5 py-5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
              <UserRound className="h-3.5 w-3.5" />
              Mentor
            </div>

            <div className="text-lg font-semibold tracking-tight">
              {mentorProfile?.display_name ||
                mentorProfile?.username ||
                "Mentor"}
            </div>

            <div className="mt-1 text-xs text-white/35">
              Academic Mentor
            </div>
          </div>

          {/* Students */}

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
                <Users className="h-3.5 w-3.5" />
                My Students
              </div>

              <span className="text-[10px] text-white/25">
                {students.length}
              </span>
            </div>

            {students.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Users className="mx-auto h-5 w-5 text-white/15" />

                <div className="mt-3 text-xs text-white/30">
                  No students assigned yet.
                </div>
              </div>
            ) : (
              <div className="space-y-1 px-2.5 pb-4">
                {students.map((student) => {
                  const isSelected =
                    student.id ===
                    selectedStudentId;

                  const progress =
                    student.weeklyTasks > 0
                      ? (student.completedTasks /
                          student.weeklyTasks) *
                        100
                      : 0;

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() =>
                        setSelectedStudentId(
                          student.id
                        )
                      }
                      className={`w-full rounded-xl px-3.5 py-3 text-left transition ${
                        isSelected
                          ? "bg-white/[0.07]"
                          : "hover:bg-white/[0.035]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            progress === 100 &&
                            student.weeklyTasks > 0
                              ? "bg-emerald-400"
                              : isSelected
                                ? "bg-white/70"
                                : "bg-white/20"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-sm font-medium ${
                              isSelected
                                ? "text-white"
                                : "text-white/65"
                            }`}
                          >
                            {student.display_name ||
                              student.username ||
                              "Unnamed Student"}
                          </div>

                          <div className="mt-1 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-white/30">
                              {student.completedTasks}{" "}
                              /{" "}
                              {student.weeklyTasks}{" "}
                              tasks
                            </span>

                            <span className="text-[10px] text-white/25">
                              {Math.round(
                                progress
                              )}
                              %
                            </span>
                          </div>

                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-white/60 transition-all"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar footer */}

          <div className="border-t border-white/[0.07] p-5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-white/25">
              Students
            </div>

            <div className="mt-1 text-2xl font-semibold tracking-tight">
              {students.length}
            </div>

            <div className="mt-1 text-xs text-white/30">
              assigned to you
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
                Student Planner
              </div>

              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                {selectedStudent
                  ? selectedStudent.display_name ||
                    selectedStudent.username ||
                    "Student"
                  : "Select a student"}
              </h1>

              {selectedStudent && (
                <p className="mt-1 text-xs text-white/30">
                  {selectedStudent.year
                    ? `Year ${selectedStudent.year}`
                    : "Medical Student"}
                  {selectedStudent.exam_date
                    ? ` · Exam ${new Date(
                        selectedStudent.exam_date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}`
                    : ""}
                </p>
              )}
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

          {/* No students */}

          {!selectedStudentId &&
            students.length === 0 && (
              <div className="flex min-h-[500px] items-center justify-center p-6">
                <div className="text-center">
                  <Users className="mx-auto h-7 w-7 text-white/15" />

                  <div className="mt-4 text-sm font-medium text-white/40">
                    No students assigned
                  </div>

                  <div className="mt-1 text-xs text-white/25">
                    Students assigned to you will appear
                    here.
                  </div>
                </div>
              </div>
            )}

          {/* Select student */}

          {!selectedStudentId &&
            students.length > 0 && (
              <div className="flex min-h-[500px] items-center justify-center p-6">
                <div className="text-center">
                  <UserRound className="mx-auto h-7 w-7 text-white/15" />

                  <div className="mt-4 text-sm font-medium text-white/40">
                    Select a student
                  </div>

                  <div className="mt-1 text-xs text-white/25">
                    Choose a student from the sidebar to
                    view their planner.
                  </div>
                </div>
              </div>
            )}

          {/* Student loading */}

          {selectedStudentId &&
            loadingStudent && (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-white/35">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading student planner...
                </div>
              </div>
            )}

          {/* Student error */}

          {selectedStudentId &&
            !loadingStudent &&
            studentError && (
              <div className="p-6">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
                  <div className="text-sm font-medium text-rose-300">
                    Could not load student planner
                  </div>

                  <div className="mt-2 text-xs text-white/50">
                    {studentError}
                  </div>
                </div>
              </div>
            )}

          {/* Actual student planner */}

          {selectedStudentId &&
            !loadingStudent &&
            !studentError &&
            selectedStudent && (
              <div className="space-y-5 p-4 sm:p-6">

                {/* ====================================================
                    STUDENT INFO
                ==================================================== */}

                <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
                  <div className="grid gap-px bg-white/[0.05] sm:grid-cols-3">

                    {studentStats.map(
                      (stat) => {
                        const Icon = stat.icon;

                        return (
                          <div
                            key={stat.label}
                            className="bg-[#15181d] px-5 py-4"
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
                </section>

                {/* ====================================================
                    OBJECTIVES
                ==================================================== */}

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
                          {completedObjectives} of{" "}
                          {objectiveCount} complete
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      + Add Objective
                    </button>
                  </div>

                  {objectives.length === 0 ? (
                    <div className="px-5 py-8 text-center text-sm text-white/30">
                      No objectives yet.
                    </div>
                  ) : (
                    <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
                      {objectives.map(
                        (objective) => (
                          <div
                            key={
                              objective.id
                            }
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
                        )
                      )}
                    </div>
                  )}
                </section>

                {/* ====================================================
                    WEEKLY CALENDAR
                ==================================================== */}

                <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">

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
                          {formatWeekRange(
                            weekStart,
                            weekEnd
                          )}
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
                                day.isoDate ===
                                formatDate(
                                  today
                                )
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
                                  const color =
                                    getSubjectColor(
                                      task.subject
                                    );

                                  const colors =
                                    colorClasses[
                                      color
                                    ];

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

                                        <div className="shrink-0">
                                          {task.completed ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                          ) : (
                                            <Circle className="h-4 w-4 text-white/20" />
                                          )}
                                        </div>
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
                </section>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Menu,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  GraduationCap,
  Target,
  BookOpen,
  UserRound,
  CalendarClock,
  Timer,
  Users,
  Loader2,
  AlertCircle,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Save,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  SUBJECT_OPTIONS,
  TASK_TYPE_OPTIONS,
  DEFAULT_SUBJECT_COLOR,
  getSubjectOption,
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
  created_at?: string;
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

type ModalType = "objective" | "task" | null;

type TaskForm = {
  name: string;
  subject: string;
  type: string;
  date: string;
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

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  async function handleLogout() {
  await supabase.auth.signOut();
  router.replace("/login");
}

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

  const [modal, setModal] =
    useState<ModalType>(null);

  const [editingObjective, setEditingObjective] =
    useState<Objective | null>(null);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [objectiveText, setObjectiveText] =
    useState("");

  const [taskForm, setTaskForm] = useState<TaskForm>({
    name: "",
    subject: "",
    type: "",
    date: formatDate(new Date()),
  });

  const [saving, setSaving] = useState(false);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [openTaskMenu, setOpenTaskMenu] =
    useState<string | null>(null);

  const [openObjectiveMenu, setOpenObjectiveMenu] =
    useState<string | null>(null);

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
   * SUBJECTS USED THIS WEEK
   * ================================================================
   *
   * Only subjects that actually appear in the current week's tasks
   * are shown in the legend.
   *
   * Unknown/custom subjects are also included using the default color.
   */

  const weekSubjects = useMemo(() => {
    const seen = new Set<string>();

    return tasks.reduce<
      Array<{
        value: string;
        label: string;
        color: typeof DEFAULT_SUBJECT_COLOR;
      }>
    >((result, task) => {
      if (!task.subject) return result;

      const normalized = task.subject.toLowerCase();

      if (seen.has(normalized)) return result;

      seen.add(normalized);

      const option = getSubjectOption(task.subject);

      result.push({
        value: normalized,
        label:
          option?.label ??
          task.subject,
        color:
          option?.color ??
          DEFAULT_SUBJECT_COLOR,
      });

      return result;
    }, []);
  }, [tasks]);

  useEffect(() => {
    let cancelled = false;

    async function loadMentorDashboard() {
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

        const {
          data: objectiveData,
          error: objectiveError,
        } = await supabase
          .from("objectives")
          .select("id, text, completed")
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

        const {
          data: taskData,
          error: taskError,
        } = await supabase
          .from("tasks")
          .select(
            "id, name, subject, type, student_id, completed, date, created_at"
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

  function updateStudentTaskSummary(
    taskStudentId: string,
    taskList: Task[]
  ) {
    const weeklyTasks = taskList.length;

    const completedTasks =
      taskList.filter(
        (task) => task.completed
      ).length;

    setStudents((current) =>
      current.map((student) =>
        student.id === taskStudentId
          ? {
              ...student,
              weeklyTasks,
              completedTasks,
            }
          : student
      )
    );
  }

  function openAddObjective() {
    setActionError(null);
    setEditingObjective(null);
    setObjectiveText("");
    setModal("objective");
  }

  function openEditObjective(
    objective: Objective
  ) {
    setActionError(null);
    setEditingObjective(objective);
    setObjectiveText(objective.text);
    setOpenObjectiveMenu(null);
    setModal("objective");
  }

  async function saveObjective() {
    if (!selectedStudentId) return;

    const text = objectiveText.trim();

    if (!text) {
      setActionError(
        "Objective text cannot be empty."
      );
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      if (editingObjective) {
        const {
          data,
          error,
        } = await supabase
          .from("objectives")
          .update({
            text,
          })
          .eq(
            "id",
            editingObjective.id
          )
          .eq(
            "student_id",
            selectedStudentId
          )
          .select(
            "id, text, completed"
          )
          .single();

        if (error) {
          throw error;
        }

        setObjectives((current) =>
          current.map((objective) =>
            objective.id === data.id
              ? data
              : objective
          )
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("objectives")
          .insert({
            student_id: selectedStudentId,
            text,
            completed: false,
          })
          .select(
            "id, text, completed"
          )
          .single();

        if (error) {
          throw error;
        }

        setObjectives((current) => [
          ...current,
          data,
        ]);
      }

      setModal(null);
      setEditingObjective(null);
      setObjectiveText("");
    } catch (err) {
      console.error(
        "Objective save error:",
        err
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to save objective."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleObjective(
    objective: Objective
  ) {
    setActionError(null);

    const nextCompleted =
      !objective.completed;

    setObjectives((current) =>
      current.map((item) =>
        item.id === objective.id
          ? {
              ...item,
              completed: nextCompleted,
            }
          : item
      )
    );

    const {
      error,
    } = await supabase
      .from("objectives")
      .update({
        completed: nextCompleted,
      })
      .eq("id", objective.id)
      .eq(
        "student_id",
        selectedStudentId
      );

    if (error) {
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

      setActionError(
        `Failed to update objective: ${error.message}`
      );
    }
  }

  async function deleteObjective(
    objective: Objective
  ) {
    const confirmed = window.confirm(
      `Delete "${objective.text}"?`
    );

    if (!confirmed) return;

    setActionError(null);

    const previous = objectives;

    setObjectives((current) =>
      current.filter(
        (item) =>
          item.id !== objective.id
      )
    );

    const {
      error,
    } = await supabase
      .from("objectives")
      .delete()
      .eq("id", objective.id)
      .eq(
        "student_id",
        selectedStudentId
      );

    if (error) {
      setObjectives(previous);

      setActionError(
        `Failed to delete objective: ${error.message}`
      );
    }
  }

  function openAddTask(
    date?: string
  ) {
    setActionError(null);
    setEditingTask(null);

    setTaskForm({
      name: "",
      subject: "",
      type: "",
      date:
        date ||
        weekDays[0]?.isoDate ||
        formatDate(new Date()),
    });

    setModal("task");
  }

  function openEditTask(task: Task) {
    setActionError(null);
    setEditingTask(task);

    setTaskForm({
      name: task.name,
      subject: task.subject
        ? task.subject.toLowerCase()
        : "",
      type: task.type
        ? task.type.toLowerCase()
        : "",
      date: task.date,
    });

    setOpenTaskMenu(null);
    setModal("task");
  }

  async function saveTask() {
    if (!selectedStudentId) return;

    const name = taskForm.name.trim();

    if (!name) {
      setActionError(
        "Task name cannot be empty."
      );
      return;
    }

    if (!taskForm.date) {
      setActionError(
        "Please select a date."
      );
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      if (editingTask) {
        const {
          data,
          error,
        } = await supabase
          .from("tasks")
          .update({
            name,
            subject:
              taskForm.subject || null,
            type:
              taskForm.type || null,
            date: taskForm.date,
          })
          .eq("id", editingTask.id)
          .eq(
            "student_id",
            selectedStudentId
          )
          .select(
            "id, name, subject, type, student_id, completed, date, created_at"
          )
          .single();

        if (error) {
          throw error;
        }

        if (
          data.date >=
            formatDate(weekStart) &&
          data.date <=
            formatDate(weekEnd)
        ) {
          setTasks((current) =>
            current
              .map((task) =>
                task.id === data.id
                  ? data
                  : task
              )
              .sort((a, b) => {
                const dateCompare =
                  a.date.localeCompare(
                    b.date
                  );

                if (dateCompare !== 0) {
                  return dateCompare;
                }

                return (
                  (a.created_at || "").localeCompare(
                    b.created_at || ""
                  )
                );
              })
          );
        } else {
          setTasks((current) =>
            current.filter(
              (task) =>
                task.id !== data.id
            )
          );
        }

        const nextTasks = tasks
          .map((task) =>
            task.id === editingTask.id
              ? data
              : task
          )
          .filter(
            (task) =>
              task.date >=
                formatDate(weekStart) &&
              task.date <=
                formatDate(weekEnd)
          );

        updateStudentTaskSummary(
          selectedStudentId,
          nextTasks
        );
      } else {
        const {
          data,
          error,
        } = await supabase
          .from("tasks")
          .insert({
            student_id:
              selectedStudentId,
            name,
            subject:
              taskForm.subject || null,
            type:
              taskForm.type || null,
            date: taskForm.date,
            completed: false,
          })
          .select(
            "id, name, subject, type, student_id, completed, date, created_at"
          )
          .single();

        if (error) {
          throw error;
        }

        if (
          data.date >=
            formatDate(weekStart) &&
          data.date <=
            formatDate(weekEnd)
        ) {
          setTasks((current) =>
            [...current, data].sort(
              (a, b) => {
                const dateCompare =
                  a.date.localeCompare(
                    b.date
                  );

                if (dateCompare !== 0) {
                  return dateCompare;
                }

                return (
                  (a.created_at || "").localeCompare(
                    b.created_at || ""
                  )
                );
              }
            )
          );
        }

        await refreshStudentSummary();
      }

      setModal(null);
      setEditingTask(null);
    } catch (err) {
      console.error(
        "Task save error:",
        err
      );

      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to save task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: Task) {
    setActionError(null);

    const nextCompleted =
      !task.completed;

    const nextTasks = tasks.map((item) =>
      item.id === task.id
        ? {
            ...item,
            completed: nextCompleted,
          }
        : item
    );

    setTasks(nextTasks);

    updateStudentTaskSummary(
      selectedStudentId!,
      nextTasks
    );

    const {
      error,
    } = await supabase
      .from("tasks")
      .update({
        completed: nextCompleted,
      })
      .eq("id", task.id)
      .eq(
        "student_id",
        selectedStudentId
      );

    if (error) {
      setTasks(tasks);

      updateStudentTaskSummary(
        selectedStudentId!,
        tasks
      );

      setActionError(
        `Failed to update task: ${error.message}`
      );
    }
  }

  async function deleteTask(task: Task) {
    const confirmed = window.confirm(
      `Delete "${task.name}"?`
    );

    if (!confirmed) return;

    setOpenTaskMenu(null);
    setActionError(null);

    const previous = tasks;

    const nextTasks = tasks.filter(
      (item) => item.id !== task.id
    );

    setTasks(nextTasks);

    updateStudentTaskSummary(
      selectedStudentId!,
      nextTasks
    );

    const {
      error,
    } = await supabase
      .from("tasks")
      .delete()
      .eq("id", task.id)
      .eq(
        "student_id",
        selectedStudentId
      );

    if (error) {
      setTasks(previous);

      updateStudentTaskSummary(
        selectedStudentId!,
        previous
      );

      setActionError(
        `Failed to delete task: ${error.message}`
      );
    }
  }

  async function refreshStudentSummary() {
    if (!selectedStudentId) return;

    const {
      data,
      error,
    } = await supabase
      .from("tasks")
      .select(
        "id, student_id, completed, date"
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
      );

    if (error) {
      console.error(
        "Failed to refresh student summary:",
        error
      );
      return;
    }

    const weeklyTasks =
      Array.isArray(data)
        ? data
        : [];

    setStudents((current) =>
      current.map((student) =>
        student.id === selectedStudentId
          ? {
              ...student,
              weeklyTasks:
                weeklyTasks.length,
              completedTasks:
                weeklyTasks.filter(
                  (task) =>
                    task.completed
                ).length,
            }
          : student
      )
    );
  }

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
    <div
      className="min-h-screen bg-[#0b0d10] px-2 py-2 text-white sm:px-6 sm:py-4 lg:px-8"
      onClick={() => {
        setOpenTaskMenu(null);
        setOpenObjectiveMenu(null);
      }}
    >
      <div className="relative flex min-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111419] shadow-2xl">

        <aside
  className={`
    absolute inset-y-0 left-0 z-40
    flex flex-col
    border-r border-white/[0.07]
    bg-[#0d0f12]
    shadow-2xl
    transition-all duration-300 ease-in-out

    lg:relative lg:z-auto lg:shadow-none

    ${
      mobileSidebarOpen
        ? "translate-x-0"
        : "-translate-x-full"
    }

    lg:translate-x-0

    ${
      sidebarCollapsed
        ? "lg:w-[76px]"
        : "lg:w-[280px]"
    }

    w-[280px]
    shrink-0
  `}
>
  {/* Sidebar header */}
  <div
    className={`
      flex h-20 shrink-0 items-center
      border-b border-white/[0.07]
      ${
        sidebarCollapsed
          ? "lg:justify-center lg:px-3"
          : "justify-between px-6"
      }
    `}
  >
    <div
      className={`
        flex items-center gap-3
        ${
          sidebarCollapsed
            ? "lg:justify-center"
            : ""
        }
      `}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center">
        <img
          src="/mediq.svg"
          alt="MediQ"
          className="h-9 w-9 object-contain"
        />
      </div>

      <div
        className={`
          min-w-0 transition-all duration-200
          ${
            sidebarCollapsed
              ? "lg:hidden"
              : ""
          }
        `}
      >
        <div className="text-sm font-semibold tracking-tight">
          MediQ
        </div>

        <div className="text-[11px] text-white/40">
          Mentorship
        </div>
      </div>
    </div>

    {/* Desktop collapse button */}
    <button
      type="button"
      onClick={() =>
        setSidebarCollapsed(
          (current) => !current
        )
      }
      className={`
        hidden h-8 w-8 items-center justify-center
        rounded-lg text-white/30
        transition hover:bg-white/[0.06]
        hover:text-white
        lg:flex
        ${
          sidebarCollapsed
            ? "lg:hidden"
            : ""
        }
      `}
      title="Collapse sidebar"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>

    {/* Mobile close button */}
    <button
      type="button"
      onClick={() =>
        setMobileSidebarOpen(false)
      }
      className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
      title="Close sidebar"
    >
      <X className="h-4 w-4" />
    </button>
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

  {/* Collapsed desktop expand button */}
  {sidebarCollapsed && (
    <div className="hidden border-b border-white/[0.07] p-3 lg:block">
      <button
        type="button"
        onClick={() =>
          setSidebarCollapsed(false)
        }
        className="flex h-9 w-full items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white"
        title="Expand sidebar"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )}

  {/* Mentor information */}
  <div
    className={`
      border-b border-white/[0.07]
      px-5 py-5
      ${
        sidebarCollapsed
          ? "lg:hidden"
          : ""
      }
    `}
  >
    <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
      <UserRound className="h-3.5 w-3.5" />
      Mentor
    </div>

    <div className="truncate text-lg font-semibold tracking-tight">
      {mentorProfile?.display_name ||
        mentorProfile?.username ||
        "Mentor"}
    </div>

    <div className="mt-1 text-xs text-white/35">
      Academic Mentor
    </div>
  </div>

  {/* Students */}
  <div className="min-h-0 flex-1 overflow-y-auto">
    <div
      className={`
        flex items-center justify-between
        px-5 pb-3 pt-5
        ${
          sidebarCollapsed
            ? "lg:justify-center lg:px-3"
            : ""
        }
      `}
    >
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
        <Users className="h-3.5 w-3.5 shrink-0" />

        <span
          className={
            sidebarCollapsed
              ? "lg:hidden"
              : ""
          }
        >
          My Students
        </span>
      </div>

      <span
        className={`
          text-[10px] text-white/25
          ${
            sidebarCollapsed
              ? "lg:hidden"
              : ""
          }
        `}
      >
        {students.length}
      </span>
    </div>

    {students.length === 0 ? (
      <div
        className={`
          px-5 py-8 text-center
          ${
            sidebarCollapsed
              ? "lg:hidden"
              : ""
          }
        `}
      >
        <Users className="mx-auto h-5 w-5 text-white/15" />

        <div className="mt-3 text-xs text-white/30">
          No students assigned yet.
        </div>
      </div>
    ) : (
      <div
        className={`
          space-y-1 pb-4
          ${
            sidebarCollapsed
              ? "px-2"
              : "px-2.5"
          }
        `}
      >
        {students.map((student) => {
          const isSelected =
            student.id === selectedStudentId;

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
              onClick={(event) => {
                event.stopPropagation();

                setSelectedStudentId(
                  student.id
                );

                // Close drawer after selecting
                // a student on mobile.
                setMobileSidebarOpen(false);
              }}
              className={`
                w-full rounded-xl
                text-left transition
                ${
                  sidebarCollapsed
                    ? "lg:px-0 lg:py-3"
                    : "px-3.5 py-3"
                }
                ${
                  isSelected
                    ? "bg-white/[0.07]"
                    : "hover:bg-white/[0.035]"
                }
              `}
            >
              {/* Collapsed desktop version */}
              <div
                className={`
                  hidden
                  ${
                    sidebarCollapsed
                      ? "lg:flex"
                      : ""
                  }
                  items-center justify-center
                `}
              >
                <div
                  className={`
                    h-2.5 w-2.5 rounded-full
                    ${
                      progress === 100 &&
                      student.weeklyTasks > 0
                        ? "bg-emerald-400"
                        : isSelected
                          ? "bg-white/70"
                          : "bg-white/20"
                    }
                  `}
                />
              </div>

              {/* Expanded version */}
              <div
                className={`
                  ${
                    sidebarCollapsed
                      ? "lg:hidden"
                      : ""
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      mt-1.5 h-2 w-2 shrink-0 rounded-full
                      ${
                        progress === 100 &&
                        student.weeklyTasks > 0
                          ? "bg-emerald-400"
                          : isSelected
                            ? "bg-white/70"
                            : "bg-white/20"
                      }
                    `}
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
                        {student.completedTasks} /{" "}
                        {student.weeklyTasks} tasks
                      </span>

                      <span className="text-[10px] text-white/25">
                        {Math.round(progress)}%
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
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>

  {/* Bottom student count */}
  <div
    className={`
      shrink-0 border-t border-white/[0.07] p-5
      ${
        sidebarCollapsed
          ? "lg:hidden"
          : ""
      }
    `}
  >
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

{mobileSidebarOpen && (
  <button
    type="button"
    aria-label="Close sidebar"
    onClick={() =>
      setMobileSidebarOpen(false)
    }
    className="absolute inset-0 z-30 bg-black/60 backdrop-blur-[2px] lg:hidden"
  />
)}

        <main className="min-w-0 flex-1">
          <header className="flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-7 sm:py-4">
  <div className="flex min-w-0 items-center gap-3">
    <button
      type="button"
      onClick={() =>
        setMobileSidebarOpen(true)
      }
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
      aria-label="Open student sidebar"
    >
      <Menu className="h-4 w-4" />
    </button>

    <div className="min-w-0">
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
            </div>

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

          {selectedStudentId &&
            loadingStudent && (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-white/35">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading student planner...
                </div>
              </div>
            )}

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

          {selectedStudentId &&
            !loadingStudent &&
            !studentError &&
            selectedStudent && (
              <div className="space-y-5 p-4 sm:p-6">
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

                <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
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
                      onClick={openAddObjective}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Objective
                    </button>
                  </div>

                  {objectives.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <div className="text-sm text-white/30">
                        No objectives yet.
                      </div>

                      <button
                        type="button"
                        onClick={openAddObjective}
                        className="mt-3 text-xs text-white/45 transition hover:text-white"
                      >
                        Add the first objective
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
                      {objectives.map(
                        (objective) => (
                          <div
                            key={
                              objective.id
                            }
                            className="group relative flex items-start gap-3 bg-[#15181d] px-5 py-4"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleObjective(
                                  objective
                                )
                              }
                              className="shrink-0"
                              title={
                                objective.completed
                                  ? "Mark incomplete"
                                  : "Mark complete"
                              }
                            >
                              {objective.completed ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 text-white/25 transition hover:text-white/60" />
                              )}
                            </button>

                            <span
                              className={`min-w-0 flex-1 pr-6 text-sm leading-5 ${
                                objective.completed
                                  ? "text-white/35 line-through"
                                  : "text-white/70"
                              }`}
                            >
                              {objective.text}
                            </span>

                            <div className="absolute right-3 top-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenObjectiveMenu(
                                    (current) =>
                                      current ===
                                      objective.id
                                        ? null
                                        : objective.id
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {openObjectiveMenu ===
                                objective.id && (
                                <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-white/[0.09] bg-[#1a1d22] p-1 shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditObjective(
                                        objective
                                      )
                                    }
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteObjective(
                                        objective
                                      )
                                    }
                                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-rose-300/70 transition hover:bg-rose-500/10 hover:text-rose-300"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4">
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

                    <div className="flex items-center gap-2">
                      {/* Dynamic weekly subject legend */}

                      {weekSubjects.length > 0 && (
                        <div className="hidden items-center gap-4 text-[11px] text-white/35 sm:flex">
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

                      <button
                        type="button"
                        onClick={() =>
                          openAddTask()
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Task
                      </button>
                    </div>
                  </div>

                  {actionError && (
                    <div className="border-b border-rose-500/10 bg-rose-500/[0.06] px-5 py-3">
                      <div className="flex items-center gap-2 text-xs text-rose-300">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {actionError}
                      </div>
                    </div>
                  )}

{/* Mobile weekly schedule */}
<div className="lg:hidden">
  <div className="divide-y divide-white/[0.06]">
    {days.map((day) => (
      <div
        key={day.isoDate}
        className="bg-[#121519]"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                day.isoDate ===
                formatDate(today)
                  ? "bg-white text-black"
                  : "bg-white/[0.05] text-white/65"
              }`}
            >
              {day.date}
            </div>

            <div>
              <div className="text-xs font-semibold text-white/70">
                {day.name}
              </div>

              <div className="mt-0.5 text-[10px] uppercase tracking-widest text-white/25">
                {day.short}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-white/25">
            {day.tasks.length === 0
              ? "Rest day"
              : `${day.tasks.length} ${
                  day.tasks.length === 1
                    ? "task"
                    : "tasks"
                }`}
          </div>
        </div>

        <div className="px-3 pb-3">
          {day.tasks.length > 0 ? (
            <div className="space-y-2">
              {day.tasks.map((task) => {
                const subject =
                  getSubjectOption(
                    task.subject
                  );

                const colors =
                  subject?.color ??
                  DEFAULT_SUBJECT_COLOR;

                return (
                  <div
                    key={task.id}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className={`group relative rounded-xl border p-3 ${colors.card}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          toggleTask(task)
                        }
                        className="mt-0.5 shrink-0"
                        title={
                          task.completed
                            ? "Mark incomplete"
                            : "Mark complete"
                        }
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-white/20 transition hover:text-white/60" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 pr-7">
                        <div
                          className={`text-[10px] font-medium uppercase tracking-wide ${colors.text}`}
                        >
                          {subject?.label ??
                            task.subject ??
                            task.type ??
                            "Task"}
                        </div>

                        <div
                          className={`mt-1 text-sm font-medium leading-5 ${
                            task.completed
                              ? "text-white/30 line-through"
                              : "text-white/75"
                          }`}
                        >
                          {task.name}
                        </div>

                        {task.type &&
                          task.subject && (
                            <div className="mt-1 text-[10px] text-white/25">
                              {TASK_TYPE_OPTIONS.find(
                                (option) =>
                                  option.value ===
                                  task.type?.toLowerCase()
                              )?.label ??
                                task.type}
                            </div>
                          )}
                      </div>

                      <div className="absolute right-2 top-2">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenTaskMenu(
                              (current) =>
                                current ===
                                task.id
                                  ? null
                                  : task.id
                            )
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md text-white/30 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {openTaskMenu ===
                          task.id && (
                          <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-white/[0.09] bg-[#1a1d22] p-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() =>
                                openEditTask(
                                  task
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteTask(
                                  task
                                )
                              }
                              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-rose-300/70 transition hover:bg-rose-500/10 hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-dashed border-white/[0.06] px-3 py-3">
              <div>
                <div className="text-xs font-medium text-white/25">
                  Rest day
                </div>

                <div className="mt-0.5 text-[10px] text-white/15">
                  No tasks scheduled
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  openAddTask(
                    day.isoDate
                  )
                }
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] text-white/30 transition hover:bg-white/[0.05] hover:text-white/70"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

{/* Desktop weekly schedule */}
<div className="hidden overflow-x-auto lg:block">
  <div className="grid min-w-[900px] grid-cols-7 divide-x divide-white/[0.06]">
    {days.map((day) => (
      <div
        key={day.isoDate}
        className="min-h-[420px] bg-[#121519]"
      >
        <div className="border-b border-white/[0.06] px-3 py-4 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {day.short}
          </div>

          <div
            className={`mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              day.isoDate ===
              formatDate(today)
                ? "bg-white text-black"
                : "text-white/65"
            }`}
          >
            {day.date}
          </div>
        </div>

        <div className="space-y-2 p-2.5">
          {day.tasks.length > 0 ? (
            day.tasks.map((task) => {
              const subject =
                getSubjectOption(
                  task.subject
                );

              const colors =
                subject?.color ??
                DEFAULT_SUBJECT_COLOR;

              return (
                <div
                  key={task.id}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className={`group relative rounded-xl border p-3 transition hover:bg-white/[0.04] ${colors.card}`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleTask(task)
                      }
                      className="mt-0.5 shrink-0"
                      title={
                        task.completed
                          ? "Mark incomplete"
                          : "Mark complete"
                      }
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-white/20 transition hover:text-white/60" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 pr-5">
                      <div
                        className={`text-[10px] font-medium uppercase tracking-wide ${colors.text}`}
                      >
                        {subject?.label ??
                          task.subject ??
                          task.type ??
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

                      {task.type &&
                        task.subject && (
                          <div className="mt-1 text-[10px] text-white/25">
                            {TASK_TYPE_OPTIONS.find(
                              (option) =>
                                option.value ===
                                task.type?.toLowerCase()
                            )?.label ??
                              task.type}
                          </div>
                        )}
                    </div>

                    <div className="absolute right-2 top-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenTaskMenu(
                            (current) =>
                              current ===
                              task.id
                                ? null
                                : task.id
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md text-white/20 opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {openTaskMenu ===
                        task.id && (
                        <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-white/[0.09] bg-[#1a1d22] p-1 shadow-xl">
                          <button
                            type="button"
                            onClick={() =>
                              openEditTask(
                                task
                              )
                            }
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteTask(
                                task
                              )
                            }
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-rose-300/70 transition hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-medium text-white/30">
                  Rest day
                </div>

                <div className="mt-1 text-[10px] text-white/15">
                  No tasks scheduled
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openAddTask(
                      day.isoDate
                    )
                  }
                  className="mt-3 flex items-center gap-1 text-[10px] text-white/25 transition hover:text-white/60"
                >
                  <Plus className="h-3 w-3" />
                  Add task
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

                  <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
                    <div className="text-[11px] text-white/30">
                      {completedTasks} of{" "}
                      {totalTasks} tasks complete
                    </div>

                    <div className="text-[11px] text-white/25">
                      Mentor view
                    </div>
                  </div>
                </section>
              </div>
            )}
        </main>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!saving) {
              setModal(null);
              setActionError(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#15181d] shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  {modal === "objective"
                    ? editingObjective
                      ? "Edit Objective"
                      : "Add Objective"
                    : editingTask
                      ? "Edit Task"
                      : "Add Task"}
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  {selectedStudent?.display_name ||
                    selectedStudent?.username ||
                    "Student"}
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setModal(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modal === "objective" && (
              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-white/30">
                    Objective
                  </label>

                  <textarea
                    autoFocus
                    value={objectiveText}
                    onChange={(event) =>
                      setObjectiveText(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Complete upper limb anatomy revision"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.04]"
                  />
                </div>

                {actionError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/15 bg-rose-500/[0.06] px-3 py-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {actionError}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setModal(null)
                    }
                    className="rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-medium text-white/45 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveObjective}
                    className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}

                    {editingObjective
                      ? "Save Changes"
                      : "Add Objective"}
                  </button>
                </div>
              </div>
            )}

            {modal === "task" && (
              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-white/30">
                    Task
                  </label>

                  <input
                    autoFocus
                    value={taskForm.name}
                    onChange={(event) =>
                      setTaskForm(
                        (current) => ({
                          ...current,
                          name: event.target
                            .value,
                        })
                      )
                    }
                    placeholder="e.g. Review brachial plexus"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.04]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Subject
                    </label>

                    <select
                      value={taskForm.subject}
                      onChange={(event) =>
                        setTaskForm(
                          (current) => ({
                            ...current,
                            subject:
                              event.target
                                .value,
                          })
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#191c21] px-3 py-2.5 text-xs text-white outline-none transition focus:border-white/20"
                    >
                      <option
                        value=""
                        className="bg-[#191c21] text-white/40"
                      >
                        Select subject
                      </option>

                      {SUBJECT_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                            className="bg-[#191c21] text-white"
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-white/30">
                      Type
                    </label>

                    <select
                      value={taskForm.type}
                      onChange={(event) =>
                        setTaskForm(
                          (current) => ({
                            ...current,
                            type: event.target
                              .value,
                          })
                        )
                      }
                      className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#191c21] px-3 py-2.5 text-xs text-white outline-none transition focus:border-white/20"
                    >
                      <option
                        value=""
                        className="bg-[#191c21] text-white/40"
                      >
                        Select type
                      </option>

                      {TASK_TYPE_OPTIONS.map(
                        (option) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                            className="bg-[#191c21] text-white"
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-white/30">
                    Date
                  </label>

                  <input
                    type="date"
                    value={taskForm.date}
                    onChange={(event) =>
                      setTaskForm(
                        (current) => ({
                          ...current,
                          date: event.target
                            .value,
                        })
                      )
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs text-white outline-none transition focus:border-white/20"
                  />
                </div>

                {actionError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-500/15 bg-rose-500/[0.06] px-3 py-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {actionError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      setModal(null)
                    }
                    className="rounded-lg border border-white/[0.08] px-3.5 py-2 text-xs font-medium text-white/45 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={saveTask}
                    className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}

                    {editingTask
                      ? "Save Changes"
                      : "Add Task"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

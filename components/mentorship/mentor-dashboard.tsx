"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Menu,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardObjectives } from "@/components/dashboard/DashboardObjectives";
import { MentorSidebar } from "@/components/dashboard/MentorSidebar";

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

type Task = {
  id: string;
  name: string;
  subject_id: string;
  task_type_id: string;
  student_id: string;
  completed: boolean;
  date: string;
  created_at: string;

  subject: {
    id: string;
    name: string;
    display_name: string;
    color: string;
  } | null;

  task_type: {
    id: string;
    name: string;
    points: number;
  } | null;
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
  subject_id: string;
  task_type_id: string;
  date: string;
};

const INITIAL_RENDER_DATE = new Date(2026, 0, 5);

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

  const [students, setStudents] =
    useState<StudentSummary[]>([]);

  const [selectedStudentId, setSelectedStudentId] =
    useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] =
    useState<Profile | null>(null);

  const [objectives, setObjectives] =
    useState<Objective[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  /*
   * ================================================================
   * SUBJECTS + TASK TYPES
   * ================================================================
   *
   * These now come from the database rather than task-options.ts.
   */

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [taskTypes, setTaskTypes] =
    useState<TaskType[]>([]);

  const [weekStart, setWeekStart] = useState(() =>
    getSunday(INITIAL_RENDER_DATE)
  );

  useEffect(() => {
    setWeekStart(getSunday(new Date()));
  }, []);

  const [loading, setLoading] =
    useState(true);

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

  const [taskForm, setTaskForm] =
    useState<TaskForm>({
      name: "",
      subject_id: "",
      task_type_id: "",
      date: formatDate(INITIAL_RENDER_DATE),
    });

  const [saving, setSaving] =
    useState(false);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [openTaskMenu, setOpenTaskMenu] =
    useState<string | null>(null);

  const [openObjectiveMenu, setOpenObjectiveMenu] =
    useState<string | null>(null);

  /*
   * ================================================================
   * WEEK DAYS
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
   * WEEK SUBJECTS
   * ================================================================
   *
   * Only subjects actually used by the selected student's
   * tasks this week are shown in the calendar legend.
   *
   * Subject metadata now comes directly from the database.
   */

const weekSubjects = useMemo(() => {
  const seen = new Set<string>();

  return tasks.reduce<
    Array<{
      value: string;
      label: string;
      color: string;
    }>
  >((result, task) => {
    if (!task.subject) {
      return result;
    }

    if (seen.has(task.subject.id)) {
      return result;
    }

    seen.add(task.subject.id);

    result.push({
      value: task.subject.id,
      label: task.subject.display_name,
      color: task.subject.color,
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

        /*
         * ================================================================
         * LOAD MENTOR PROFILE
         * ================================================================
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

        const [
  { data: subjectData, error: subjectError },
  { data: taskTypeData, error: taskTypeError },
] = await Promise.all([
  supabase
    .from("subjects")
    .select(
      "id, name, display_name, category, color, active, display_order"
    )
    .eq("active", true)
    .order("display_order"),

  supabase
    .from("task_types")
    .select(
      "id, name, points, active, display_order"
    )
    .eq("active", true)
    .order("display_order"),
]);

if (subjectError) {
  throw new Error(
    `Subjects query failed: ${subjectError.message}`
  );
}

if (taskTypeError) {
  throw new Error(
    `Task types query failed: ${taskTypeError.message}`
  );
}

if (cancelled) return;

setSubjects(
  Array.isArray(subjectData)
    ? subjectData
    : []
);

setTaskTypes(
  Array.isArray(taskTypeData)
    ? taskTypeData
    : []
);

        /*
         * ================================================================
         * LOAD ASSIGNED STUDENTS
         * ================================================================
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

        const assignedStudents = Array.isArray(studentData)
          ? studentData.filter(
              (student) =>
                typeof student.id === "string" &&
                student.id.trim() !== "" &&
                student.id !== "null" &&
                student.id !== "undefined"
            )
          : [];

        /*
         * ================================================================
         * BUILD STUDENT SUMMARIES
         * ================================================================
         */

        let summaries: StudentSummary[] =
          assignedStudents.map((student) => ({
            ...student,
            weeklyTasks: 0,
            completedTasks: 0,
          }));

        /*
         * ================================================================
         * LOAD WEEKLY TASK COUNTS
         * ================================================================
         *
         * IMPORTANT:
         * This query is ONLY for calculating the summary cards.
         *
         * Do NOT use selectedStudentId here.
         * selectedStudentId can be null when this effect first runs.
         *
         * We query all assigned students using their actual UUIDs.
         */

        if (assignedStudents.length > 0) {
          const studentIds = assignedStudents.map(
            (student) => student.id
          );

          const {
            data: weeklyTaskData,
            error: weeklyTaskError,
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

          if (weeklyTaskError) {
            throw new Error(
              `Student task summary failed: ${weeklyTaskError.message}`
            );
          }

          if (cancelled) return;

          const weeklyTasks = Array.isArray(
            weeklyTaskData
          )
            ? weeklyTaskData
            : [];

          summaries = assignedStudents.map(
            (student) => {
              const studentTasks =
                weeklyTasks.filter(
                  (task) =>
                    task.student_id === student.id
                );

              return {
                ...student,
                weeklyTasks:
                  studentTasks.length,
                completedTasks:
                  studentTasks.filter(
                    (task) => task.completed
                  ).length,
              };
            }
          );
        }

        if (cancelled) return;

        setStudents(summaries);

        /*
         * Keep the currently selected student if they are still assigned.
         * Otherwise select the first assigned student.
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
        .eq("student_id", selectedStudentId)
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
        .select(`
          id,
          name,
          subject_id,
          task_type_id,
          student_id,
          completed,
          date,
          created_at,
          subject:subjects!tasks_subject_id_fkey (
            id,
            name,
            display_name,
            color
          ),
          task_type:task_types!tasks_task_type_id_fkey (
            id,
            name,
            points
          )
        `)
        .eq("student_id", selectedStudentId)
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

      setSelectedStudent(studentData);

      setObjectives(
        Array.isArray(objectiveData)
          ? objectiveData
          : []
      );

      setTasks(
        Array.isArray(taskData)
          ? taskData as Task[]
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

  function openAddTask(date?: string) {
  setActionError(null);
  setEditingTask(null);

  setTaskForm({
    name: "",
    subject_id: "",
    task_type_id: "",
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
    subject_id: task.subject_id || "",
    task_type_id: task.task_type_id || "",
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

  if (!taskForm.subject_id) {
    setActionError(
      "Please select a subject."
    );
    return;
  }

  if (!taskForm.task_type_id) {
    setActionError(
      "Please select a task type."
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
    const selectWithRelations = `
      id,
      name,
      subject_id,
      task_type_id,
      student_id,
      completed,
      date,
      created_at,
      subject:subjects!tasks_subject_id_fkey (
        id,
        name,
        display_name,
        color
      ),
      task_type:task_types!tasks_task_type_id_fkey (
        id,
        name,
        points
      )
    `;

    if (editingTask) {
      const {
        data,
        error,
      } = await supabase
        .from("tasks")
        .update({
          name,
          subject_id: taskForm.subject_id,
          task_type_id: taskForm.task_type_id,
          date: taskForm.date,
        })
        .eq("id", editingTask.id)
        .eq("student_id", selectedStudentId)
        .select(selectWithRelations)
        .single();

      if (error) {
        throw error;
      }

      const updatedTask = data as Task;

      if (
        updatedTask.date >= formatDate(weekStart) &&
        updatedTask.date <= formatDate(weekEnd)
      ) {
        setTasks((current) =>
          current
            .map((task) =>
              task.id === updatedTask.id
                ? updatedTask
                : task
            )
            .sort((a, b) => {
              const dateCompare =
                a.date.localeCompare(b.date);

              if (dateCompare !== 0) {
                return dateCompare;
              }

              return (
                a.created_at || ""
              ).localeCompare(
                b.created_at || ""
              );
            })
        );
      } else {
        setTasks((current) =>
          current.filter(
            (task) =>
              task.id !== updatedTask.id
          )
        );
      }

      await refreshStudentSummary();
    } else {
      const {
        data,
        error,
      } = await supabase
        .from("tasks")
        .insert({
          student_id: selectedStudentId,
          name,
          subject_id: taskForm.subject_id,
          task_type_id: taskForm.task_type_id,
          date: taskForm.date,
          completed: false,
        })
        .select(selectWithRelations)
        .single();

      if (error) {
        throw error;
      }

      const newTask = data as Task;

      if (
        newTask.date >= formatDate(weekStart) &&
        newTask.date <= formatDate(weekEnd)
      ) {
        setTasks((current) =>
          [...current, newTask].sort(
            (a, b) => {
              const dateCompare =
                a.date.localeCompare(b.date);

              if (dateCompare !== 0) {
                return dateCompare;
              }

              return (
                a.created_at || ""
              ).localeCompare(
                b.created_at || ""
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
    setWeekStart(getSunday(new Date()));
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

        <MentorSidebar
          mentorProfile={mentorProfile}
          students={students}
          selectedStudentId={selectedStudentId}
          sidebarCollapsed={sidebarCollapsed}
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
          onMobileSidebarOpenChange={setMobileSidebarOpen}
          onSelectStudent={setSelectedStudentId}
          onLogout={handleLogout}
        />

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

                <DashboardObjectives
                  objectives={objectives}
                  completedCount={completedObjectives}
                  subtitle={`${completedObjectives} of ${objectiveCount} complete`}
                  onToggle={toggleObjective}
                  onAdd={openAddObjective}
                  onEdit={openEditObjective}
                  onDelete={deleteObjective}
                  openMenuId={openObjectiveMenu}
                  onToggleMenu={(id) =>
                    setOpenObjectiveMenu((current) =>
                      current === id ? null : id
                    )
                  }
                />

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

                  <DashboardCalendar
                    days={days}
                    today={new Date()}
                    onToggleTask={toggleTask}
                    breakpoint="lg"
                    onAddTask={openAddTask}
                    renderTaskActions={(task) => (
                      <div className="absolute right-2 top-2">
                        <button type="button" onClick={() => setOpenTaskMenu((current) => current === task.id ? null : task.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-white/20 opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openTaskMenu === task.id && (
                          <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-white/[0.09] bg-[#1a1d22] p-1 shadow-xl">
                            <button type="button" onClick={() => openEditTask(task)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"><Pencil className="h-3.5 w-3.5" />Edit</button>
                            <button type="button" onClick={() => deleteTask(task)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-rose-300/70 transition hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                          </div>
                        )}
                      </div>
                    )}
                  />

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
                      value={taskForm.subject_id}
                      onChange={(event) =>
                        setTaskForm(
                          (current) => ({
                            ...current,
                            subject_id:
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

                      {subjects
                        .filter((subject) => subject.active)
                        .map((subject) => (
                          <option
                            key={subject.id}
                            value={subject.id}
                            className="bg-[#191c21] text-white"
                          >
                            {subject.display_name}
                          </option>
                        ))}
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

                      {taskTypes
                        .filter((taskType) => taskType.active)
                        .map((taskType) => (
                          <option
                            key={taskType.id}
                            value={taskType.id}
                            className="bg-[#191c21] text-white"
                          >
                            {taskType.name}
                          </option>
                        ))}
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

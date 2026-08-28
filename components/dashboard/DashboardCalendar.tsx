"use client";

import type { ReactNode } from "react";
import {
  DashboardTaskCard,
  type DashboardTask,
} from "./DashboardTaskCard";

/*
 * ================================================================
 * TYPES
 * ================================================================
 */

export type DashboardSubject = {
  id: string;
  name: string;
  display_name: string;
  category: string;
  color: string;
  active: boolean;
  display_order: number;
};

export type DashboardTaskType = {
  id: string;
  name: string;
  points: number;
  active: boolean;
  display_order: number;
};

export type DashboardCalendarDay = {
  name: string;
  short: string;
  date: string;
  isoDate: string;
  tasks: DashboardTask[];
};

type DashboardCalendarProps = {
  days: DashboardCalendarDay[];
  today: Date | null;

  /*
   * Normal task completion handler.
   *
   * MCQ tasks are handled by DashboardTaskCard through
   * the onUpdateMcqProgress callback.
   */
  onToggleTask: (task: DashboardTask) => void;

  /*
   * Called after the student enters a new MCQ progress value.
   *
   * The actual Supabase update lives in the student dashboard.
   */
  onUpdateMcqProgress?: (
    task: DashboardTask,
    questionsSolved: number
  ) => Promise<void>;

  breakpoint?: "md" | "lg";

  renderTaskActions?: (
    task: DashboardTask
  ) => ReactNode;

  onAddTask?: (
    date: string
  ) => void;

  /*
   * Subject/type metadata.
   *
   * Student tasks contain subject_id/task_type_id.
   */
  subjects?: DashboardSubject[];

  taskTypes?: DashboardTaskType[];
};

/*
 * ================================================================
 * COMPONENT
 * ================================================================
 */

export function DashboardCalendar({
  days,
  today,
  onToggleTask,
  onUpdateMcqProgress,
  breakpoint = "md",
  renderTaskActions,
  onAddTask,
  subjects = [],
  taskTypes = [],
}: DashboardCalendarProps) {
  const mobileClass =
    breakpoint === "lg"
      ? "lg:hidden"
      : "md:hidden";

  const desktopClass =
    breakpoint === "lg"
      ? "hidden overflow-x-auto lg:block"
      : "hidden overflow-x-auto md:block";

  /*
   * ================================================================
   * RESOLVE TASK METADATA
   * ================================================================
   *
   * The student dashboard stores:
   *
   *   subject_id
   *   task_type_id
   *
   * while DashboardTaskCard can work with either:
   *
   *   subject / type
   *
   * or the richer database relationship objects.
   *
   * We resolve the metadata here without changing the original
   * task object more than necessary.
   */

  function getDisplayTask(
    task: DashboardTask
  ): DashboardTask {
    const taskWithIds =
      task as DashboardTask & {
        subject_id?: string | null;
        task_type_id?: string | null;
      };

    const subject =
      taskWithIds.subject_id
        ? subjects.find(
            (item) =>
              item.id ===
              taskWithIds.subject_id
          )
        : null;

    const taskType =
      taskWithIds.task_type_id
        ? taskTypes.find(
            (item) =>
              item.id ===
              taskWithIds.task_type_id
          )
        : null;

    /*
     * Preserve ALL existing task fields.
     *
     * This is important now because MCQ tasks contain:
     *
     *   question_count
     *   questions_solved
     *   completion_threshold
     *
     * We don't want normalization to accidentally throw
     * any of that information away.
     */

    return {
      ...task,

      subject:
        subject?.id ??
        task.subject ??
        null,

      type:
        taskType?.name ??
        task.type ??
        null,

      subject_id:
        taskWithIds.subject_id ??
        task.subject_id ??
        null,

      task_type_id:
        taskWithIds.task_type_id ??
        task.task_type_id ??
        null,
    };
  }

  /*
   * ================================================================
   * RENDER TASK
   * ================================================================
   *
   * Keeping this in one function prevents the desktop and mobile
   * versions from slowly drifting apart.
   */

  function renderTask(
    task: DashboardTask,
    mobile = false
  ) {
    const displayTask =
      getDisplayTask(task);

    return (
      <DashboardTaskCard
        key={task.id}
        task={displayTask}
        onToggle={onToggleTask}
        onUpdateMcqProgress={
          onUpdateMcqProgress
        }
        mobile={mobile}
      >
        {renderTaskActions?.(task)}
      </DashboardTaskCard>
    );
  }

  return (
    <>
      {/* ============================================================
          DESKTOP CALENDAR
      ============================================================ */}

      <div className={desktopClass}>
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
                    today &&
                    day.isoDate ===
                      formatDate(today)
                      ? "bg-white text-black"
                      : "text-white/65"
                  }`}
                >
                  {day.date}
                </div>
              </div>

              {/* Tasks */}

              <div className="space-y-2 p-2.5">
                {day.tasks.length ? (
                  day.tasks.map((task) =>
                    renderTask(task)
                  )
                ) : (
                  <RestDay
                    onAdd={
                      onAddTask
                        ? () =>
                            onAddTask(
                              day.isoDate
                            )
                        : undefined
                    }
                    desktop
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================
          MOBILE CALENDAR
      ============================================================ */}

      <div
        className={`${mobileClass} divide-y divide-white/[0.06]`}
      >
        {days.map((day) => {
          const isToday =
            !!today &&
            day.isoDate ===
              formatDate(today);

          return (
            <div
              key={day.isoDate}
              className="bg-[#121519]"
            >
              {/* Day header */}

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
                  {day.tasks.length === 1
                    ? "task"
                    : "tasks"}
                </div>
              </div>

              {/* Tasks */}

              <div className="space-y-2 px-3 pb-3">
                {day.tasks.length ? (
                  day.tasks.map((task) =>
                    renderTask(
                      task,
                      true
                    )
                  )
                ) : (
                  <RestDay
                    onAdd={
                      onAddTask
                        ? () =>
                            onAddTask(
                              day.isoDate
                            )
                        : undefined
                    }
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ================================================================
   DATE HELPER
================================================================ */

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

/* ================================================================
   REST DAY
================================================================ */

function RestDay({
  desktop,
  onAdd,
}: {
  desktop?: boolean;
  onAdd?: () => void;
}) {
  return (
    <div
      className={
        desktop
          ? "flex min-h-[260px] flex-col items-center justify-center"
          : "rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-5 text-center"
      }
    >
      <div className="text-xs font-medium text-white/25">
        Rest day
      </div>

      <div className="mt-1 text-[10px] text-white/15">
        No tasks scheduled
      </div>

      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 text-[10px] text-white/25 transition hover:text-white/60"
        >
          Add task
        </button>
      )}
    </div>
  );
}
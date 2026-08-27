"use client";

import { CheckCircle2, Circle } from "lucide-react";
import {
  DEFAULT_SUBJECT_COLOR,
  getSubjectOption,
} from "@/lib/task-options";

export type DashboardTaskSubject = {
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

export type DashboardTask = {
  id: string;
  name: string;

  // New database schema
  subject_id: string | null;
  task_type_id: string | null;

  // Embedded Supabase relationships
  subject?: DashboardTaskSubject | null;
  task_type?: DashboardTaskType | null;

  completed: boolean;
};

export function DashboardTaskCard({
  task,
  onToggle,
  mobile = false,
  children,
}: {
  task: DashboardTask;
  onToggle: (task: DashboardTask) => void;
  mobile?: boolean;
  children?: React.ReactNode;
}) {
  /*
   * The database now stores subject_id rather than a subject
   * text column.
   *
   * When the task is loaded through the relationship query,
   * task.subject contains the full subject object.
   *
   * A newly-created task can temporarily have no embedded
   * relationship object, so we handle that safely instead
   * of passing an object into getSubjectOption().
   */

  const subject = task.subject
    ? {
        value: task.subject.id,
        label:
          task.subject.display_name ||
          task.subject.name,
        color: task.subject.color,
      }
    : task.subject_id
      ? getSubjectOption(task.subject_id)
      : null;

  const colors =
    subject?.color ?? DEFAULT_SUBJECT_COLOR;

  const subjectLabel =
    subject?.label ??
    task.subject?.display_name ??
    task.subject?.name ??
    "Task";

  const taskTypeLabel =
    task.task_type?.name ?? null;

  return (
    <div
      className={`group relative rounded-xl border ${
        mobile
          ? "p-3.5"
          : "p-3 transition hover:bg-white/[0.04]"
      } ${colors.card}`}
    >
      <div
        className={`flex items-start ${
          mobile ? "gap-3" : "gap-2.5"
        }`}
      >
        <button
          type="button"
          onClick={() => onToggle(task)}
          className={`${
            mobile ? "mt-0.5" : "mt-1.5"
          } shrink-0`}
          title={
            task.completed
              ? "Mark incomplete"
              : "Mark complete"
          }
          aria-label={`${
            task.completed
              ? "Mark incomplete"
              : "Mark complete"
          }: ${task.name}`}
        >
          {task.completed ? (
            <CheckCircle2
              className={`${
                mobile
                  ? "h-5 w-5"
                  : "h-4 w-4"
              } text-emerald-400`}
            />
          ) : (
            <Circle
              className={`${
                mobile
                  ? "h-5 w-5"
                  : "h-4 w-4"
              } text-white/20 transition hover:text-white/60`}
            />
          )}
        </button>

        <div
          className={`min-w-0 flex-1 ${
            children ? "pr-7" : ""
          }`}
        >
          <div
            className={`text-[10px] font-medium uppercase tracking-wide ${colors.text}`}
          >
            {subjectLabel}
          </div>

          <div
            className={`mt-1 ${
              mobile
                ? "text-sm leading-5"
                : "text-xs leading-4"
            } font-medium ${
              task.completed
                ? "text-white/30 line-through"
                : "text-white/75"
            }`}
          >
            {task.name}
          </div>

          {taskTypeLabel && (
            <div className="mt-1 text-[10px] text-white/25">
              {taskTypeLabel}
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
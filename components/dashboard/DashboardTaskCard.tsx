"use client";

import type { ReactNode } from "react";
import {
  CheckCircle2,
  Circle,
  Target,
  ClipboardCheck,
} from "lucide-react";

export type DashboardTask = {
  id: string;
  name: string;

  subject: string | null;
  type: string | null;

  subject_id?: string | null;
  task_type_id?: string | null;

  subject_name?: string | null;
  subject_display_name?: string | null;
  subject_color?: string | null;

  type_name?: string | null;

  completed: boolean;

  /*
   * MCQ fields
   */
  question_count?: number | null;
  questions_solved?: number | null;
  completion_threshold?: number | null;
};

type DashboardTaskCardProps = {
  task: DashboardTask;
  onToggle: (task: DashboardTask) => void;
  mobile?: boolean;
  children?: ReactNode;
};

/*
 * ================================================================
 * MCQ HELPERS
 * ================================================================
 */

function isMcqTask(task: DashboardTask) {
  const type = (
    task.type_name ??
    task.type ??
    ""
  ).toLowerCase();

  return (
    (task.question_count !== null &&
      task.question_count !== undefined) ||
    type === "solve mcq"
  );
}

function getProgress(task: DashboardTask) {
  if (
    task.question_count === null ||
    task.question_count === undefined ||
    task.question_count <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      ((task.questions_solved ?? 0) /
        task.question_count) *
        100
    )
  );
}

/*
 * ================================================================
 * TASK CARD
 * ================================================================
 */

export function DashboardTaskCard({
  task,
  onToggle,
  mobile = false,
  children,
}: DashboardTaskCardProps) {
  const mcq = isMcqTask(task);

  /*
   * Display values
   */

  const subjectName =
    task.subject_display_name ??
    task.subject_name ??
    task.subject ??
    null;

  const typeName =
    task.type_name ??
    task.type ??
    null;

  /*
   * Subject color comes directly from the task.
   */

  const subjectColor =
    task.subject_color || "#94a3b8";

  const progress = getProgress(task);

  /*
   * ================================================================
   * CARD COLORS
   * ================================================================
   */

  const cardBackground = task.completed
    ? "rgba(255, 255, 255, 0.015)"
    : `color-mix(in srgb, ${subjectColor} 10%, transparent)`;

  const cardBorder = task.completed
    ? "rgba(255, 255, 255, 0.05)"
    : `color-mix(in srgb, ${subjectColor} 20%, transparent)`;

  const hoverBackground = task.completed
    ? "rgba(255, 255, 255, 0.025)"
    : `color-mix(in srgb, ${subjectColor} 14%, transparent)`;

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(task)}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onToggle(task);
        }
      }}
      className={`group relative cursor-pointer select-none overflow-hidden rounded-xl border transition-all duration-200 ${
        mobile ? "p-3.5" : "p-3"
      }`}
      style={{
        backgroundColor: cardBackground,
        borderColor: cardBorder,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor =
          hoverBackground;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor =
          cardBackground;
      }}
      aria-label={
        mcq
          ? `Update MCQ progress for ${task.name}`
          : task.completed
            ? `Mark ${task.name} incomplete`
            : `Complete ${task.name}`
      }
    >
      {/* ==========================================================
          SUBJECT ACCENT
          ========================================================== */}

      <div
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{
          backgroundColor: task.completed
            ? "rgba(255,255,255,0.08)"
            : subjectColor,
        }}
      />

      {/* ==========================================================
          MAIN ROW
          ========================================================== */}

      <div className="flex min-w-0 items-start gap-2.5">
        {/* ========================================================
            LEFT INDICATOR
            ========================================================

            There is intentionally only ONE indicator column.

            Normal task:
              check / empty circle

            MCQ:
              subject dot

            This keeps the text aligned identically between task
            types and removes the excessive left-side spacing.
        */}

        <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
          {mcq ? (
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: task.completed
                  ? "rgba(255,255,255,0.15)"
                  : subjectColor,
              }}
            />
          ) : task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Circle className="h-4 w-4 text-white/20 transition-colors group-hover:text-white/40" />
          )}
        </div>

        {/* ========================================================
            CONTENT
            ======================================================== */}

        <div className="min-w-0 flex-1">
          {/* Metadata */}

          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pr-6">
            {subjectName && (
              <span
                className="text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  color: task.completed
                    ? "rgba(255,255,255,0.25)"
                    : subjectColor,
                }}
              >
                {subjectName}
              </span>
            )}

            {subjectName && typeName && (
              <span className="text-[9px] text-white/15">
                •
              </span>
            )}

            {typeName && (
              <span className="text-[9px] font-medium uppercase tracking-wide text-white/30">
                {typeName}
              </span>
            )}
          </div>

          {/* Task name */}

          <div
            className={`mt-1.5 min-w-0 text-xs font-medium leading-4 ${
              task.completed
                ? "text-white/30 line-through"
                : "text-white/75"
            }`}
          >
            {task.name}
          </div>

          {/* ======================================================
              MCQ PROGRESS
              ====================================================== */}

          {mcq && (
            <div className="mt-3">
              {/* Progress header */}

              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-white/35">
                  <Target className="h-3 w-3 shrink-0" />

                  <span className="truncate">
                    {task.questions_solved ?? 0} /{" "}
                    {task.question_count ?? "—"} questions
                  </span>
                </div>

                <span className="shrink-0 text-[10px] font-medium text-white/30">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Progress bar */}

              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: subjectColor,
                  }}
                />
              </div>

              {/* Requirement */}

              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-[9px] text-white/20">
                  Required:{" "}
                  {task.completion_threshold ?? 75}%
                </span>

                {task.completed ? (
                  <span className="flex shrink-0 items-center gap-1 text-[9px] font-medium text-emerald-400/70">
                    <ClipboardCheck className="h-3 w-3" />
                    Complete
                  </span>
                ) : (
                  <span className="shrink-0 text-[9px] text-white/20">
                    Click to update
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ======================================================
              NORMAL TASK ACTIONS
              ====================================================== */}

          {!mcq && children}
        </div>
      </div>

      {/* ==========================================================
          MENTOR ACTIONS
          ========================================================== */}

      {children && (
        <div
          className="absolute right-1.5 top-1.5 z-10"
          onClick={(event) => {
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
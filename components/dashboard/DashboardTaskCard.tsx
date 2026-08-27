"use client";

import type { ReactNode } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import {
  DEFAULT_SUBJECT_COLOR,
  getSubjectOption,
} from "@/lib/task-options";

/*
 * ================================================================
 * TYPES
 * ================================================================
 */

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

  /*
   * New database schema
   */
  subject_id: string | null;
  task_type_id: string | null;

  /*
   * Embedded Supabase relationships.
   *
   * These are populated when the dashboard query uses:
   *
   * subject:subjects!tasks_subject_id_fkey (...)
   * task_type:task_types!tasks_task_type_id_fkey (...)
   */
  subject?: DashboardTaskSubject | null;
  task_type?: DashboardTaskType | null;

  completed: boolean;
};

/*
 * ================================================================
 * COLOR HELPERS
 * ================================================================
 */

/**
 * Converts a hex color into rgba().
 *
 * The database stores subject.color as a normal color string,
 * while the old task-options system uses Tailwind class names.
 *
 * We use inline styles for database colors so the actual subject
 * color is rendered reliably.
 */
function hexToRgba(
  color: string,
  alpha: number
) {
  const value = color.trim();

  /*
   * #RGB
   */
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const r = parseInt(
      value[1] + value[1],
      16
    );

    const g = parseInt(
      value[2] + value[2],
      16
    );

    const b = parseInt(
      value[3] + value[3],
      16
    );

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /*
   * #RRGGBB
   */
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    const r = parseInt(
      value.slice(1, 3),
      16
    );

    const g = parseInt(
      value.slice(3, 5),
      16
    );

    const b = parseInt(
      value.slice(5, 7),
      16
    );

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /*
   * If the database contains something other than hex,
   * fall back to the raw CSS color.
   */
  return value;
}

/*
 * ================================================================
 * COMPONENT
 * ================================================================
 */

export function DashboardTaskCard({
  task,
  onToggle,
  mobile = false,
  children,
}: {
  task: DashboardTask;
  onToggle: (task: DashboardTask) => void;
  mobile?: boolean;
  children?: ReactNode;
}) {
  /*
   * ================================================================
   * SUBJECT
   * ================================================================
   *
   * Prefer the actual Supabase relationship.
   *
   * This is important because the database now owns:
   *
   *   subject.id
   *   subject.display_name
   *   subject.color
   *
   * If the relationship isn't available yet, fall back to the
   * static task-options configuration using subject_id.
   */

  const databaseSubject =
    task.subject ?? null;

  const fallbackSubject =
    !databaseSubject && task.subject_id
      ? getSubjectOption(task.subject_id)
      : null;

  /*
   * ================================================================
   * SUBJECT LABEL
   * ================================================================
   */

  const subjectLabel =
    databaseSubject?.display_name ||
    databaseSubject?.name ||
    fallbackSubject?.label ||
    "Task";

  /*
   * ================================================================
   * SUBJECT COLOR
   * ================================================================
   */

  const databaseColor =
    databaseSubject?.color?.trim() || null;

  /*
   * Database colors are actual CSS colors.
   *
   * Example:
   *
   *   "#38bdf8"
   *
   * We turn that into:
   *
   *   background: rgba(56, 189, 248, 0.10)
   *   border:     rgba(56, 189, 248, 0.20)
   *   text:       #38bdf8
   */

  const hasDatabaseColor =
    Boolean(databaseColor);

  const databaseCardStyle =
    hasDatabaseColor
      ? {
          backgroundColor:
            hexToRgba(
              databaseColor!,
              0.1
            ),
          borderColor:
            hexToRgba(
              databaseColor!,
              0.2
            ),
        }
      : undefined;

  const databaseTextStyle =
    hasDatabaseColor
      ? {
          color: databaseColor!,
        }
      : undefined;

  /*
   * Old/static fallback colors.
   *
   * getSubjectOption() returns the old structure:
   *
   * {
   *   color: {
   *     card,
   *     dot,
   *     text
   *   }
   * }
   */
  const fallbackColors =
    fallbackSubject?.color ??
    DEFAULT_SUBJECT_COLOR;

  /*
   * ================================================================
   * TASK TYPE
   * ================================================================
   */

  const taskTypeLabel =
    task.task_type?.name || null;

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  return (
    <div
      className={`group relative rounded-xl border ${
        mobile
          ? "p-3.5"
          : "p-3 transition hover:bg-white/[0.04]"
      } ${
        hasDatabaseColor
          ? ""
          : fallbackColors.card
      }`}
      style={databaseCardStyle}
    >
      <div
        className={`flex items-start ${
          mobile ? "gap-3" : "gap-2.5"
        }`}
      >
        {/* ======================================================
            COMPLETE BUTTON
        ====================================================== */}

        <button
          type="button"
          onClick={() => onToggle(task)}
          className={`${
            mobile
              ? "mt-0.5"
              : "mt-1.5"
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

        {/* ======================================================
            TASK CONTENT
        ====================================================== */}

        <div
          className={`min-w-0 flex-1 ${
            children ? "pr-7" : ""
          }`}
        >
          {/* SUBJECT */}

          <div
            className={`text-[10px] font-medium uppercase tracking-wide ${
              hasDatabaseColor
                ? ""
                : fallbackColors.text
            }`}
            style={databaseTextStyle}
          >
            {subjectLabel}
          </div>

          {/* TASK NAME */}

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

          {/* TASK TYPE */}

          {taskTypeLabel && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/30">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={
                  hasDatabaseColor
                    ? {
                        backgroundColor:
                          databaseColor!,
                      }
                    : undefined
                }
              />

              <span>
                {taskTypeLabel}
              </span>
            </div>
          )}
        </div>

        {/* ======================================================
            ACTIONS
        ====================================================== */}

        {children}
      </div>
    </div>
  );
}
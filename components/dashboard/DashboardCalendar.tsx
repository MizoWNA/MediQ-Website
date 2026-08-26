"use client";

import type { ReactNode } from "react";
import { DashboardTaskCard, type DashboardTask } from "./DashboardTaskCard";

export type DashboardCalendarDay = { name: string; short: string; date: string; isoDate: string; tasks: DashboardTask[] };

export function DashboardCalendar({ days, today, onToggleTask, breakpoint = "md", renderTaskActions, onAddTask }: { days: DashboardCalendarDay[]; today: Date | null; onToggleTask: (task: DashboardTask) => void; breakpoint?: "md" | "lg"; renderTaskActions?: (task: DashboardTask) => ReactNode; onAddTask?: (date: string) => void }) {
  const desktop = breakpoint === "lg" ? "lg" : "md";
  const mobile = breakpoint === "lg" ? "lg:hidden" : "md:hidden";
  const desktopClass = breakpoint === "lg" ? "hidden overflow-x-auto lg:block" : "hidden overflow-x-auto md:block";
  return <>
    <div className={desktopClass}><div className="grid min-w-[900px] grid-cols-7 divide-x divide-white/[0.06]">{days.map((day) => <div key={day.isoDate} className="min-h-[420px] bg-[#121519]"><div className="border-b border-white/[0.06] px-3 py-4 text-center"><div className="text-[10px] font-semibold uppercase tracking-widest text-white/30">{day.short}</div><div className={`mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${today && day.isoDate === formatDate(today) ? "bg-white text-black" : "text-white/65"}`}>{day.date}</div></div><div className="space-y-2 p-2.5">{day.tasks.length ? day.tasks.map((task) => <DashboardTaskCard key={task.id} task={task} onToggle={onToggleTask}>{renderTaskActions?.(task)}</DashboardTaskCard>) : <RestDay onAdd={onAddTask ? () => onAddTask(day.isoDate) : undefined} desktop />}</div></div>)}</div></div>
    <div className={`${mobile} divide-y divide-white/[0.06]`}>{days.map((day) => { const isToday = !!today && day.isoDate === formatDate(today); return <div key={day.isoDate} className="bg-[#121519]"><div className="flex items-center justify-between px-4 py-3"><div className="flex items-center gap-3"><div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-white text-black" : "bg-white/[0.04] text-white/65"}`}>{day.date}</div><div><div className="text-xs font-semibold uppercase tracking-wider text-white/60">{day.name}</div>{isToday && <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/30">Today</div>}</div></div><div className="text-[11px] text-white/25">{day.tasks.length} {day.tasks.length === 1 ? "task" : "tasks"}</div></div><div className="space-y-2 px-3 pb-3">{day.tasks.length ? day.tasks.map((task) => <DashboardTaskCard key={task.id} task={task} onToggle={onToggleTask} mobile>{renderTaskActions?.(task)}</DashboardTaskCard>) : <RestDay onAdd={onAddTask ? () => onAddTask(day.isoDate) : undefined} />}</div></div>})}</div>
  </>;
}
function formatDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function RestDay({ desktop, onAdd }: { desktop?: boolean; onAdd?: () => void }) { return <div className={desktop ? "flex min-h-[260px] flex-col items-center justify-center" : "rounded-xl border border-white/[0.04] bg-white/[0.01] px-4 py-5 text-center"}><div className="text-xs font-medium text-white/25">Rest day</div><div className="mt-1 text-[10px] text-white/15">No tasks scheduled</div>{onAdd && <button type="button" onClick={onAdd} className="mt-3 text-[10px] text-white/25">Add task</button>}</div>; }

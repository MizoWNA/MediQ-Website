"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { DEFAULT_SUBJECT_COLOR, getSubjectOption } from "@/lib/task-options";

export type DashboardTask = {
  id: string;
  name: string;
  subject: string | null;
  type: string | null;
  completed: boolean;
};

export function DashboardTaskCard({ task, onToggle, mobile = false, children }: { task: DashboardTask; onToggle: (task: DashboardTask) => void; mobile?: boolean; children?: React.ReactNode }) {
  const subject = getSubjectOption(task.subject);
  const colors = subject?.color ?? DEFAULT_SUBJECT_COLOR;
  return <div className={`group relative rounded-xl border ${mobile ? "p-3.5" : "p-3 transition hover:bg-white/[0.04]"} ${colors.card}`}>
    <div className={`flex items-start ${mobile ? "gap-3" : "gap-2.5"}`}>
      <button type="button" onClick={() => onToggle(task)} className={`${mobile ? "mt-0.5" : "mt-1.5"} shrink-0`} title={task.completed ? "Mark incomplete" : "Mark complete"} aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.name}`}>
        {task.completed ? <CheckCircle2 className={`${mobile ? "h-5 w-5" : "h-4 w-4"} text-emerald-400`} /> : <Circle className={`${mobile ? "h-5 w-5" : "h-4 w-4"} text-white/20 transition hover:text-white/60`} />}
      </button>
      <div className={`min-w-0 flex-1 ${children ? "pr-7" : ""}`}>
        <div className={`text-[10px] font-medium uppercase tracking-wide ${colors.text}`}>{subject?.label ?? task.subject ?? task.type ?? "Task"}</div>
        <div className={`mt-1 ${mobile ? "text-sm leading-5" : "text-xs leading-4"} font-medium ${task.completed ? "text-white/30 line-through" : "text-white/75"}`}>{task.name}</div>
        {task.type && task.subject && <div className="mt-1 text-[10px] text-white/25">{task.type}</div>}
      </div>
      {children}
    </div>
  </div>;
}

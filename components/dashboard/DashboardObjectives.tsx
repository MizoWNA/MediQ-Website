"use client";

import { CheckCircle2, Circle, MoreHorizontal, Pencil, Plus, Target, Trash2 } from "lucide-react";

export type DashboardObjective = {
  id: string;
  text: string;
  completed: boolean;
};

export function DashboardObjectives({
  objectives,
  completedCount,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  openMenuId,
  onToggleMenu,
  showAddButton = true,
  subtitle,
}: {
  objectives: DashboardObjective[];
  completedCount: number;
  subtitle?: string;
  onToggle: (objective: DashboardObjective) => void;
  onAdd?: () => void;
  onEdit?: (objective: DashboardObjective) => void;
  onDelete?: (objective: DashboardObjective) => void;
  openMenuId?: string | null;
  onToggleMenu?: (id: string) => void;
  showAddButton?: boolean;
}) {
  const editable = Boolean(onEdit && onDelete && onToggleMenu);

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#15181d]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <Target className="h-4 w-4 text-white/70" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Objectives</h2>
            <p className="mt-0.5 text-xs text-white/35">
              {subtitle ?? "Your ongoing goals"}
            </p>
          </div>
        </div>
        {showAddButton && onAdd ? (
          <button type="button" onClick={onAdd} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white">
            <Plus className="h-3.5 w-3.5" />
            Add Objective
          </button>
        ) : (
          <span className="text-[11px] text-white/30 sm:text-xs">{completedCount} of {objectives.length} complete</span>
        )}
      </div>
      {objectives.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-white/30">
          No objectives yet.
          {onAdd && <button type="button" onClick={onAdd} className="mt-3 block w-full text-xs text-white/45 transition hover:text-white">Add the first objective</button>}
        </div>
      ) : (
        <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4">
          {objectives.map((objective) => (
            <div key={objective.id} className="group relative flex items-start gap-3 bg-[#15181d] px-5 py-4" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={() => onToggle(objective)} className="shrink-0" title={objective.completed ? "Mark incomplete" : "Mark complete"}>
                {objective.completed ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" /> : <Circle className="mt-0.5 h-4 w-4 text-white/25 transition hover:text-white/60" />}
              </button>
              <span className={`min-w-0 flex-1 pr-6 text-sm leading-5 ${objective.completed ? "text-white/35 line-through" : "text-white/70"}`}>
                {objective.text}
              </span>
              {editable && (
                <div className="absolute right-3 top-3">
                  <button type="button" onClick={() => onToggleMenu?.(objective.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-white/25 opacity-0 transition hover:bg-white/[0.06] hover:text-white group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenuId === objective.id && (
                    <div className="absolute right-0 top-8 z-20 w-32 overflow-hidden rounded-lg border border-white/[0.09] bg-[#1a1d22] p-1 shadow-xl">
                      <button type="button" onClick={() => onEdit?.(objective)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"><Pencil className="h-3.5 w-3.5" />Edit</button>
                      <button type="button" onClick={() => onDelete?.(objective)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-rose-300/70 transition hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" />Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

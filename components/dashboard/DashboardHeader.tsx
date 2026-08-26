"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Menu } from "lucide-react";

interface DashboardHeaderProps {
  onSidebarOpen: () => void;
  weekRangeText: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
}

export function DashboardHeader({
  onSidebarOpen,
  weekRangeText,
  onPreviousWeek,
  onNextWeek,
  onGoToToday,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-white/[0.07] px-4 py-4 sm:px-6 lg:px-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onSidebarOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-white/35">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>Weekly Planner</span>
            </div>
            <h1 className="mt-1 truncate text-lg font-semibold tracking-tight sm:text-2xl">
              {weekRangeText}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={onPreviousWeek} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white" aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={onGoToToday} className="hidden h-9 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white sm:block">
            Today
          </button>
          <button type="button" onClick={onNextWeek} className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/50 transition hover:bg-white/[0.06] hover:text-white" aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 sm:hidden">
        <button type="button" onClick={onGoToToday} className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-xs font-medium text-white/50 transition hover:bg-white/[0.06] hover:text-white">
          Today
        </button>
      </div>
    </header>
  );
}

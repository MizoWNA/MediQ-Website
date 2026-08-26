"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

interface DashboardSidebarProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  mobile?: boolean;
  sidebarOpen?: boolean;
  onSidebarOpenChange?: (open: boolean) => void;
}

export function DashboardSidebar({
  children,
  sidebarCollapsed = false,
  mobile = false,
  sidebarOpen = false,
  onSidebarOpenChange,
}: DashboardSidebarProps) {
  if (mobile) {
    return (
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/[0.07] bg-[#0d0f12] shadow-2xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute right-4 top-6">
          <button
            type="button"
            onClick={() => onSidebarOpenChange?.(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/40 transition hover:bg-white/[0.07] hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </aside>
    );
  }

  return (
    <aside
      className={`hidden shrink-0 border-r border-white/[0.07] bg-[#0d0f12] transition-[width] duration-300 lg:flex lg:flex-col ${
        sidebarCollapsed ? "w-[76px]" : "w-[280px]"
      }`}
    >
      {children}
    </aside>
  );
}

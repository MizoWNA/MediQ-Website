"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardShellProps {
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  sidebarCollapsed: boolean;
  sidebarContent: ReactNode;
  children: ReactNode;
}

export function DashboardShell({
  sidebarOpen,
  onSidebarOpenChange,
  sidebarCollapsed,
  sidebarContent,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#0b0d10] px-0 py-0 text-white sm:px-4 sm:py-4">
      <div className="relative flex min-h-screen w-full overflow-hidden rounded-none border border-white/[0.07] bg-[#111419] shadow-2xl sm:min-h-[calc(100vh-2rem)] sm:rounded-2xl">

        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => onSidebarOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          />
        )}

        <DashboardSidebar
          sidebarCollapsed={sidebarCollapsed}
        >
          {sidebarContent}
        </DashboardSidebar>

        <DashboardSidebar
          mobile
          sidebarOpen={sidebarOpen}
          onSidebarOpenChange={onSidebarOpenChange}
        >
          {sidebarContent}
        </DashboardSidebar>

        <main className="min-w-0 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}
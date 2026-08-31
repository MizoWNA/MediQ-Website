"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const isUsersActive =
    pathname === "/admin" || pathname.startsWith("/admin/users");

  const isRegistrationsActive =
    pathname.startsWith("/admin/registrations");

  return (
    <header className="border-b border-white/[0.07] pb-5">
      {/* ============================================================
          TOP BAR
      ============================================================ */}

      <div className="flex items-center justify-between gap-4">
        {/* Logo */}

        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img
              src="/mediq.svg"
              alt="MediQ"
              className="h-9 w-9 object-contain"
            />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight">
              MediQ
            </div>

            <div className="text-[11px] text-white/35">
              Administration
            </div>
          </div>
        </div>

        {/* Logout */}

        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:bg-white/[0.05] hover:text-white"
        >
          Log Out
        </button>
      </div>

      {/* ============================================================
          ADMIN NAVIGATION
      ============================================================ */}

      <nav className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.015] p-1.5 md:flex md:items-stretch md:justify-center md:gap-2">
        {/* Users */}

        <Link
          href="/admin"
          className={`flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 text-xs font-medium transition md:min-w-[120px] md:flex-1 md:px-5 ${
            isUsersActive
              ? "bg-white/[0.08] text-white"
              : "text-white/35 hover:bg-white/[0.04] hover:text-white/70"
          }`}
        >
          Users
        </Link>

        {/* Registrations */}

        <Link
          href="/admin/registrations"
          className={`flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 text-xs font-medium transition md:min-w-[120px] md:flex-1 md:px-5 ${
            isRegistrationsActive
              ? "bg-white/[0.08] text-white"
              : "text-white/35 hover:bg-white/[0.04] hover:text-white/70"
          }`}
        >
          Registrations
        </Link>

        {/* Content */}

        <button
          type="button"
          disabled
          className="flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 text-xs font-medium text-white/15 md:min-w-[120px] md:flex-1 md:px-5"
        >
          Content
        </button>

        {/* Settings */}

        <button
          type="button"
          disabled
          className="flex min-h-11 items-center justify-center rounded-lg px-3 py-2.5 text-xs font-medium text-white/15 md:min-w-[120px] md:flex-1 md:px-5"
        >
          Settings
        </button>
      </nav>
    </header>
  );
}
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Mentor = {
  id: string;
  username: string | null;
  display_name: string | null;
};

type AdminUser = {
  id: string;
  username: string | null;
  display_name: string | null;
  role: "student" | "mentor";
  year: number | null;
  start_date: string | null;
  end_date: string | null;
  exam_date: string | null;
  mentor_id: string | null;
  mentor: Mentor | null;
};


type Role = "student" | "mentor";

export default function AdminPage() {
  const router = useRouter();

  /*
   * ================================================================
   * STATE
   * ================================================================
   */

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("student");

  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [examDate, setExamDate] = useState("");
  const [mentorId, setMentorId] = useState("");

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "student" | "mentor"
  >("all");

  /*
   * ================================================================
   * AUTHENTICATION
   * ================================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function checkAdmin() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        /*
         * Check the profile directly.
         *
         * The API route performs its own admin check too.
         * This check is purely for page access / UX.
         */

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError || profile?.role !== "admin") {
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error("Admin authentication check failed:", err);

        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /*
   * ================================================================
   * LOAD MENTORS
   * ================================================================
   */

  useEffect(() => {
    if (checkingAuth || role !== "student") {
      return;
    }

    let cancelled = false;

    async function loadMentors() {
      setLoadingMentors(true);

      const { data, error: mentorError } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .eq("role", "mentor")
        .order("display_name");

      if (mentorError) {
        console.error("Failed to load mentors:", mentorError.message);

        if (!cancelled) {
          setMentors([]);
        }
      } else if (!cancelled) {
        setMentors(data ?? []);
      }

      if (!cancelled) {
        setLoadingMentors(false);
      }
    }

    loadMentors();

    return () => {
      cancelled = true;
    };
  }, [checkingAuth, role]);


  /*
 * ================================================================
 * LOAD USERS
 * ================================================================
 */

useEffect(() => {
  if (checkingAuth) {
    return;
  }

  let cancelled = false;

  async function loadUsers() {
    setLoadingUsers(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to load users."
        );
      }

      if (!cancelled) {
        setUsers(result.users ?? []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      if (!cancelled) {
        setLoadingUsers(false);
      }
    }
  }

  loadUsers();

  return () => {
    cancelled = true;
  };
}, [checkingAuth, router]);

  /*
   * ================================================================
   * FORM RESET
   * ================================================================
   */

  function resetForm() {
    setUsername("");
    setPassword("");
    setDisplayName("");
    setRole("student");
    setYear("");
    setStartDate("");
    setEndDate("");
    setExamDate("");
    setMentorId("");
    setShowPassword(false);
  }

  /*
   * ================================================================
   * CREATE USER
   * ================================================================
   */

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreating(true);

    try {
      /*
       * Get the current session.
       */

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      /*
       * Client-side validation.
       */

      const cleanUsername = username.trim().toLowerCase();
      const cleanDisplayName = displayName.trim();

      if (!cleanUsername) {
        throw new Error("Username is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      if (!cleanDisplayName) {
        throw new Error("Display name is required.");
      }

      if (
        role === "student" &&
        year &&
        (!Number.isInteger(Number(year)) ||
          Number(year) < 1 ||
          Number(year) > 5)
      ) {
        throw new Error("Academic year must be between 1 and 5.");
      }

      /*
       * Send request to our server-side API.
       */

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          username: cleanUsername,
          password,
          display_name: cleanDisplayName,
          role,

          year:
            role === "student" && year
              ? Number(year)
              : null,

          start_date:
            role === "student" && startDate
              ? startDate
              : null,

          end_date:
            role === "student" && endDate
              ? endDate
              : null,

          exam_date:
            role === "student" && examDate
              ? examDate
              : null,

          mentor_id:
            role === "student" && mentorId
              ? mentorId
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to create user."
        );
      }

      setSuccess(
        `User "${cleanUsername}" was created successfully.`
      );

      resetForm();
    } catch (err) {
      console.error("User creation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create user."
      );
    } finally {
      setCreating(false);
    }
  }

  /*
   * ================================================================
   * LOGOUT
   * ================================================================
   */

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d10] text-white">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </main>
    );
  }

  /*
   * ================================================================
   * PAGE
   * ================================================================
   */

  const generatedEmail =
    username.trim().length > 0
      ? `${username.trim().toLowerCase()}@med.iq`
      : "username@med.iq";

  const filteredUsers = users.filter((user) => {
  const search = userSearch.trim().toLowerCase();

  const matchesSearch =
    !search ||
    user.display_name?.toLowerCase().includes(search) ||
    user.username?.toLowerCase().includes(search);

  const matchesFilter =
    userFilter === "all" ||
    user.role === userFilter;

  return matchesSearch && matchesFilter;
});

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[10%] h-[500px] w-[500px] rounded-full bg-[#1f71a1]/[0.045] blur-[130px]" />

        <div className="absolute bottom-[-200px] right-[-100px] h-[500px] w-[500px] rounded-full bg-[#46a65c]/[0.03] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ============================================================
            HEADER
        ============================================================ */}

        <header className="mb-6 flex items-center justify-between border-b border-white/[0.07] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center">
              <img
                src="/mediq.svg"
                alt="MediQ"
                className="h-9 w-9 object-contain"
              />
            </div>

            <div>
              <div className="text-sm font-semibold tracking-tight">
                MediQ
              </div>

              <div className="text-[11px] text-white/35">
                Administration
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/40 transition hover:bg-white/[0.05] hover:text-white"
          >
            Log Out
          </button>
        </header>

        {/* ============================================================
            PAGE HEADING
        ============================================================ */}

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Console
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            User Management
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
            Create and manage MediQ accounts. Authentication
            credentials are handled securely by Supabase.
          </p>
        </div>

        {/* ============================================================
            CONTENT
        ============================================================ */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* ==========================================================
              CREATE USER
          ========================================================== */}

          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111419]">
            <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
                  <UserPlus className="h-4 w-4 text-white/65" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    Create User
                  </h2>

                  <p className="mt-0.5 text-xs text-white/35">
                    Create an account and its linked profile.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="space-y-6 p-5 sm:p-6"
            >
              {/* ======================================================
                  BASIC INFORMATION
              ====================================================== */}

              <div className="space-y-4">
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                  Account Information
                </div>

                {/* Username */}

                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-xs font-medium text-white/50"
                  >
                    Username
                  </label>

                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) =>
                        setUsername(event.target.value)
                      }
                      placeholder="ahmed"
                      autoComplete="off"
                      required
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 pr-28 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#1f71a1]/10"
                    />

                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/25">
                      @med.iq
                    </div>
                  </div>
                </div>

                {/* Generated email */}

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-white/25">
                    <Mail className="h-3 w-3" />
                    Authentication Email
                  </div>

                  <div className="mt-1.5 text-sm text-white/55">
                    {generatedEmail}
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-xs font-medium text-white/50"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Initial password"
                      autoComplete="new-password"
                      required
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#1f71a1]/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition hover:text-white/60"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-[10px] text-white/20">
                    This password is sent directly to Supabase Auth
                    and is never stored in the profile.
                  </p>
                </div>

                {/* Display name */}

                <div>
                  <label
                    htmlFor="display-name"
                    className="mb-2 block text-xs font-medium text-white/50"
                  >
                    Display Name
                  </label>

                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(event.target.value)
                    }
                    placeholder="Ahmed Mohamed"
                    autoComplete="off"
                    required
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#1f71a1]/10"
                  />
                </div>

                {/* Role */}

                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-xs font-medium text-white/50"
                  >
                    Role
                  </label>

                  <select
                    id="role"
                    value={role}
                    onChange={(event) => {
                      setRole(event.target.value as Role);
                      setMentorId("");
                    }}
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#15181d] px-3 text-sm text-white outline-none transition hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:ring-1 focus:ring-[#1f71a1]/10"
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                  </select>
                </div>
              </div>

              {/* ======================================================
                  STUDENT INFORMATION
              ====================================================== */}

              {role === "student" && (
                <div className="space-y-4 border-t border-white/[0.06] pt-6">
                  <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                    Student Information
                  </div>

                  {/* Year */}

                  <div>
                    <label
                      htmlFor="year"
                      className="mb-2 block text-xs font-medium text-white/50"
                    >
                      Academic Year
                    </label>

                    <select
                      id="year"
                      value={year}
                      onChange={(event) =>
                        setYear(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#15181d] px-3 text-sm text-white outline-none transition hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:ring-1 focus:ring-[#1f71a1]/10"
                    >
                      <option value="">Not set</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                      <option value="5">Year 5</option>
                    </select>
                  </div>

                  {/* Dates */}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="start-date"
                        className="mb-2 block text-xs font-medium text-white/50"
                      >
                        Start Date
                      </label>

                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(event) =>
                          setStartDate(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-sm text-white outline-none transition focus:border-[#1f71a1]/40 focus:ring-1 focus:ring-[#1f71a1]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="end-date"
                        className="mb-2 block text-xs font-medium text-white/50"
                      >
                        End Date
                      </label>

                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(event) =>
                          setEndDate(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-sm text-white outline-none transition focus:border-[#1f71a1]/40 focus:ring-1 focus:ring-[#1f71a1]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="exam-date"
                      className="mb-2 block text-xs font-medium text-white/50"
                    >
                      Exam Date
                    </label>

                    <input
                      id="exam-date"
                      type="date"
                      value={examDate}
                      onChange={(event) =>
                        setExamDate(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-sm text-white outline-none transition focus:border-[#1f71a1]/40 focus:ring-1 focus:ring-[#1f71a1]/10"
                    />
                  </div>

                  {/* Mentor */}

                  <div>
                    <label
                      htmlFor="mentor"
                      className="mb-2 block text-xs font-medium text-white/50"
                    >
                      Mentor
                    </label>

                    <select
                      id="mentor"
                      value={mentorId}
                      onChange={(event) =>
                        setMentorId(event.target.value)
                      }
                      disabled={loadingMentors}
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#15181d] px-3 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-[#1f71a1]/40 focus:ring-1 focus:ring-[#1f71a1]/10"
                    >
                      <option value="">
                        {loadingMentors
                          ? "Loading mentors..."
                          : mentors.length === 0
                            ? "No mentors available"
                            : "No mentor assigned"}
                      </option>

                      {mentors.map((mentor) => (
                        <option
                          key={mentor.id}
                          value={mentor.id}
                        >
                          {mentor.display_name ||
                            mentor.username ||
                            "Unnamed Mentor"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* ======================================================
                  FEEDBACK
              ====================================================== */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-3.5 py-3">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

                  <div className="text-xs leading-5 text-rose-300">
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                  <div className="text-xs leading-5 text-emerald-300">
                    {success}
                  </div>
                </div>
              )}

              {/* ======================================================
                  SUBMIT
              ====================================================== */}

              <button
                type="submit"
                disabled={creating}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    Create User
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </section>

{/* ==========================================================
    USER LIST
========================================================== */}

<section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111419]">
  {/* Header */}

  <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05]">
            <Users className="h-4 w-4 text-white/65" />
          </div>

          <div>
            <h2 className="text-sm font-semibold">
              Users
            </h2>

            <p className="mt-0.5 text-xs text-white/35">
              {users.length}{" "}
              {users.length === 1 ? "account" : "accounts"}{" "}
              created.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}

      <div className="relative sm:w-64">
        <input
          type="text"
          value={userSearch}
          onChange={(event) =>
            setUserSearch(event.target.value)
          }
          placeholder="Search users..."
          className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#1f71a1]/10"
        />
      </div>
    </div>

    {/* Filters */}

    <div className="mt-4 flex items-center gap-1 rounded-xl bg-white/[0.025] p-1">
      {(
        [
          ["all", "All"],
          ["student", "Students"],
          ["mentor", "Mentors"],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setUserFilter(value)}
          className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition ${
            userFilter === value
              ? "bg-white/[0.08] text-white"
              : "text-white/30 hover:text-white/60"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>

  {/* Users */}

  <div className="divide-y divide-white/[0.05]">
    {loadingUsers ? (
      <div className="flex items-center justify-center px-6 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-white/30" />
      </div>
    ) : filteredUsers.length === 0 ? (
      <div className="px-6 py-12 text-center">
        <Users className="mx-auto h-6 w-6 text-white/15" />

        <p className="mt-3 text-sm text-white/40">
          {users.length === 0
            ? "No users have been created yet."
            : "No users match your search."}
        </p>
      </div>
    ) : (
      filteredUsers.map((user) => (
        <div
          key={user.id}
          className="group flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-white/[0.02] sm:px-6"
        >
          {/* User information */}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-medium text-white/80">
                {user.display_name || "Unnamed User"}
              </span>

              <span
                className={`rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
                  user.role === "student"
                    ? "bg-[#1f71a1]/10 text-[#5aa9d8]"
                    : "bg-[#46a65c]/10 text-[#72c681]"
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/25">
              <span>
                @{user.username || "unknown"}
              </span>

              {user.role === "student" &&
                user.year && (
                  <>
                    <span className="text-white/10">
                      •
                    </span>

                    <span>
                      Year {user.year}
                    </span>
                  </>
                )}

              {user.role === "student" &&
                user.mentor && (
                  <>
                    <span className="text-white/10">
                      •
                    </span>

                    <span>
                      Mentor:{" "}
                      {user.mentor.display_name ||
                        user.mentor.username ||
                        "Unknown"}
                    </span>
                  </>
                )}
            </div>
          </div>

          {/* Manage */}

          <button
            type="button"
            className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] text-white/35 opacity-60 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white group-hover:opacity-100"
          >
            Manage
          </button>
        </div>
      ))
    )}
  </div>
</section>

          {/* ==========================================================
              SIDEBAR
          ========================================================== */}

          <aside className="space-y-6">
            {/* Preview */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#111419] p-5">
              <div className="mb-4 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                <Users className="h-3.5 w-3.5" />
                Account Preview
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/20">
                    Display Name
                  </div>

                  <div className="mt-1 text-sm text-white/65">
                    {displayName || "Not set"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/20">
                    Username
                  </div>

                  <div className="mt-1 text-sm text-white/65">
                    {username || "Not set"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/20">
                    Auth Email
                  </div>

                  <div className="mt-1 break-all text-sm text-white/65">
                    {generatedEmail}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/20">
                    Role
                  </div>

                  <div className="mt-1 capitalize text-sm text-white/65">
                    {role}
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture note */}

            <section className="rounded-2xl border border-white/[0.07] bg-[#111419] p-5">
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                How this works
              </div>

              <div className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-white/40">
                    1
                  </div>

                  <p className="text-xs leading-5 text-white/40">
                    An authentication account is created using
                    <span className="text-white/60">
                      {" "}
                      username@med.iq
                    </span>
                    .
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-white/40">
                    2
                  </div>

                  <p className="text-xs leading-5 text-white/40">
                    A linked profile is created using the exact
                    same UUID.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[10px] text-white/40">
                    3
                  </div>

                  <p className="text-xs leading-5 text-white/40">
                    Student-specific information is stored only
                    in the profile.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
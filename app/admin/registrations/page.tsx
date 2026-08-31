"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  UserRound,
  GraduationCap,
  Phone,
  Mail,
  Building2,
  BadgeCheck,
  Clock3,
  Tag,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Registration = {
  id: string;
  registration_code: string;
  full_name: string;
  university: string | null;
  academic_year: number;
  phone_number: string | null;
  email: string | null;
  plan: string;
  base_price: number;
  affiliate_code: string | null;
  discount_percent: number;
  discount_amount: number;
  final_price: number;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  paid_at: string | null;
  paid_by: string | null;
  profile_id: string | null;
};

type RegistrationResponse = {
  registrations: Registration[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type StatusFilter = "pending" | "confirmed" | "cancelled";

type Mentor = {
  id: string;
  username: string | null;
  display_name: string | null;
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  const [editingRegistration, setEditingRegistration] = useState(false);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [creatingAccount, setCreatingAccount] = useState(false);
  const [creatingAccountRequest, setCreatingAccountRequest] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [accountCreated, setAccountCreated] = useState(false);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");

  const [accountForm, setAccountForm] = useState({
    username: "",
    password: "",
    display_name: "",
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    university: "",
    academic_year: 1,
    phone_number: "",
    email: "",
    plan: "",
    affiliate_code: "",
    registration_code: "",
  });

  /*
   * ================================================================
   * FETCH MENTORS
   * ================================================================
   */

  const fetchMentors = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        return;
      }

      const response = await fetch("/api/admin/mentors", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load mentors.");
      }

      setMentors(data.mentors ?? []);
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    }
  }, []);

  /*
   * ================================================================
   * FETCH REGISTRATIONS
   * ================================================================
   */

  const fetchRegistrations = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error(
            "Your admin session has expired. Please log in again."
          );
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("page_size", "10");
        params.set("status", status);

        if (search.trim()) {
          params.set("search", search.trim());
        }

        const response = await fetch(
          `/api/admin/registrations?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to load registrations."
          );
        }

        const result = data as RegistrationResponse;

        setRegistrations(result.registrations ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(result.total_pages ?? 1);
      } catch (err) {
        console.error("Failed to fetch registrations:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load registrations."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, status]
  );

  async function createAccount() {
    setAccountError(null);
    if (!selectedRegistration) {
      return;
    }

    try {
      setCreatingAccountRequest(true);
      setAccountError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `/api/admin/registrations/${selectedRegistration.id}/create-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: accountForm.username.trim(),
            password: accountForm.password,
            display_name: accountForm.display_name.trim(),
            mentor_id: selectedMentorId || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to create account."
        );
      }

    /*
     * Account created successfully.
     *
     * Close the account creation modal and the registration
     * review modal.
     */
    setCreatingAccount(false);
    setSelectedRegistration(null);

    /*
     * Refresh the registrations list so the newly-confirmed
     * registration immediately disappears from Pending.
     */
    await fetchRegistrations(true);
  } catch (error) {
    console.error(
      "Failed to create MediQ account:",
      error
    );

    setAccountError(
      error instanceof Error
        ? error.message
        : "Failed to create account."
    );
  } finally {
    setCreatingAccountRequest(false);
  }
}


  /*
   * ================================================================
   * LOAD DATA
   * ================================================================
   */

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  /*
   * ================================================================
   * HELPERS
   * ================================================================
   */

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatPrice(price: number) {
    return `${price.toLocaleString()} EGP`;
  }

  function getYearLabel(year: number) {
    if (year === 1) return "1st Year";
    if (year === 2) return "2nd Year";
    if (year === 3) return "3rd Year";

    return `${year}th Year`;
  }

  function statusLabel(value: StatusFilter) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function generateUsername(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "");
  }

  /*
   * ================================================================
   * EDIT REGISTRATION
   * ================================================================
   */

  function startEditingRegistration(registration: Registration) {
    setEditForm({
      full_name: registration.full_name,
      university: registration.university ?? "",
      academic_year: registration.academic_year,
      phone_number: registration.phone_number ?? "",
      email: registration.email ?? "",
      plan: registration.plan,
      affiliate_code: registration.affiliate_code ?? "",
      registration_code: registration.registration_code,
    });

    setEditError(null);
    setEditingRegistration(true);
  }

  async function saveRegistrationChanges() {
    if (!selectedRegistration) {
      return;
    }

    try {
      setSavingRegistration(true);
      setEditError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `/api/admin/registrations/${selectedRegistration.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: editForm.full_name,
            university: editForm.university,
            academic_year: editForm.academic_year,
            phone_number: editForm.phone_number,
            email: editForm.email,
            plan: editForm.plan,
            affiliate_code: editForm.affiliate_code,
            registration_code: editForm.registration_code,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to save registration."
        );
      }

      const updated = data.registration as Registration;

      setSelectedRegistration(updated);

      setRegistrations((current) =>
        current.map((registration) =>
          registration.id === updated.id
            ? updated
            : registration
        )
      );

      setEditingRegistration(false);
    } catch (err) {
      console.error("Failed to save registration:", err);

      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to save registration."
      );
    } finally {
      setSavingRegistration(false);
    }
  }

  /*
   * ================================================================
   * OPEN ACCOUNT CREATION
   * ================================================================
   */

  function openAccountCreation(registration: Registration) {
    setAccountForm({
      username: generateUsername(registration.full_name),
      password: "",
      display_name: registration.full_name,
    });

    setSelectedMentorId("");
    setAccountError(null);
    setAccountCreated(false);
    setCreatingAccount(true);
  }

  /*
   * ================================================================
   * CREATE ACCOUNT
   * ================================================================
   */

  async function createAccount() {
    if (!selectedRegistration) {
      return;
    }

    const username = accountForm.username.trim();
    const password = accountForm.password;
    const displayName = accountForm.display_name.trim();

    if (!username) {
      setAccountError("Please enter a username.");
      return;
    }

    if (!password) {
      setAccountError("Please enter a password.");
      return;
    }

    if (!displayName) {
      setAccountError("Please enter a display name.");
      return;
    }

    try {
      setCreatingAccountRequest(true);
      setAccountError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your admin session has expired. Please log in again."
        );
      }

      const response = await fetch(
        `/api/admin/registrations/${selectedRegistration.id}/create-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
            display_name: displayName,
            mentor_id: selectedMentorId || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to create the student account."
        );
      }

      console.log("Account created:", data);

      setAccountCreated(true);

      /*
       * Give the success state a moment so the admin can actually
       * see that the operation succeeded.
       */
      await new Promise((resolve) => setTimeout(resolve, 900));

      setCreatingAccount(false);
      setSelectedRegistration(null);

      /*
       * Refresh the table so the registration status/profile_id
       * immediately reflects the newly created account.
       */
      await fetchRegistrations(true);
    } catch (err) {
      console.error("Failed to create account:", err);

      setAccountError(
        err instanceof Error
          ? err.message
          : "Failed to create the student account."
      );
    } finally {
      setCreatingAccountRequest(false);
    }
  }

  /*
   * ================================================================
   * PAGE
   * ================================================================
   */

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      {/* ============================================================
          BACKGROUND
      ============================================================ */}

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
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <header className="border-b border-white/[0.07] pb-5">
          <div className="flex items-center justify-between">
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
          </div>

          {/* ========================================================
              PAGE NAVIGATION
          ======================================================== */}

          <nav className="mt-5 flex min-h-12 items-stretch justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-1.5">
            <div className="flex flex-1 items-center justify-center rounded-lg bg-white/[0.08] px-5 py-2.5 text-xs font-medium text-white">
              Registrations
            </div>
          </nav>
        </header>

        {/* ==========================================================
            PAGE HEADING
        ========================================================== */}

        <div className="mb-7 mt-8">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
            <BadgeCheck className="h-3.5 w-3.5" />
            Registration Management
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Registrations
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                Review student registrations and create their MediQ accounts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchRegistrations(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* ==========================================================
            CONTROLS
        ========================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, registration code, phone, university..."
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-white/[0.14] focus:bg-white/[0.035]"
            />
          </div>

          {/* Status */}

          <div className="flex rounded-xl border border-white/[0.07] bg-white/[0.015] p-1">
            {(
              ["pending", "confirmed", "cancelled"] as StatusFilter[]
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                  status === item
                    ? "bg-white/[0.09] text-white"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {statusLabel(item)}
              </button>
            ))}
          </div>
        </div>

        {/* ==========================================================
            ERROR
        ========================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-sm text-red-300/80">
            {error}
          </div>
        )}

        {/* ==========================================================
            RESULTS
        ========================================================== */}

        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
          {/* Desktop table */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Student
                  </th>

                  <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Registration
                  </th>

                  <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Plan
                  </th>

                  <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Affiliate
                  </th>

                  <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Submitted
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-sm text-white/25"
                    >
                      Loading registrations...
                    </td>
                  </tr>
                ) : registrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <div className="text-sm text-white/35">
                        No registrations found.
                      </div>

                      <div className="mt-1 text-xs text-white/20">
                        Try changing your search or status filter.
                      </div>
                    </td>
                  </tr>
                ) : (
                  registrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="border-b border-white/[0.04] last:border-0 transition hover:bg-white/[0.018]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-sm text-white/85">
                          {registration.full_name}
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-white/30">
                          <span>
                            {getYearLabel(registration.academic_year)}
                          </span>

                          {registration.university && (
                            <>
                              <span className="text-white/10">•</span>

                              <span className="max-w-[180px] truncate">
                                {registration.university}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-white/50">
                          {registration.registration_code}
                        </div>

                        <div className="mt-1 text-[11px] text-white/20">
                          {registration.phone_number || "No phone"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-white/70">
                          {registration.plan}
                        </div>

                        <div className="mt-1 text-xs text-white/30">
                          {formatPrice(registration.final_price)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {registration.affiliate_code ? (
                          <span className="inline-flex rounded-md border border-sky-400/10 bg-sky-400/[0.04] px-2 py-1 font-mono text-[11px] text-sky-300/60">
                            {registration.affiliate_code}
                          </span>
                        ) : (
                          <span className="text-xs text-white/20">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-xs text-white/45">
                          {formatDate(registration.created_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRegistration(registration)
                          }
                          className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs font-medium text-white/50 transition hover:border-white/[0.12] hover:bg-white/[0.05] hover:text-white"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}

          <div className="divide-y divide-white/[0.05] md:hidden">
            {loading ? (
              <div className="px-5 py-16 text-center text-sm text-white/25">
                Loading registrations...
              </div>
            ) : registrations.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="text-sm text-white/35">
                  No registrations found.
                </div>

                <div className="mt-1 text-xs text-white/20">
                  Try changing your search or status filter.
                </div>
              </div>
            ) : (
              registrations.map((registration) => (
                <button
                  key={registration.id}
                  type="button"
                  onClick={() =>
                    setSelectedRegistration(registration)
                  }
                  className="block w-full px-4 py-4 text-left transition hover:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-white/85">
                        {registration.full_name}
                      </div>

                      <div className="mt-1 text-xs text-white/30">
                        {getYearLabel(registration.academic_year)}

                        {registration.university
                          ? ` · ${registration.university}`
                          : ""}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-sm text-white/65">
                        {formatPrice(registration.final_price)}
                      </div>

                      <div className="mt-1 text-[11px] text-white/25">
                        {registration.plan}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-white/25">
                      {registration.registration_code}
                    </span>

                    <span className="text-[11px] text-white/25">
                      {formatDate(registration.created_at)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* ========================================================
              PAGINATION
          ======================================================== */}

          {!loading && registrations.length > 0 && (
            <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 sm:px-5">
              <div className="text-xs text-white/25">
                {total === 0
                  ? "No results"
                  : `Page ${page} of ${totalPages} · ${total} total`}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((value) => Math.max(1, value - 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/35 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((value) =>
                      Math.min(totalPages, value + 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] text-white/35 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ============================================================
          REVIEW POPUP
      ============================================================ */}

      {selectedRegistration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRegistration(null);
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111419] shadow-2xl shadow-black/40">
            {/* Popup header */}

            <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <div>
                <div className="mb-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                  <Clock3 className="h-3.5 w-3.5" />
                  Registration Review
                </div>

                <h2 className="text-lg font-semibold text-white/90">
                  {editingRegistration
                    ? "Edit Registration"
                    : selectedRegistration.full_name}
                </h2>

                <div className="mt-1 font-mono text-xs text-white/25">
                  {selectedRegistration.registration_code}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRegistration(null)}
                className="rounded-lg p-2 text-white/25 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Popup body */}

            <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {editingRegistration ? (
                  <>
                    <EditField
                      label="Full name"
                      value={editForm.full_name}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          full_name: value,
                        }))
                      }
                    />

                    <EditField
                      label="Registration code"
                      value={editForm.registration_code}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          registration_code: value,
                        }))
                      }
                    />

                    <EditField
                      label="University"
                      value={editForm.university}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          university: value,
                        }))
                      }
                    />

                    <EditField
                      label="Phone"
                      value={editForm.phone_number}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          phone_number: value,
                        }))
                      }
                    />

                    <EditField
                      label="Email"
                      type="email"
                      value={editForm.email}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          email: value,
                        }))
                      }
                    />

                    <EditSelect
                      label="Academic year"
                      value={String(editForm.academic_year)}
                      options={[
                        { value: "1", label: "1st Year" },
                        { value: "2", label: "2nd Year" },
                        { value: "3", label: "3rd Year" },
                        { value: "4", label: "4th Year" },
                        { value: "5", label: "5th Year" },
                      ]}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          academic_year: Number(value),
                        }))
                      }
                    />

                    <EditField
                      label="Plan"
                      value={editForm.plan}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          plan: value,
                        }))
                      }
                    />

                    <EditField
                      label="Affiliate code"
                      value={editForm.affiliate_code}
                      onChange={(value) =>
                        setEditForm((current) => ({
                          ...current,
                          affiliate_code: value,
                        }))
                      }
                    />
                  </>
                ) : (
                  <>
                    <InfoItem
                      icon={<UserRound className="h-4 w-4" />}
                      label="Full name"
                      value={selectedRegistration.full_name}
                    />

                    <InfoItem
                      icon={<GraduationCap className="h-4 w-4" />}
                      label="Academic year"
                      value={getYearLabel(
                        selectedRegistration.academic_year
                      )}
                    />

                    <InfoItem
                      icon={<Building2 className="h-4 w-4" />}
                      label="University"
                      value={
                        selectedRegistration.university || "—"
                      }
                    />

                    <InfoItem
                      icon={<Phone className="h-4 w-4" />}
                      label="Phone"
                      value={
                        selectedRegistration.phone_number || "—"
                      }
                    />

                    <InfoItem
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={selectedRegistration.email || "—"}
                    />

                    <InfoItem
                      icon={<Tag className="h-4 w-4" />}
                      label="Plan"
                      value={selectedRegistration.plan}
                    />
                  </>
                )}
              </div>

              {editError && (
                <div className="mt-4 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300/80">
                  {editError}
                </div>
              )}

              {/* Financial information */}

              <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                  Payment
                </div>

                <div className="space-y-2">
                  <PriceRow
                    label="Base price"
                    value={formatPrice(
                      selectedRegistration.base_price
                    )}
                  />

                  {selectedRegistration.discount_amount > 0 && (
                    <PriceRow
                      label={`Discount${
                        selectedRegistration.discount_percent
                          ? ` (${selectedRegistration.discount_percent}%)`
                          : ""
                      }`}
                      value={`− ${formatPrice(
                        selectedRegistration.discount_amount
                      )}`}
                      muted
                    />
                  )}

                  <div className="border-t border-white/[0.06] pt-2">
                    <PriceRow
                      label="Final price"
                      value={formatPrice(
                        selectedRegistration.final_price
                      )}
                      strong
                    />
                  </div>
                </div>
              </div>

              {/* Affiliate */}

              {selectedRegistration.affiliate_code && (
                <div className="mt-3 rounded-xl border border-sky-400/10 bg-sky-400/[0.025] p-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-sky-300/40">
                    Affiliate
                  </div>

                  <div className="mt-1 font-mono text-sm text-sky-200/70">
                    {selectedRegistration.affiliate_code}
                  </div>
                </div>
              )}

              <div className="mt-5 text-xs text-white/25">
                Submitted{" "}
                {formatDateTime(selectedRegistration.created_at)}
              </div>
            </div>

            {/* Popup footer */}

            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4 sm:px-6">
              <div>
                {!editingRegistration &&
                  selectedRegistration.status === "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        startEditingRegistration(
                          selectedRegistration
                        )
                      }
                      className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Edit
                    </button>
                  )}
              </div>

              <div className="flex items-center gap-2">
                {editingRegistration ? (
                  <>
                    <button
                      type="button"
                      disabled={savingRegistration}
                      onClick={() => {
                        setEditingRegistration(false);
                        setEditError(null);
                      }}
                      className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={savingRegistration}
                      onClick={saveRegistrationChanges}
                      className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingRegistration
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedRegistration(null)
                      }
                      className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      Close
                    </button>

                    {selectedRegistration.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          openAccountCreation(
                            selectedRegistration
                          )
                        }
                        className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90"
                      >
                        Create Account
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          ACCOUNT CREATION POPUP
      ============================================================ */}

      {creatingAccount && selectedRegistration && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creatingAccountRequest
            ) {
              setCreatingAccount(false);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111419] shadow-2xl shadow-black/40">
            {/* Header */}

            <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <div>
                <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                  Account Creation
                </div>

                <h2 className="text-lg font-semibold text-white/90">
                  Create MediQ Account
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  {selectedRegistration.full_name}
                </p>
              </div>

              <button
                type="button"
                disabled={creatingAccountRequest}
                onClick={() => setCreatingAccount(false)}
                className="rounded-lg p-2 text-white/25 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}

            <div className="space-y-5 px-5 py-5 sm:px-6">
              {/* Username */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                  Username
                </label>

                <input
                  value={accountForm.username}
                  disabled={creatingAccountRequest}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      username: event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9._-]/g, ""),
                    }))
                  }
                  placeholder="username"
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-white/[0.14] focus:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="mt-2 rounded-lg border border-sky-400/[0.08] bg-sky-400/[0.025] px-3 py-2">
                  <p className="text-[11px] leading-5 text-white/35">
                    This will be the student's login email:
                  </p>

                  <p className="mt-0.5 font-mono text-xs text-sky-300/70">
                    {accountForm.username || "username"}
                    <span className="text-sky-300/35">
                      @med.iq
                    </span>
                  </p>
                </div>
              </div>

              {/* Password */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                  Password
                </label>

                <input
                  type="text"
                  value={accountForm.password}
                  disabled={creatingAccountRequest}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter temporary password"
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-white/[0.14] focus:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-1.5 text-[11px] text-white/20">
                  This is the password the student will use to log in.
                </p>
              </div>

              {/* Display name */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                  Display name
                </label>

                <input
                  value={accountForm.display_name}
                  disabled={creatingAccountRequest}
                  onChange={(event) =>
                    setAccountForm((current) => ({
                      ...current,
                      display_name: event.target.value,
                    }))
                  }
                  placeholder="Student's display name"
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-white/[0.14] focus:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Mentor */}

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
                  Mentor
                </label>

                <select
                  value={selectedMentorId}
                  disabled={creatingAccountRequest}
                  onChange={(event) =>
                    setSelectedMentorId(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#15181d] px-3.5 text-sm text-white/80 outline-none transition focus:border-white/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">No mentor assigned</option>

                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.display_name ||
                        mentor.username ||
                        "Unnamed mentor"}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-[11px] text-white/20">
                  You can assign a mentor now or leave this unassigned.
                </p>
              </div>

              {/* Error */}

              {accountError && (
                <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-xs leading-5 text-red-300/80">
                  {accountError}
                </div>
              )}

              {/* Success */}

              {accountCreated && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300/70" />

                  <div>
                    <div className="text-xs font-medium text-emerald-200/80">
                      Account created successfully
                    </div>

                    <div className="mt-0.5 text-[11px] text-emerald-300/40">
                      The student's MediQ account is ready.
                    </div>
                  </div>
                </div>
              )}

              {/* Account summary */}
              {accountError && (
                <div className="rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300/80">
                  {accountError}
                </div>
              )}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white/25">
                  Account
                </div>

                <div className="space-y-2">
                  <PriceRow
                    label="Academic year"
                    value={getYearLabel(
                      selectedRegistration.academic_year
                    )}
                  />

                  <PriceRow
                    label="Plan"
                    value={selectedRegistration.plan}
                  />

                  <PriceRow
                    label="Registration"
                    value={
                      selectedRegistration.registration_code
                    }
                  />

                  <PriceRow
                    label="Amount"
                    value={formatPrice(
                      selectedRegistration.final_price
                    )}
                    strong
                  />
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4 sm:px-6">
              <button
                type="button"
                disabled={creatingAccountRequest}
                onClick={() => setCreatingAccount(false)}
                className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Back
              </button>

              <button
                type="button"
                disabled={
                  creatingAccountRequest ||
                  !accountForm.username.trim() ||
                  !accountForm.password ||
                  !accountForm.display_name.trim()
                }
                onClick={createAccount}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creatingAccountRequest ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/*
 * ================================================================
 * SMALL UI COMPONENTS
 * ================================================================
 */

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.018] p-3.5">
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/20">
        {icon}
        {label}
      </div>

      <div className="mt-2 truncate text-sm text-white/70">
        {value}
      </div>
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
  strong = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={`text-xs ${
          muted ? "text-white/25" : "text-white/35"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${
          strong
            ? "font-semibold text-white/85"
            : muted
              ? "text-white/30"
              : "text-white/55"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-sm text-white/80 outline-none transition placeholder:text-white/20 focus:border-white/[0.16] focus:bg-white/[0.04]"
      />
    </label>
  );
}

function EditSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-white/25">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#15181d] px-3 text-sm text-white/80 outline-none transition focus:border-white/[0.16]"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
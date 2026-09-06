"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, UserPlus, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/admin-header";
import {
  Registration,
  Mentor,
  Section,
  InfoItem,
  formatDate,
  formatPrice,
  getYearLabel,
  statusClass,
  statusLabel,
} from "@/components/admin/registrations/types";
import RegistrationQuestionnaire from "@/components/admin/registrations/RegistrationQuestionnaire";

export default function RegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounting, setAccounting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    university: "",
    academic_year: 1,
    phone_number: "",
    email: "",
    plan: "",
    affiliate_code: "",
    registration_code: "",
  });

  const [account, setAccount] = useState({
    username: "",
    password: "",
    display_name: "",
    exam_date: "",
  });

  const token = useCallback(
    async () =>
      (await supabase.auth.getSession()).data.session?.access_token,
    [],
  );

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const accessToken = await token();

      if (!accessToken) {
        throw new Error(
          "Your admin session has expired. Please log in again.",
        );
      }

      const response = await fetch(`/api/admin/registrations/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load registration.");
      }

      // Clear any stale error once registration loads successfully now.
      setError(null);

      setRegistration(data.registration);
      setMentors(data.mentors ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load registration.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!registration) return;

    setForm({
      full_name: registration.full_name,
      university: registration.university ?? "",
      academic_year: registration.academic_year,
      phone_number: registration.phone_number ?? "",
      email: registration.email ?? "",
      plan: registration.plan,
      affiliate_code: registration.affiliate_code ?? "",
      registration_code: registration.registration_code,
    });

    setAccount((value) => ({
      ...value,
      display_name: registration.full_name,
      username: registration.email?.split("@")[0] ?? "",
    }));
  }, [registration]);

  async function save(event: FormEvent) {
    event.preventDefault();

    if (!registration) return;

    try {
      setSaving(true);
      setError(null);

      const accessToken = await token();

      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save registration.");
      }

      setRegistration(data.registration);
      setEditing(false);
      setMessage("Registration updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save registration.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (
      !registration ||
      !window.confirm(
        `Cancel the registration for ${registration.full_name}?`,
      )
    ) {
      return;
    }

    try {
      setError(null);

      const accessToken = await token();

      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to cancel registration.");
      }

      setRegistration(data.registration);
      setMessage("Registration cancelled.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel registration.",
      );
    }
  }

  async function createAccount(event: FormEvent) {
    event.preventDefault();

    try {
      setAccounting(true);
      setError(null);

      const accessToken = await token();

      const response = await fetch(
        `/api/admin/registrations/${id}/create-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...account,
            mentor_id: mentorId || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create account.");
      }

      setRegistration(data.registration ?? registration);
      setMessage("Student account created successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account.",
      );
    } finally {
      setAccounting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0d10] p-8 text-white">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  if (!registration) {
    return (
      <main className="min-h-screen bg-[#0b0d10] p-8 text-white">
        <AdminHeader />

        <div className="mt-8 text-sm text-red-200">
          {error || "Registration not found."}
        </div>
      </main>
    );
  }

  const field = (
    key: keyof typeof form,
    label: string,
    type = "text",
  ) => (
    <label className="flex flex-col gap-2 text-xs text-white/45">
      {label}

      <input
        type={type}
        value={String(form[key])}
        onChange={(event) =>
          setForm({
            ...form,
            [key]:
              type === "number"
                ? Number(event.target.value)
                : event.target.value,
          })
        }
        className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white outline-none"
      />
    </label>
  );

  return (
    <main className="min-h-screen bg-[#0b0d10] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AdminHeader />

        <button
          onClick={() => router.push("/admin/registrations")}
          className="mt-7 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <ArrowLeft size={15} />
          Registrations
        </button>

        <div className="mt-6 flex flex-col gap-4 border-b border-white/[0.07] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-xs text-sky-300/50">
              {registration.registration_code}
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {registration.full_name}
            </h1>

            <div className="mt-2 flex items-center gap-3 text-sm text-white/35">
              <span
                className={`rounded-full px-2 py-1 text-xs ${statusClass(
                  registration.status,
                )}`}
              >
                {statusLabel(registration.status)}
              </span>

              <span>
                Submitted {formatDate(registration.created_at)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {registration.status === "pending" && (
              <>
                <button
                  onClick={() => setEditing((value) => !value)}
                  className="rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-white/60"
                >
                  {editing ? "Close edit" : "Edit"}
                </button>

                <button
                  onClick={() => void cancel()}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 px-3 py-2 text-xs text-red-300"
                >
                  <XCircle size={14} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-200">
            {message}
          </div>
        )}

        {/* ============================================================
            REGISTRATION / ACCOUNT INFORMATION
            Two-column layout on desktop.
            ============================================================ */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* LEFT: Student + Registration information */}
          <div className="flex flex-col gap-5">
            {editing ? (
              <form
                onSubmit={save}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <h2 className="mb-5 text-sm font-semibold">
                  Edit registration
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {field("full_name", "Full name")}
                  {field("university", "University")}
                  {field("academic_year", "Academic year", "number")}
                  {field("phone_number", "Phone")}
                  {field("email", "Email", "email")}
                  {field("plan", "Plan")}
                  {field("affiliate_code", "Affiliate code")}
                  {field("registration_code", "Registration code")}
                </div>

                <button
                  disabled={saving}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-300 px-4 py-2.5 text-xs font-medium text-slate-950 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </form>
            ) : (
              <>
                <Section title="Student information">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Full name"
                      value={registration.full_name}
                    />

                    <InfoItem
                      label="University"
                      value={registration.university ?? "—"}
                    />

                    <InfoItem
                      label="Academic year"
                      value={getYearLabel(
                        registration.academic_year,
                      )}
                    />

                    <InfoItem
                      label="Phone"
                      value={registration.phone_number ?? "—"}
                    />

                    <InfoItem
                      label="Email"
                      value={registration.email ?? "—"}
                    />
                  </div>
                </Section>

                <Section title="Registration and payment">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InfoItem
                      label="Plan"
                      value={registration.plan}
                    />

                    <InfoItem
                      label="Base price"
                      value={formatPrice(
                        registration.base_price,
                      )}
                    />

                    <InfoItem
                      label="Discount"
                      value={formatPrice(
                        registration.discount_amount,
                      )}
                    />

                    <InfoItem
                      label="Final price"
                      value={formatPrice(
                        registration.final_price,
                      )}
                    />

                    <InfoItem
                      label="Affiliate code"
                      value={
                        registration.affiliate_code ?? "—"
                      }
                    />

                    <InfoItem
                      label="Paid date"
                      value={formatDate(registration.paid_at)}
                    />

                    <InfoItem
                      label="Paid by"
                      value={registration.paid_by ?? "—"}
                    />
                  </div>
                </Section>
              </>
            )}
          </div>

          {/* RIGHT: Account actions/status */}
          <div className="flex flex-col gap-5">
            {!registration.profile_id &&
              registration.status !== "cancelled" && (
                <form
                  onSubmit={createAccount}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                >
                  <h2 className="text-sm font-semibold">
                    Create student account
                  </h2>

                  <div className="mt-5 flex flex-col gap-4">
                    <label className="text-xs text-white/45">
                      Username

                      <input
                        required
                        value={account.username}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            username: e.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white"
                      />
                    </label>

                    <label className="text-xs text-white/45">
                      Password

                      <input
                        required
                        type="password"
                        value={account.password}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            password: e.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white"
                      />
                    </label>

                    <label className="text-xs text-white/45">
                      Display name

                      <input
                        required
                        value={account.display_name}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            display_name: e.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white"
                      />
                    </label>

                    <label className="text-xs text-white/45">
                      Mentor

                      <select
                        value={mentorId}
                        onChange={(e) =>
                          setMentorId(e.target.value)
                        }
                        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#14181d] px-3 py-2.5 text-sm text-white"
                      >
                        <option value="">No mentor</option>

                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.display_name ||
                              mentor.username ||
                              mentor.id}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs text-white/45">
                      Exam date

                      <input
                        type="date"
                        value={account.exam_date}
                        onChange={(e) =>
                          setAccount({
                            ...account,
                            exam_date: e.target.value,
                          })
                        }
                        className="mt-2 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white"
                      />
                    </label>
                  </div>

                  <button
                    disabled={accounting}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-300 px-4 py-2.5 text-xs font-medium text-slate-950 disabled:opacity-50"
                  >
                    <UserPlus size={14} />
                    {accounting
                      ? "Creating..."
                      : "Create account"}
                  </button>
                </form>
              )}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-sm text-white/45">
              {registration.profile_id
                ? "A MediQ student account is linked to this registration."
                : "No student account is linked yet."}
            </div>
          </div>
        </div>

        {/* ============================================================
            QUESTIONNAIRE / MENTOR ASSESSMENT
            Full-width section BELOW the two-column information area.
            ============================================================ */}
        <div className="mt-5">
          <RegistrationQuestionnaire registrationId={id} />
        </div>
      </div>
    </main>
  );
}
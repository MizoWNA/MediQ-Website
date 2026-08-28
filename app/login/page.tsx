"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyhole,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");

  /*
   * ================================================================
   * CHECK EXISTING SESSION
   * ================================================================
   */

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      /*
       * Existing session found.
       * Determine where the user belongs before redirecting.
       */

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_time")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role === "admin") {
        router.replace("/admin/");
        return;
      }

      if (profile?.role === "mentor") {
        router.replace("/mentor");
        return;
      }

      if (profile?.role === "student") {
        if (profile.first_time) {
          router.replace("/onboarding");
        } else {
          router.replace("/dashboard");
        }

        return;
      }

      /*
       * Don't leave the loading screen forever if the
       * authenticated account has no valid role.
       */

      setError(
        "Your account is authenticated, but no valid account role was found."
      );

      setLoading(false);
    }

    checkSession();
  }, [router]);

  /*
   * ================================================================
   * LOGIN
   * ================================================================
   */

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoggingIn(true);

    try {
      /*
       * ------------------------------------------------------------
       * AUTHENTICATE
       * ------------------------------------------------------------
       */

      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) {
        throw new Error(
          loginError.message
        );
      }

      if (!data.user) {
        throw new Error(
          "Authentication succeeded, but no user was returned."
        );
      }

      /*
       * ------------------------------------------------------------
       * FETCH USER ROLE
       * ------------------------------------------------------------
       *
       * The profile uses the same UUID as auth.users.
       */

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role, first_time")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        throw new Error(
          `Unable to determine your account type: ${profileError.message}`
        );
      }

      if (!profile) {
        throw new Error(
          "Your account is authenticated, but no profile was found."
        );
      }

      /*
       * ------------------------------------------------------------
       * ROLE-BASED REDIRECT
       * ------------------------------------------------------------
       */

      if (profile.role === "admin") {
        router.replace("/admin");
        router.refresh();
        return;
      }

      if (profile.role === "student") {
        router.replace(
          profile.first_time
            ? "/onboarding"
            : "/dashboard"
        );

        router.refresh();
        return;
      }

      if (profile.role === "mentor") {
        router.replace("/mentor");
        router.refresh();
        return;
      }

      throw new Error(
        "Your account does not have a valid role assigned."
      );
    } catch (err) {
      console.error(
        "Login failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );

      /*
       * If authentication succeeded but something after
       * authentication failed, make sure the loading state
       * doesn't remain stuck.
       */
    } finally {
      setLoggingIn(false);
    }
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] text-white">

        {/* Background glow */}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.06] blur-[100px]" />
        </div>

        <Loader2 className="relative h-5 w-5 animate-spin text-white/40" />
      </main>
    );
  }

  /*
   * ================================================================
   * LOGIN UI
   * ================================================================
   */

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-4 py-8 text-white sm:px-6">

      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0">

        {/* Main glow */}

        <div className="absolute left-1/2 top-[35%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.055] blur-[120px]" />

        {/* Secondary green glow */}

        <div className="absolute bottom-[-180px] right-[-100px] h-[400px] w-[400px] rounded-full bg-[#46a65c]/[0.035] blur-[110px]" />

        {/* Subtle grid */}

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <div className="relative z-10 w-full max-w-[420px]">

        {/* Logo */}

        <div className="mb-7 flex flex-col items-center sm:mb-8">

          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-[#1f71a1]/10 blur-xl" />

            <div
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(31,113,161,0.12), 0 0 0 2px rgba(70,166,92,0.05)",
              }}
            >
              <img
                src="/mediq.svg"
                alt="MediQ"
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="text-sm font-semibold tracking-tight">
              MediQ
            </div>

            <div className="mt-0.5 text-[11px] text-white/30">
              Mentorship
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD
        ======================================================== */}

        <div
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111419]/95 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(31,113,161,0.035)",
          }}
        >

          {/* Top accent */}

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1f71a1]/40 to-transparent" />

          <div className="p-5 sm:p-8">

            {/* Heading */}

            <div className="mb-7">

              <div className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Access
              </div>

              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Welcome back
              </h1>

              <p className="mt-1.5 text-sm leading-5 text-white/40">
                Sign in to continue to your
                mentorship dashboard.
              </p>
            </div>

            {/* ====================================================
                FORM
            ==================================================== */}

            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-medium text-white/50"
                >
                  Email
                </label>

                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 transition group-focus-within:text-[#1f71a1]/70" />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#1f71a1]/10"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-white/50"
                  >
                    Password
                  </label>
                </div>

                <div className="group relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25 transition group-focus-within:text-[#1f71a1]/70" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/[0.12] focus:border-[#1f71a1]/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-[#1f71a1]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
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
              </div>

              {/* Error */}

              {error && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3.5 py-3 text-xs leading-5 text-rose-300">
                  {error}
                </div>
              )}

              {/* Submit */}

              <button
                type="submit"
                disabled={loggingIn}
                className="group mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom information */}

          <div className="border-t border-white/[0.06] bg-white/[0.015] px-5 py-3.5 text-center sm:px-8">
            <p className="text-[10px] leading-4 text-white/25">
              Your account access is managed through
              MediQ Mentorship.
            </p>
          </div>
        </div>

        {/* Footer */}

        <p className="mt-5 text-center text-[10px] text-white/20">
          MediQ Mentorship
        </p>
      </div>
    </main>
  );
}

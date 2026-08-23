"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  /*
   * ================================================================
   * CHECK EXISTING SESSION
   * ================================================================
   *
   * If the user is already logged in, there is no reason to show
   * the login page again.
   */

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  /*
   * ================================================================
   * LOGIN
   * ================================================================
   */

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoggingIn(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        throw new Error(loginError.message);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  /*
   * ================================================================
   * LOADING SESSION CHECK
   * ================================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d10] text-white">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  /*
   * ================================================================
   * LOGIN UI
   * ================================================================
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d10] px-4 text-white">
      <div className="w-full max-w-[400px]">

        {/* Logo */}

        <div className="mb-8 flex justify-center">
          <img
            src="/mediq.svg"
            alt="MediQ"
            className="h-12 w-12 object-contain"
          />
        </div>

        {/* Card */}

        <div className="rounded-2xl border border-white/[0.07] bg-[#111419] p-6 shadow-2xl sm:p-8">

          {/* Heading */}

          <div className="mb-7">
            <h1 className="text-xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-1.5 text-sm text-white/40">
              Sign in to your MediQ account.
            </p>
          </div>

          {/* Form */}

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

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.04]"
                />
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
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-lg border border-white/[0.08] bg-white/[0.025] pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/[0.04]"
                />
              </div>
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loggingIn}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}

        <p className="mt-5 text-center text-[11px] text-white/20">
          MediQ Mentorship
        </p>
      </div>
    </main>
  );
}
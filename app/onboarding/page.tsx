"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import OnboardingShell from "@/components/onboarding/OnboardingShell";

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ================================================================
   * VERIFY SESSION + STUDENT STATUS
   * ================================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role, first_time")
            .eq("id", session.user.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!profile) {
          throw new Error("Profile not found.");
        }

        /*
         * Onboarding is only for first-time students.
         */

        if (profile.role !== "student") {
          switch (profile.role) {
            case "mentor":
              router.replace("/mentor");
              break;

            case "admin":
              router.replace("/admin");
              break;

            default:
              router.replace("/login");
          }

          return;
        }

        /*
         * Students who have already completed onboarding
         * should go directly to their dashboard.
         */

        if (!profile.first_time) {
          router.replace("/dashboard");
          return;
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Onboarding authentication check failed:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to load onboarding. Please try again."
          );
          setLoading(false);
        }
      }
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /*
   * ================================================================
   * FINISH ONBOARDING
   * ================================================================
   */

  async function finishOnboarding() {
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { error: updateError } =
        await supabase.rpc("complete_onboarding");

      if (updateError) {
        throw updateError;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(
        "Failed to finish onboarding:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to finish onboarding."
      );
    }
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d10] text-white">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </main>
    );
  }

  /*
   * ================================================================
   * ERROR
   * ================================================================
   */

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0d10] px-6 text-white">
        <div className="max-w-sm text-center">
          <p className="text-sm text-white/60">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * ONBOARDING
   * ================================================================
   */

  return (
    <OnboardingShell
      onFinish={finishOnboarding}
    />
  );
}
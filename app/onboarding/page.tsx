"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  Target,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const steps = [
  {
    icon: Target,
    title: "Welcome to MediQ",
    description:
      "Your dashboard is where you'll keep track of everything you need to get done.",
  },
  {
    icon: CalendarDays,
    title: "Your Planner",
    description:
      "Tasks are organized around your study schedule so you can see what needs to be done and when.",
  },
  {
    icon: BookOpen,
    title: "Track Your Progress",
    description:
      "Complete tasks as you work through them. MCQ tasks also let you record how many questions you've solved.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);
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
         * Onboarding is for first-time students only.
         */

        if (profile.role !== "student") {
          if (profile.role === "mentor") {
            router.replace("/mentor");
          } else if (profile.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/login");
          }

          return;
        }

        /*
         * If they have already completed onboarding,
         * don't let them see it again.
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
    setFinishing(true);

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

      setFinishing(false);
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

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  /*
   * ================================================================
   * PAGE
   * ================================================================
   */

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-4 py-8 text-white">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[35%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.055] blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-100px] h-[400px] w-[400px] rounded-full bg-[#46a65c]/[0.035] blur-[110px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Content */}

      <div className="relative z-10 w-full max-w-[520px]">
        {/* Logo */}

        <div className="mb-7 flex flex-col items-center">
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

          <div className="mt-4 text-sm font-semibold tracking-tight">
            MediQ
          </div>
        </div>

        {/* Card */}

        <div
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111419]/95 shadow-2xl backdrop-blur-xl"
          style={{
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(31,113,161,0.035)",
          }}
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#1f71a1]/40 to-transparent" />

          <div className="p-6 sm:p-8">
            {/* Progress */}

            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/25">
                <span>Getting Started</span>

                <span>
                  {currentStep + 1} / {steps.length}
                </span>
              </div>

              <div className="flex gap-1.5">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep
                        ? "bg-[#1f71a1]"
                        : "bg-white/[0.07]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step */}

            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.035]">
                <Icon className="h-7 w-7 text-[#5aa9d8]" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                {step.title}
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                {step.description}
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-3.5 py-3 text-xs leading-5 text-rose-300">
                {error}
              </div>
            )}

            {/* Actions */}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={
                  currentStep === 0 || finishing
                }
                onClick={() =>
                  setCurrentStep(
                    (step) => step - 1
                  )
                }
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              {isLastStep ? (
                <button
                  type="button"
                  disabled={finishing}
                  onClick={finishOnboarding}
                  className="group flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {finishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting things up...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <CheckCircle2 className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep(
                      (step) => step + 1
                    )
                  }
                  className="group flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[10px] text-white/20">
          You only need to do this once.
        </p>
      </div>
    </main>
  );
}
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
import OnboardingShell from "@/components/onboarding/OnboardingShell";



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

return (
  <OnboardingShell
    onFinish={finishOnboarding}
  />
);
  
  
}
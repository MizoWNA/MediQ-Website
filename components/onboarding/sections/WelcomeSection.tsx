import { Sparkles } from "lucide-react";

export default function WelcomeSection() {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-[0_0_50px_rgba(31,113,161,0.08)]">
        <Sparkles className="h-8 w-8 text-[#5aa9d8]" />
      </div>

      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
        Welcome to MediQ
      </p>

      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Let's get you started.
      </h1>

      <p className="mt-4 max-w-md text-sm leading-6 text-white/40">
        A quick tour of MediQ Mentorship so you
        know exactly what you're getting into before
        you start.
      </p>
    </section>
  );
}
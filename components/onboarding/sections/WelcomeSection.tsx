"use client";

export default function WelcomeSection() {
  return (
    <section className="relative flex min-h-[520px] w-full items-center justify-center px-6 py-12 text-white md:min-h-[560px]">
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        {/* Logo */}

        <div className="mb-8 sm:mb-10">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-[-10px] rounded-[28px] bg-[#1f71a1]/[0.08] blur-3xl" />

            <div
              className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-white/[0.08] bg-[#111419]"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(31,113,161,0.14), 0 0 0 2px rgba(70,166,92,0.04), 0 12px 40px rgba(0,0,0,0.18)",
              }}
            >
              <img
                src="/mediq.svg"
                alt="MediQ"
                className="h-11 w-11 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Eyebrow */}

        <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.28em] text-[#5aa9d8]/50">
          MediQ Mentorship
        </div>

        {/* Heading */}

        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-[56px] md:leading-[1.05]">
          Welcome to{" "}
          <span className="text-white/75">MediQ.</span>
        </h1>

        {/* Subtitle */}

        <p className="mt-6 max-w-xl text-base leading-7 text-white/40 sm:text-[17px] sm:leading-8">
          Your medical journey, organized.
          <br />
          Your mentor, your plan, your progress.
        </p>

        {/* Divider */}

        <div className="mt-9 flex items-center gap-3">
          <div className="h-px w-10 bg-white/[0.06]" />

          <div className="h-1 w-1 rounded-full bg-[#5aa9d8]/40" />

          <div className="h-px w-10 bg-white/[0.06]" />
        </div>

        {/* Supporting line */}

        <p className="mt-7 text-[11px] tracking-wide text-white/20">
          Let's take a quick look around.
        </p>
      </div>
    </section>
  );
}
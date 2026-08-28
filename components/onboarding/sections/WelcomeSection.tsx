"use client";

export default function WelcomeSection() {
  return (
    <section className="flex w-full items-center justify-center px-4 py-8 sm:px-6 md:py-12">
      <div className="relative flex w-full max-w-3xl flex-col items-center text-center">
        {/* Logo */}

        <div className="mb-8 sm:mb-10">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-[24px] bg-[#1f71a1]/10 blur-2xl" />

            <div
              className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/[0.08] bg-[#111419]"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(31,113,161,0.12), 0 0 0 2px rgba(70,166,92,0.04)",
              }}
            >
              <img
                src="/mediq.svg"
                alt="MediQ"
                className="h-10 w-10 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Eyebrow */}

        <div className="mb-5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/30">
          MediQ Mentorship
        </div>

        {/* Heading */}

        <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl md:text-6xl">
          Welcome to{" "}
          <span className="text-white/80">
            MediQ.
          </span>
        </h1>

        {/* Subtitle */}

        <p className="mt-6 max-w-lg text-base leading-7 text-white/40 sm:text-lg">
          Your medical journey, organized.
          <br />
          Your mentor, your plan, your progress.
        </p>

        {/* Supporting line */}

        <p className="mt-8 text-[11px] text-white/20">
          Let's take a quick look around.
        </p>
      </div>
    </section>
  );
}

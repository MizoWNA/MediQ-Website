"use client";

import { useEffect, useState } from "react";

import OnboardingProgress from "./OnboardingProgress";
import OnboardingNavigation from "./OnboardingNavigation";
import BootSequence from "./BootSequence";
import { onboardingSections } from "./onboarding-sections";

interface OnboardingShellProps {
  onFinish: () => Promise<void> | void;
}

export default function OnboardingShell({
  onFinish,
}: OnboardingShellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [booting, setBooting] = useState(true);

  /*
   * ================================================================
   * ONBOARDING CONFIGURATION
   * ================================================================
   */

  const sections = onboardingSections;

  const currentSection = sections[currentIndex];
  const CurrentSection = currentSection.component;

  /*
   * ================================================================
   * NAVIGATION
   * ================================================================
   */

  function goNext() {
    setCurrentIndex((current) =>
      Math.min(current + 1, sections.length - 1)
    );
  }

  function goBack() {
    setCurrentIndex((current) =>
      Math.max(current - 1, 0)
    );
  }

  async function handleFinish() {
    if (finishing) return;

    setFinishing(true);

    try {
      await onFinish();
    } catch {
      setFinishing(false);
    }
  }

  /*
   * ================================================================
   * KEYBOARD NAVIGATION
   * ================================================================
   */

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /*
   * ================================================================
   * RENDER
   * ================================================================
   */

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#0b0d10] text-white">
      {/* ============================================================
          BOOT SEQUENCE
          ============================================================ */}

      {booting && (
        <BootSequence
          onComplete={() => setBooting(false)}
        />
      )}

      {/* ============================================================
          BACKGROUND
          ============================================================ */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.045] blur-[140px]" />

        <div className="absolute bottom-[-200px] right-[-150px] h-[450px] w-[450px] rounded-full bg-[#46a65c]/[0.025] blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ============================================================
          DESKTOP / TABLET
          ============================================================ */}

      <div className="relative z-10 hidden min-h-screen w-full flex-col px-8 py-8 md:flex lg:px-12">
        {/* Header */}

        <header className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#111419]">
                <img
                  src="/mediq.svg"
                  alt="MediQ"
                  className="h-6 w-6"
                />
              </div>

              <div>
                <div className="text-xs font-semibold">
                  MediQ
                </div>

                <div className="text-[9px] text-white/25">
                  Mentorship
                </div>
              </div>
            </div>

            <div className="text-[10px] text-white/20">
              Getting Started
            </div>
          </div>

          <div className="mt-7">
            <OnboardingProgress
              currentIndex={currentIndex}
              total={sections.length}
              titles={sections.map(
                (section) => section.title
              )}
            />
          </div>
        </header>

        {/* Main */}

        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 items-stretch py-8">
          {/* Explanation sidebar */}

          <aside className="flex w-[300px] shrink-0 items-center pr-12">
            <div className="border-l border-white/[0.08] pl-6">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5aa9d8]/60">
                {String(currentIndex + 1).padStart(2, "0")}
              </p>

              <h2 className="text-xl font-semibold tracking-tight">
                {currentSection.title}
              </h2>

              <p className="mt-3 max-w-[220px] text-sm leading-6 text-white/35">
                We'll fill this area with section-specific
                explanations and annotations as we build
                each section.
              </p>
            </div>
          </aside>

          {/* Section */}

          <div className="flex min-h-0 min-w-0 flex-1 items-center">
            <div className="mx-auto flex h-full w-full max-w-3xl items-center">
              <CurrentSection key={currentSection.id} />
            </div>
          </div>
        </div>

        {/* Navigation */}

        <footer className="mx-auto w-full max-w-6xl">
          <div className="ml-[300px] flex max-w-3xl justify-end">
            <div className="w-full max-w-md">
              <OnboardingNavigation
                currentIndex={currentIndex}
                total={sections.length}
                onBack={goBack}
                onNext={goNext}
                onFinish={handleFinish}
                finishing={finishing}
              />
            </div>
          </div>
        </footer>
      </div>

      {/* ============================================================
          MOBILE
          ============================================================ */}

      <div
        className="relative z-10 flex min-h-screen w-full flex-col md:hidden"
        onClick={(event) => {
          const target = event.target as HTMLElement;

          if (target.closest("button")) {
            return;
          }

          const midpoint = window.innerWidth / 2;

          if (event.clientX < midpoint) {
            goBack();
          } else {
            goNext();
          }
        }}
      >
        {/* Progress */}

        <div className="px-4 pt-5">
          <OnboardingProgress
            currentIndex={currentIndex}
            total={sections.length}
            titles={sections.map(
              (section) => section.title
            )}
          />
        </div>

        {/* Header */}

        <div className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[#111419]">
              <img
                src="/mediq.svg"
                alt="MediQ"
                className="h-5 w-5"
              />
            </div>

            <span className="text-xs font-semibold">
              MediQ
            </span>
          </div>

          <span className="text-[10px] text-white/20">
            {currentIndex + 1} / {sections.length}
          </span>
        </div>

        {/* Section */}

        <div className="flex flex-1 items-center px-5">
          <div className="w-full">
            <CurrentSection key={currentSection.id} />
          </div>
        </div>

        {/* Mobile hint */}

        <div className="pb-3 text-center text-[9px] text-white/15">
          Tap left or right to navigate
        </div>

        {/* Navigation */}

        <div className="px-5 pb-6">
          <OnboardingNavigation
            currentIndex={currentIndex}
            total={sections.length}
            onBack={goBack}
            onNext={goNext}
            onFinish={handleFinish}
            finishing={finishing}
          />
        </div>
      </div>
    </main>
  );
}
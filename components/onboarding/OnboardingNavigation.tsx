"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

interface OnboardingNavigationProps {
  currentIndex: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
  finishing?: boolean;
}

export default function OnboardingNavigation({
  currentIndex,
  total,
  onBack,
  onNext,
  onFinish,
  finishing = false,
}: OnboardingNavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  return (
    <div className="flex items-center gap-3">
      {/* Back */}

      <button
        type="button"
        onClick={onBack}
        disabled={isFirst || finishing}
        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-sm font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white disabled:pointer-events-none disabled:opacity-20"
      >
        <ArrowLeft className="h-4 w-4" />

        <span className="hidden sm:inline">
          Back
        </span>
      </button>

      {/* Next / Finish */}

      <button
        type="button"
        onClick={isLast ? onFinish : onNext}
        disabled={finishing}
        className="group flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black transition hover:bg-white/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLast ? (
          <>
            {finishing ? "Setting things up..." : "Go to Dashboard"}

            {!finishing && (
              <Check className="h-4 w-4" />
            )}
          </>
        ) : (
          <>
            Continue

            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </div>
  );
}
"use client";

interface OnboardingProgressProps {
  currentIndex: number;
  total: number;
  titles: string[];
}

export default function OnboardingProgress({
  currentIndex,
  total,
  titles,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Mobile progress bars */}
      <div className="flex gap-1.5 md:hidden">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              index <= currentIndex
                ? "bg-[#1f71a1]"
                : "bg-white/[0.08]"
            }`}
          />
        ))}
      </div>

      {/* Desktop progress */}
      <div className="hidden items-center gap-3 md:flex">
        {titles.map((title, index) => (
          <div
            key={title}
            className="flex min-w-0 items-center gap-2"
          >
            <div
              className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#5aa9d8] shadow-[0_0_8px_rgba(90,169,216,0.5)]"
                  : index < currentIndex
                    ? "bg-[#1f71a1]"
                    : "bg-white/15"
              }`}
            />

            <span
              className={`truncate text-[10px] uppercase tracking-[0.12em] transition-colors ${
                index === currentIndex
                  ? "text-white/70"
                  : index < currentIndex
                    ? "text-white/35"
                    : "text-white/20"
              }`}
            >
              {title}
            </span>

            {index < total - 1 && (
              <div className="h-px w-4 shrink-0 bg-white/[0.07]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
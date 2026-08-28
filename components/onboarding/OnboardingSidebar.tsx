"use client";

import type { OnboardingAnnotation } from "./onboarding-sections";

interface OnboardingSidebarProps {
  annotations: OnboardingAnnotation[];
}

export default function OnboardingSidebar({
  annotations,
}: OnboardingSidebarProps) {
  return (
    <aside className="flex w-[300px] shrink-0 items-center pr-12">
      <div className="w-full border-l border-white/[0.08] pl-6">
        <div className="space-y-6">
          {annotations.map((annotation, index) => (
            <div
              key={`${annotation.label}-${index}`}
              className="relative"
            >
              {/* Small annotation marker */}

              <div className="absolute -left-[27px] top-[7px] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#5aa9d8]/50" />

              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5aa9d8]/60">
                {annotation.label}
              </p>

              <p className="mt-2 max-w-[220px] text-sm leading-6 text-white/35">
                {annotation.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
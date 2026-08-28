"use client";

import type { OnboardingAnnotation } from "./onboarding-sections";

interface OnboardingSidebarProps {
  annotation: OnboardingAnnotation;
}

export default function OnboardingSidebar({
  annotation,
}: OnboardingSidebarProps) {
  return (
    <aside className="flex w-[300px] shrink-0 items-center pr-12">
      <div className="border-l border-white/[0.08] pl-6">
        {annotation.eyebrow && (
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#5aa9d8]/60">
            {annotation.eyebrow}
          </p>
        )}

        <h2 className="text-xl font-semibold tracking-tight text-white">
          {annotation.title}
        </h2>

        <p className="mt-4 max-w-[220px] text-sm leading-6 text-white/35">
          {annotation.description}
        </p>
      </div>
    </aside>
  );
}
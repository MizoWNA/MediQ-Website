import type { ComponentType } from "react";

import WelcomeSection from "./sections/WelcomeSection";

export interface OnboardingAnnotation {
  eyebrow?: string;
  title: string;
  description: string;
}

export interface OnboardingSection {
  id: string;
  title: string;
  component: ComponentType;
  annotation: OnboardingAnnotation;
  voiceover?: string;
}

export const onboardingSections: OnboardingSection[] = [
  {
    id: "welcome",
    title: "Welcome",

    component: WelcomeSection,

    annotation: {
      eyebrow: "01 / Welcome",
      title: "Your new study workspace",
      description:
        "MediQ brings your mentor, study plan, tasks, and progress together in one place.",
    },

    // Add the voiceover file when it's ready.
    // voiceover: "/audio/onboarding/welcome.mp3",
  },
];
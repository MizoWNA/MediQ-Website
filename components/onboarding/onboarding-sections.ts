import type { ComponentType } from "react";

import WelcomeSection from "./sections/WelcomeSection";

export interface OnboardingAnnotation {
  label: string;
  text: string;
}

export interface OnboardingSection {
  id: string;
  title: string;
  component: ComponentType;
  annotations: OnboardingAnnotation[];
  voiceover?: string;
}

export const onboardingSections: OnboardingSection[] = [
  {
    id: "welcome",
    title: "Welcome",
    component: WelcomeSection,

    annotations: [
      {
        label: "Workspace",
        text: "Your central hub for everything MediQ.",
      },
      {
        label: "Mentorship",
        text: "Your mentor, resources, and guidance in one place.",
      },
      {
        label: "Progress",
        text: "See what you've done and what's coming next.",
      },
    ],

    // Add when the recording is ready:
    // voiceover: "/audio/onboarding/welcome.mp3",
  },
];
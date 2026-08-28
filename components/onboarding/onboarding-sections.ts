import type { ComponentType } from "react";

import WelcomeSection from "./sections/WelcomeSection";
import MentorSection from "./sections/MentorSection";

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
  {
    id: "mentor",
    title: "Your Mentor",
    component: MentorSection,
    annotations: [
      {
        label: "YOUR MENTOR",
        text: "Someone assigned specifically to support your journey through MediQ.",
      },
      {
        label: "GUIDANCE",
        text: "Get another perspective when you're unsure what to do next.",
      },
      {
        label: "ACCOUNTABILITY",
        text: "Turn your plans into goals you can actually follow through on.",
      },
    ],
  },
];
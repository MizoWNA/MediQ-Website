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
  annotations: OnboardingAnnotation[];
  component: ComponentType;
}

export const onboardingSections: OnboardingSection[] = [
  {
    id: "welcome",
    title: "Welcome",
    annotations: [
      {
        label: "Your Home",
        text: "MediQ brings your academic work, plans, and progress together in one place.",
      },
      {
        label: "Your Plan",
        text: "Your mentorship journey is built around what you need to work on next.",
      },
      {
        label: "Your Progress",
        text: "As you move through the program, MediQ keeps your progress visible.",
      },
    ],
    component: WelcomeSection,
  },

  {
    id: "mentor",
    title: "Your Mentor",
    annotations: [
      {
        label: "Someone in your corner",
        text: "Your mentor is here to help you navigate the program and make better decisions about your studies.",
      },
      {
        label: "Guidance",
        text: "Reach out when you're unsure what to prioritize, how to approach something, or what comes next.",
      },
      {
        label: "Accountability",
        text: "Your mentor can help turn plans into goals and keep you moving forward.",
      },
    ],
    component: MentorSection,
  },

  // Future sections go here.
];

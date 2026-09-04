import type { ComponentType } from "react";

import WelcomeSection from "./sections/WelcomeSection";
import MentorSection from "./sections/MentorSection";
import PlanSection from "./sections/PlanSection";
import DashboardSection from "./sections/DashboardSection";
import TaskSection from "./sections/TaskSection";
import ReadySection from "./sections/ReadySection";

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

  {
    id: "plan",
    title: "Your Plan",


    annotations: [
      {
        label: "The bigger picture",
        text: "Medical school is a lot to take on at once. MediQ helps break the workload into something more manageable.",
      },
      {
        label: "One step at a time",
        text: "Lectures, questions, and review become clear tasks you can work through without losing sight of the bigger goal.",
      },
      {
        label: "Daily progress",
        text: "Instead of wondering what to do next, you can focus on the next step and keep moving forward.",
      },
    ],

    component: PlanSection,


  },

  {
    id: "dashboard",
    title: "Your Dashboard",


    annotations: [
      {
        label: "Everything in one place",
        text: "Your dashboard gives you a clear view of what you're working toward and what needs your attention this week.",
      },
      {
        label: "Plan your week",
        text: "Your objectives and weekly schedule keep your study plan visible without overwhelming you with everything at once.",
      },
      {
        label: "Ready when you are",
        text: "When it's time to study, your tasks and focus tools are already waiting for you.",
      },
    ],

    component: DashboardSection,


  },

  {
    id: "tasks",
    title: "Make Progress",


    annotations: [
      {
        label: "Turn plans into action",
        text: "Your plan becomes a collection of clear tasks that you can work through one at a time.",
      },
      {
        label: "Track the work",
        text: "MCQ tasks can show your progress as you solve questions, so you always know how far you've come.",
      },
      {
        label: "Finish and move on",
        text: "Whether it's twenty questions or a simple review task, completing the work turns effort into visible progress.",
      },
    ],

    component: TaskSection,


  },

  { id: "ready", title: "You're Ready", annotations: [ { label: "Everything is set", text: "You now know where to find your mentor, your plan, your tasks, and your progress.", }, { label: "Start with today", text: "You don't need to figure everything out at once. Your plan will help guide what comes next.", }, { label: "One step at a time", text: "Keep showing up, keep making progress, and let MediQ help you along the way.", }, ], component: ReadySection, },
];

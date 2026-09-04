import type { ComponentType } from "react";

import WelcomeSection from "./sections/WelcomeSection";
import MentorSection from "./sections/MentorSection";
import PlanSection from "./sections/PlanSection";
import DashboardSection from './sections/DashboardSection';
import TaskSection from "./sections/TaskSection";

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
component: DashboardSection,
},

{
id: "dashboard",
title: "Your Dashboard",
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
component: TaskSection,
},
];

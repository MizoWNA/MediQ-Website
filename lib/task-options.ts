export const SUBJECT_OPTIONS = [
  {
    value: "anatomy",
    label: "Anatomy",
    color: {
      card: "bg-sky-500/10 border-sky-500/20",
      dot: "bg-sky-400",
      text: "text-sky-300",
    },
  },
  {
    value: "physiology",
    label: "Physiology",
    color: {
      card: "bg-rose-500/10 border-rose-500/20",
      dot: "bg-rose-400",
      text: "text-rose-300",
    },
  },

{
    value: "biochemisty",
    label: "Biochemistry",
    color: {
      card: "bg-amber-500/10 border-amber-500/20",
      dot: "bg-amber-400",
      text: "text-amber-300",
    },
  },

  {
    value: "histology",
    label: "Histology",
    color: {
      card: "bg-emerald-500/10 border-emerald-500/20",
      dot: "bg-emerald-400",
      text: "text-emerald-300",
    },
  },
] as const;

export const TASK_TYPE_OPTIONS = [
  { value: "lecture", label: "Lecture" },
  { value: "revision", label: "Revision" },
  { value: "practical", label: "Practical" },
  { value: "tutorial", label: "Tutorial" },
  { value: "exam", label: "Exam" },
  { value: "assignment", label: "Assignment" },
] as const;

export type SubjectOption =
  (typeof SUBJECT_OPTIONS)[number];

export type TaskTypeOption =
  (typeof TASK_TYPE_OPTIONS)[number];

export const DEFAULT_SUBJECT_COLOR = {
  card: "bg-white/[0.025] border-white/[0.08]",
  dot: "bg-white/40",
  text: "text-white/50",
};

export function getSubjectOption(
  subject: string | null
) {
  if (!subject) return null;

  const normalized = subject.toLowerCase();

  return (
    SUBJECT_OPTIONS.find(
      (option) =>
        option.value === normalized
    ) ?? null
  );
}
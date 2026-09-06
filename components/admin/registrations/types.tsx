export type RegistrationStatus = "pending" | "confirmed" | "cancelled";

export type Registration = {
  id: string;
  registration_code: string;
  full_name: string;
  university: string | null;
  academic_year: number;
  phone_number: string | null;
  email: string | null;
  plan: string;
  base_price: number;
  affiliate_code: string | null;
  discount_percent: number;
  discount_amount: number;
  final_price: number;
  status: RegistrationStatus;
  created_at: string;
  paid_at: string | null;
  paid_by: string | null;
  profile_id: string | null;
};

export type Mentor = {
  id: string;
  username: string | null;
  display_name: string | null;
};

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

export function formatPrice(value: number) {
  return `EGP ${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}

export function statusLabel(status: RegistrationStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function statusClass(status: RegistrationStatus) {
  return status === "confirmed" ? "text-emerald-300 bg-emerald-400/10" : status === "cancelled" ? "text-red-300 bg-red-400/10" : "text-amber-300 bg-amber-400/10";
}

export function getYearLabel(year: number) {
  return year === 1 ? "1st Year" : year === 2 ? "2nd Year" : year === 3 ? "3rd Year" : `${year}th Year`;
}

export type RegistrationQuestionAnswer = {
  question_id: string;
  category: string;
  question: string;
  translation: string | null;
  sort_order: number;
  answer: number | null;
};

export type QuestionnaireResponse = {
  registration_id: string;
  answers: RegistrationQuestionAnswer[];
};

export type CategoryScore = {
  category: string;
  score: number | null;
  answered: number;
  total: number;
};


export function InfoItem({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[10px] uppercase tracking-[0.14em] text-white/30">{label}</div><div className="mt-1 text-sm text-white/80">{value || "—"}</div></div>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><h2 className="mb-5 text-sm font-semibold text-white">{title}</h2>{children}</section>;
}

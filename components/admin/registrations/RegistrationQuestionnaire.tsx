"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { CategoryScore, QuestionnaireResponse, RegistrationQuestionAnswer } from "./types";

type Props = { registrationId: string };

function groupQuestions(answers: RegistrationQuestionAnswer[]) {
  return answers.reduce<Record<string, RegistrationQuestionAnswer[]>>((groups, answer) => {
    (groups[answer.category] ??= []).push(answer);
    return groups;
  }, {});
}

function calculateScores(answers: RegistrationQuestionAnswer[]): CategoryScore[] {
  return Object.entries(groupQuestions(answers)).map(([category, questions]) => {
    const answered = questions.filter((question) => question.answer !== null);
    return {
      category,
      score: answered.length ? answered.reduce((sum, question) => sum + (question.answer ?? 0), 0) / answered.length : null,
      answered: answered.length,
      total: questions.length,
    };
  });
}

function AnswerRating({ answer }: { answer: number | null }) {
  return (
    <div className="flex items-center gap-2" aria-label={answer === null ? "Unanswered" : `Answer ${answer} out of 5`}>
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((value) => (
          <span key={value} className={`flex size-6 items-center justify-center rounded-full border text-[11px] font-medium ${answer === value ? "border-sky-300 bg-sky-300 text-slate-950" : "border-white/10 text-white/35"}`}>
            {value}
          </span>
        ))}
      </div>
      <span className="text-xs text-white/45">{answer === null ? "Unanswered" : ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][answer - 1]}</span>
    </div>
  );
}

export default function RegistrationQuestionnaire({ registrationId }: Props) {
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const accessToken = (await supabase.auth.getSession()).data.session?.access_token;
      if (!accessToken) throw new Error("Your admin session has expired. Please log in again.");
      const result = await fetch(`/api/admin/registrations/${registrationId}/questionnaire`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
      const data = await result.json();
      if (!result.ok) throw new Error(data?.error || "Failed to load questionnaire.");
      setResponse(data as QuestionnaireResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load questionnaire.");
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => { void load(); }, [load]);

  const scores = useMemo(() => calculateScores(response?.answers ?? []), [response]);
  const answeredCount = response?.answers.filter((answer) => answer.answer !== null).length ?? 0;
  const totalCount = response?.answers.length ?? 0;
  const overall = answeredCount ? (response?.answers.reduce((sum, answer) => sum + (answer.answer ?? 0), 0) ?? 0) / answeredCount : null;
  const groups = useMemo(() => groupQuestions(response?.answers ?? []), [response]);

  if (loading) return <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><div className="flex items-center gap-2 text-sm text-white/50"><Loader2 className="animate-spin" size={15} /> Loading mentor assessment</div></section>;
  if (error) return <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5"><div className="flex items-center gap-2 text-sm text-red-200"><AlertCircle size={15} /> {error}</div></section>;
  if (!response || !totalCount) return <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><h2 className="text-sm font-semibold">Mentor assessment</h2><p className="mt-2 text-sm text-white/40">No active questionnaire questions are available.</p></section>;

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-col gap-1"><h2 className="text-sm font-semibold">Mentor assessment</h2><p className="text-xs text-white/40">Objective questionnaire results on a 1–5 scale.</p></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.9fr)_1.1fr]">
        <div className="min-h-64 rounded-xl border border-white/[0.06] bg-black/10 p-3">
          <ResponsiveContainer width="100%" height={280}><RadarChart data={scores.filter((item) => item.score !== null).map((item) => ({ category: item.category, score: item.score as number }))} cx="50%" cy="50%" outerRadius="68%">
            <PolarGrid stroke="rgba(255,255,255,0.12)" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 9 }} axisLine={false} />
            <Radar name="Score" dataKey="score" stroke="#5eead4" fill="#14b8a6" fillOpacity={0.26} strokeWidth={2} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} / 5`, "Score"]} contentStyle={{ background: "#111820", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "white" }} />
          </RadarChart></ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-white/[0.06] p-4"><div className="flex items-end justify-between border-b border-white/[0.07] pb-4"><div><div className="text-[10px] uppercase tracking-[0.14em] text-white/35">Overall assessment</div><div className="mt-2 text-3xl font-semibold">{overall === null ? "—" : overall.toFixed(1)} <span className="text-sm font-normal text-white/35">/ 5</span></div></div><div className="text-right text-xs text-white/40">{answeredCount} of {totalCount} answered</div></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{scores.map((item) => <div key={item.category} className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-white/60">{item.category}</span><span className="font-mono text-white/85">{item.score === null ? "—" : item.score.toFixed(1)}</span></div>)}</div></div>
      </div>
      <div className="mt-8"><h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Questionnaire responses</h3><div className="mt-4 grid gap-5">{Object.entries(groups).map(([category, questions]) => <div key={category} className="rounded-xl border border-white/[0.06] p-4"><div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3"><h4 className="text-sm font-semibold">{category}</h4><span className="text-xs text-white/35">{questions.filter((question) => question.answer !== null).length} of {questions.length} answered</span></div><div className="mt-3 grid gap-4">{questions.sort((a, b) => a.sort_order - b.sort_order).map((question) => <div key={question.question_id} className="grid gap-2"><p className="text-sm leading-6 text-white/80">{question.question}</p>{question.translation && <p dir="rtl" className="text-sm leading-6 text-white/45">{question.translation}</p>}<AnswerRating answer={question.answer} /></div>)}</div></div>)}</div></div>
    </section>
  );
}

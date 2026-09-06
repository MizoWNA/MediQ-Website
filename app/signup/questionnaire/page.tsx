"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface RegistrationQuestion {
  id: string;
  category: string;
  question: string;
  translation: string | null;
  sort_order: number;
}

interface RegistrationAnswer {
  question_id: string;
  answer: number;
}

const ANSWER_OPTIONS = [
  {
    value: 1,
    label: "Strongly disagree",
  },
  {
    value: 2,
    label: "Disagree",
  },
  {
    value: 3,
    label: "Neutral",
  },
  {
    value: 4,
    label: "Agree",
  },
  {
    value: 5,
    label: "Strongly agree",
  },
];

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const registrationId =
    searchParams.get("registration_id");

  const [questions, setQuestions] = useState<
    RegistrationQuestion[]
  >([]);

  const [answers, setAnswers] = useState<
    Record<string, number>
  >({});

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ================================================================
   * FETCH QUESTIONS
   * ================================================================
   */

  const fetchQuestions =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/registrations/questionnaire",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load the questionnaire."
          );
        }

        if (
          !Array.isArray(data?.questions)
        ) {
          throw new Error(
            "The questionnaire data is invalid."
          );
        }

        setQuestions(data.questions);
      } catch (err) {
        console.error(
          "Questionnaire loading failed:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading the questionnaire."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /*
   * ================================================================
   * CURRENT QUESTION
   * ================================================================
   */

  const currentQuestion =
    questions[currentIndex];

  const currentAnswer =
    currentQuestion
      ? answers[currentQuestion.id]
      : undefined;

  const isLastQuestion =
    currentIndex ===
    questions.length - 1;

  const answeredCount =
    Object.keys(answers).length;

  const progress =
    questions.length > 0
      ? ((currentIndex + 1) /
          questions.length) *
        100
      : 0;

  const allQuestionsAnswered =
    questions.length > 0 &&
    questions.every(
      (question) =>
        answers[question.id] !==
        undefined
    );

  /*
   * ================================================================
   * ANSWER SELECTION
   * ================================================================
   */

  function handleAnswer(
    value: number
  ) {
    if (!currentQuestion) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: value,
    }));

    setError("");
  }

  /*
   * ================================================================
   * NAVIGATION
   * ================================================================
   */

  function handleNext() {
    if (!currentQuestion) return;

    if (currentAnswer === undefined) {
      setError(
        "Please select an answer before continuing."
      );
      return;
    }

    setError("");

    if (!isLastQuestion) {
      setCurrentIndex(
        (previous) => previous + 1
      );
    }
  }

  function handleBack() {
    if (currentIndex === 0) return;

    setError("");

    setCurrentIndex(
      (previous) => previous - 1
    );
  }

  /*
   * ================================================================
   * SUBMIT QUESTIONNAIRE
   * ================================================================
   */

  async function handleSubmit() {
    if (submitting) return;

    if (!registrationId) {
      setError(
        "Your registration could not be identified. Please return to registration and try again."
      );
      return;
    }

    if (!allQuestionsAnswered) {
      setError(
        "Please answer all questions before completing the questionnaire."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formattedAnswers: RegistrationAnswer[] =
        questions.map((question) => ({
          question_id: question.id,
          answer: answers[question.id],
        }));

      const response = await fetch(
        "/api/registrations/questionnaire",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            registration_id:
              registrationId,
            answers: formattedAnswers,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to submit the questionnaire."
        );
      }

      /*
       * The questionnaire is complete.
       *
       * The completion page will display the
       * registration/payment card.
       */

      router.push(
        `/signup/complete?registration_id=${encodeURIComponent(
          registrationId
        )}`
      );
    } catch (err) {
      console.error(
        "Questionnaire submission failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your questionnaire."
      );

      setSubmitting(false);
    }
  }

  /*
   * ================================================================
   * INVALID REGISTRATION
   * ================================================================
   */

  if (!registrationId) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 py-10 text-white">
        <Background />

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.04]">
            <CheckCircle2 className="h-6 w-6 text-red-300/60" />
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/25">
            Registration
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Registration not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/35">
            We couldn't identify your
            registration. Please return to the
            registration page and try again.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/signup")
            }
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Return to registration
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * LOADING
   * ================================================================
   */

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 py-10 text-white">
        <Background />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]">
            <Loader2 className="h-5 w-5 animate-spin text-[#5aa9d8]" />
          </div>

          <p className="mt-5 text-xs text-white/30">
            Preparing your questionnaire...
          </p>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * QUESTION LOAD ERROR
   * ================================================================
   */

  if (error && questions.length === 0) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 py-10 text-white">
        <Background />

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.04]">
            <span className="text-lg text-red-300/60">
              !
            </span>
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-red-300/50">
            Something went wrong
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            We couldn't load the questionnaire
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/35">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchQuestions}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * EMPTY QUESTIONNAIRE
   * ================================================================
   */

  if (!currentQuestion) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 py-10 text-white">
        <Background />

        <div className="relative z-10 w-full max-w-md text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/25">
            Questionnaire
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            No questions available
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/35">
            The questionnaire is currently
            unavailable. Please try again later.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ================================================================
   * QUESTIONNAIRE
   * ================================================================
   */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0d10] px-5 py-8 text-white sm:px-8 sm:py-10">
      <Background />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl items-center justify-center">
        <div className="w-full">
          {/* ======================================================
              HEADER
              ====================================================== */}

          <header className="mb-8 text-center sm:mb-10">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]">
              <img
                src="/mediq.svg"
                alt="MediQ"
                className="h-7 w-7"
              />
            </div>

            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#5aa9d8]/60">
              MediQ Mentorship
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Help us understand you.
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/30">
              A few questions will help your
              mentor understand how you
              currently approach your studies.
            </p>
          </header>

          {/* ======================================================
              PROGRESS
              ====================================================== */}

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/25">
                Question{" "}
                {currentIndex + 1} of{" "}
                {questions.length}
              </p>

              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#5aa9d8]/60">
                {answeredCount} answered
              </p>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-[#5aa9d8]/70 transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* ======================================================
              QUESTION CARD
              ====================================================== */}

          <section className="rounded-2xl border border-white/[0.07] bg-[#111419]/90 shadow-2xl shadow-black/20">
            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {/* Category */}

              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#5aa9d8]/60">
                {currentQuestion.category}
              </p>

              {/* Question */}

              <div className="mt-5">
                <h2 className="text-xl font-medium leading-8 tracking-[-0.02em] text-white/90 sm:text-2xl sm:leading-9">
                  {currentQuestion.question}
                </h2>

                {currentQuestion.translation && (
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-5 border-t border-white/[0.06] pt-5 text-right text-sm leading-7 text-white/35"
                  >
                    {currentQuestion.translation}
                  </p>
                )}
              </div>

              {/* Answer options */}

              <div className="mt-8 space-y-2.5">
                {ANSWER_OPTIONS.map(
                  (option) => {
                    const selected =
                      currentAnswer ===
                      option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleAnswer(
                            option.value
                          )
                        }
                        className={`group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-150 ${
                          selected
                            ? "border-[#5aa9d8]/35 bg-[#5aa9d8]/[0.07]"
                            : "border-white/[0.06] bg-white/[0.012] hover:border-white/[0.12] hover:bg-white/[0.025]"
                        }`}
                      >
                        {/* Radio */}

                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                            selected
                              ? "border-[#5aa9d8] bg-[#5aa9d8]"
                              : "border-white/15 bg-transparent group-hover:border-white/25"
                          }`}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#0b0d10]" />
                          )}
                        </span>

                        <span
                          className={`text-sm transition-colors ${
                            selected
                              ? "text-white/85"
                              : "text-white/45 group-hover:text-white/65"
                          }`}
                        >
                          {
                            option.label
                          }
                        </span>

                        <span
                          className={`ml-auto text-[9px] font-medium ${
                            selected
                              ? "text-[#5aa9d8]/70"
                              : "text-white/10"
                          }`}
                        >
                          {
                            option.value
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* ====================================================
                ERROR
                ==================================================== */}

            {error && (
              <div className="border-t border-red-400/10 bg-red-400/[0.025] px-5 py-3.5 sm:px-8">
                <p className="text-[11px] leading-5 text-red-300/70">
                  {error}
                </p>
              </div>
            )}

            {/* ====================================================
                NAVIGATION
                ==================================================== */}

            <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={
                  currentIndex === 0 ||
                  submitting
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-medium text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/60 disabled:pointer-events-none disabled:opacity-20"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    currentAnswer ===
                      undefined
                  }
                  className="group inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black transition-all hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.07)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete questionnaire
                      <Check className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    submitting
                  }
                  className="group inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-medium text-black transition-all hover:bg-white/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.07)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </section>

          {/* ======================================================
              FOOTER
              ====================================================== */}

          <footer className="py-6 text-center">
            <p className="text-[9px] leading-5 text-white/15">
              Your answers help us better
              understand how to support you.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={null}>
      <QuestionnaireContent />
    </Suspense>
  );
}

/*
 * ================================================================
 * BACKGROUND
 * ================================================================
 */

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-[20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1f71a1]/[0.035] blur-[150px]" />

      <div className="absolute bottom-[-200px] right-[-150px] h-[450px] w-[450px] rounded-full bg-[#46a65c]/[0.025] blur-[120px]" />

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

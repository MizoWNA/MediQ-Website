"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Tag,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

interface RegistrationResult {
  registration_id: string;
  registration_code: string;
  full_name: string;
  university: string;
  academic_year: number;
  phone_number: string;
  plan: string;
  base_price: number;
  affiliate_code: string | null;
  discount_percent: number;
  discount_amount: number;
  final_price: number;
  status: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(price);
}

function CompletionContent() {
  const searchParams =
    useSearchParams();

  const registrationId =
    searchParams.get(
      "registration_id"
    );

  const [registration, setRegistration] =
    useState<RegistrationResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    if (!registrationId) {
      setError(
        "No registration ID was provided."
      );
      setLoading(false);
      return;
    }

    async function loadRegistration() {
      try {
        const response = await fetch(
          `/api/registrations/${encodeURIComponent(
            registrationId
          )}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load your registration."
          );
        }

        if (
          !data?.registration
        ) {
          throw new Error(
            "Registration data was not found."
          );
        }

        setRegistration(
          data.registration as RegistrationResult
        );
      } catch (err) {
        console.error(
          "Failed to load completion registration:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading your registration."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRegistration();
  }, [registrationId]);

  async function copyRegistrationCode() {
    if (!registration) return;

    try {
      await navigator.clipboard.writeText(
        registration.registration_code
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard access can fail in restricted browsers.
    }
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 text-white">
        <Background />

        <div className="relative z-10 flex items-center gap-3 text-sm text-white/35">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your registration...
        </div>
      </main>
    );
  }

  if (error || !registration) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 text-white">
        <Background />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl border border-red-400/10 bg-[#111419]/90 p-7 text-center shadow-2xl shadow-black/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.04]">
              <CheckCircle2 className="h-6 w-6 text-red-300/60" />
            </div>

            <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.2em] text-red-300/50">
              Something went wrong
            </p>

            <h1 className="mt-2 text-xl font-semibold">
              We couldn't load your registration
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/35">
              {error ||
                "Your registration could not be found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0d10] px-5 py-10 text-white sm:px-8">
      <Background />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
        <div className="w-full">
          {/* Header */}

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]">
              <CheckCircle2 className="h-7 w-7 text-[#5aa9d8]" />
            </div>

            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#5aa9d8]/60">
              Registration complete
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              You're almost there.
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/30">
              Your registration has been
              received. Complete your
              payment to finish joining
              the mentorship.
            </p>
          </div>

          {/* Registration card */}

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111419]/90 shadow-2xl shadow-black/20">
            {/* Registration code */}

            <div className="border-b border-white/[0.06] px-6 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/25">
                    Registration
                  </p>

                  <p className="mt-1 text-lg font-semibold tracking-tight">
                    {
                      registration.registration_code
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    copyRegistrationCode
                  }
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 text-[10px] text-white/35 transition-colors hover:bg-white/[0.05] hover:text-white/60"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Details */}

            <div className="space-y-5 px-6 py-6 sm:px-7">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Detail
                  label="Full name"
                  value={
                    registration.full_name
                  }
                />

                <Detail
                  label="University"
                  value={
                    registration.university
                  }
                />

                <Detail
                  label="Academic year"
                  value={`Year ${registration.academic_year}`}
                />

                <Detail
                  label="Phone number"
                  value={
                    registration.phone_number
                  }
                />
              </div>

              <div className="border-t border-white/[0.06] pt-5">
                <Detail
                  label="Selected plan"
                  value={`Year ${registration.academic_year} · ${registration.plan}`}
                />
              </div>

              {/* Pricing */}

              <div className="border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/30">
                    Original price
                  </span>

                  <span className="text-white/60">
                    {formatPrice(
                      registration.base_price
                    )}{" "}
                    EGP
                  </span>
                </div>

                {registration.affiliate_code && (
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/30">
                      <Tag className="h-3.5 w-3.5" />

                      {
                        registration.affiliate_code
                      }{" "}
                      ·{" "}
                      {
                        registration.discount_percent
                      }
                      % off
                    </span>

                    <span className="text-[#5aa9d8]">
                      −
                      {formatPrice(
                        registration.discount_amount
                      )}{" "}
                      EGP
                    </span>
                  </div>
                )}

                <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-5">
                  <span className="text-sm font-medium text-white/60">
                    Total
                  </span>

                  <span className="text-2xl font-semibold tracking-tight">
                    {formatPrice(
                      registration.final_price
                    )}{" "}
                    <span className="text-sm font-normal text-white/30">
                      EGP
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Payment instructions */}

            <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-5 sm:px-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5aa9d8]/60">
                Final step
              </p>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Screenshot this card and
                send it to{" "}
                <span className="font-semibold text-white">
                  010 3366 3583
                </span>{" "}
                on WhatsApp to pay.
              </p>

              <a
                href="https://wa.me/201033663583"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/20"
              >
                <span>
                  💬 Chat on WhatsApp
                </span>

                <span aria-hidden="true">
                  →
                </span>
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-[9px] leading-5 text-white/15">
            Keep your registration code
            somewhere safe. You may need
            it when communicating with the
            MediQ team.
          </p>
        </div>
      </div>
    </main>
  );
}

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-[35%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.045] blur-[140px]" />

      <div className="absolute bottom-[-220px] right-[-150px] h-[450px] w-[450px] rounded-full bg-[#46a65c]/[0.025] blur-[120px]" />

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

interface DetailProps {
  label: string;
  value: string;
}

function Detail({
  label,
  value,
}: DetailProps) {
  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/20">
        {label}
      </p>

      <p className="mt-1.5 text-sm text-white/65">
        {value}
      </p>
    </div>
  );
}

function CompletionPageFallback() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-5 text-white">
      <Background />

      <div className="relative z-10 flex items-center gap-3 text-sm text-white/35">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    </main>
  );
}

export default function CompletionPage() {
  return (
    <Suspense
      fallback={
        <CompletionPageFallback />
      }
    >
      <CompletionContent />
    </Suspense>
  );
}
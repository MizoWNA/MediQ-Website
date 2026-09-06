"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
ArrowRight,
Check,
CheckCircle2,
ChevronDown,
Copy,
Loader2,
Tag,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
REGISTRATION_PLANS,
type RegistrationPlan,
} from "@/lib/registration-plans";
import { useRouter } from "next/navigation";


interface RegistrationResult {
  registration_id: string;
  registration_code: string;
  full_name: string;
  university: string;
  academic_year: number;
  phone_number: string;
  email: string | null;
  plan: string;
  base_price: number;
  affiliate_code: string | null;
  discount_percent: number;
  discount_amount: number;
  final_price: number;
  status: string;
}

interface AffiliatePreview {
valid: boolean;
discount_percent: number;
}

const ACADEMIC_YEARS = Object.keys(REGISTRATION_PLANS)
.map(Number)
.sort((a, b) => a - b);

function formatPrice(price: number) {
return new Intl.NumberFormat("en-US").format(price);
}

export default function SignupPage() {
const [fullName, setFullName] = useState("");
const [university, setUniversity] = useState("");
const [academicYear, setAcademicYear] = useState<number | "">("");
const [phoneNumber, setPhoneNumber] = useState("");
const [email, setEmail] = useState("");
const router = useRouter();

const [selectedPlan, setSelectedPlan] =
useState<RegistrationPlan | null>(null);

const [affiliateCode, setAffiliateCode] = useState("");

const [affiliatePreview, setAffiliatePreview] =
useState<AffiliatePreview | null>(null);

const [checkingAffiliate, setCheckingAffiliate] =
useState(false);

const [result, setResult] =
useState<RegistrationResult | null>(null);

const [submitting, setSubmitting] =
useState(false);

const [error, setError] =
useState("");

const [copied, setCopied] =
useState(false);

const availablePlans = useMemo(() => {
if (!academicYear) return [];


return REGISTRATION_PLANS[academicYear] ?? [];

}, [academicYear]);

const selectedPrice =
selectedPlan?.price ?? 0;

/*

* ================================================================
* LIVE AFFILIATE CODE CHECK
* ================================================================
  */

useEffect(() => {
const code = affiliateCode.trim();

/*
 * Empty code means:
 * - no lookup
 * - no discount
 * - no loading state
 */

if (!code) {
  setAffiliatePreview(null);
  setCheckingAffiliate(false);
  return;
}

setCheckingAffiliate(true);

const timer = window.setTimeout(
  async () => {
    try {
      const { data, error: rpcError } =
        await supabase.rpc(
          "check_affiliate_code",
          {
            p_code: code,
          }
        );

      if (rpcError) {
        throw rpcError;
      }

      if (!data) {
        setAffiliatePreview(null);
        return;
      }

      setAffiliatePreview(
        data as AffiliatePreview
      );
    } catch (err) {
      console.error(
        "Affiliate code check failed:",
        err
      );

      /*
       * Don't punish the user for a temporary
       * preview lookup failure.
       *
       * The actual registration RPC will still
       * validate the code when submitted.
       */

      setAffiliatePreview(null);
    } finally {
      setCheckingAffiliate(false);
    }
  },
  350
);

return () => {
  window.clearTimeout(timer);
};

}, [affiliateCode]);

/*

* ================================================================
* LIVE PRICE CALCULATION
* ================================================================
  */

const previewDiscountPercent =
affiliatePreview?.valid
? affiliatePreview.discount_percent
: 0;

const previewDiscountAmount =
Math.round(
selectedPrice *
(previewDiscountPercent / 100) *
100
) / 100;

const previewFinalPrice =
Math.round(
(selectedPrice -
previewDiscountAmount) *
100
) / 100;

/*

* ================================================================
* INPUT HANDLERS
* ================================================================
  */

function handleAcademicYearChange(
value: string
) {
const year = value
? Number(value)
: "";


setAcademicYear(year);
setSelectedPlan(null);
setAffiliatePreview(null);
setError("");

}

function handlePlanSelect(
plan: RegistrationPlan
) {
setSelectedPlan(plan);
setError("");
}

/*

* ================================================================
* SUBMIT
* ================================================================
  */

async function handleSubmit(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();

if (submitting) return;

setError("");

if (!fullName.trim()) {
  setError(
    "Please enter your full name."
  );
  return;
}

if (!university.trim()) {
  setError(
    "Please enter your university."
  );
  return;
}

if (!academicYear) {
  setError(
    "Please select your academic year."
  );
  return;
}

if (!phoneNumber.trim()) {
  setError(
    "Please enter your phone number."
  );
  return;
}

if (!selectedPlan) {
  setError(
    "Please select a plan."
  );
  return;
}

setSubmitting(true);

try {
  const { data, error: rpcError } =
    await supabase.rpc(
      "create_registration",
      {
        p_full_name:
          fullName.trim(),

        p_university:
          university.trim(),

        p_academic_year:
          academicYear,

        p_phone_number:
          phoneNumber.trim(),

        p_email:
          email.trim() || null,

        p_plan:
          selectedPlan.name,

        p_affiliate_code:
          affiliateCode.trim() || null,
      }
    );

  if (rpcError) {
    throw rpcError;
  }

  if (!data) {
    throw new Error(
      "No registration data was returned."
    );
  }

  const registration =
    data as RegistrationResult;

  router.push(
    `/signup/questionnaire?registration_id=${encodeURIComponent(
      registration.registration_id
    )}`
  );

} catch (err) {
  console.error(
    "Registration failed:",
    err
  );

  setError(
    err instanceof Error
      ? err.message
      : "Something went wrong while creating your registration."
  );
} finally {
  setSubmitting(false);
}


}

/*

* ================================================================
* COPY REGISTRATION CODE
* ================================================================
  */

async function copyRegistrationCode() {
if (!result) return;


try {
  await navigator.clipboard.writeText(
    result.registration_code
  );

  setCopied(true);

  window.setTimeout(() => {
    setCopied(false);
  }, 1800);
} catch {
  // Clipboard access can fail in restricted browsers.
}


}

/*

* ================================================================
* SUCCESS
* ================================================================
  */

if (result) {
return ( <main className="relative min-h-screen overflow-hidden bg-[#0b0d10] px-5 py-10 text-white sm:px-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute left-1/2 top-[35%] h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1f71a1]/[0.045] blur-[140px]" />


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

    <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl items-center justify-center">
      <div className="w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]">
            <CheckCircle2 className="h-7 w-7 text-[#5aa9d8]" />
          </div>

          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#5aa9d8]/60">
            Registration received
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            You're almost there.
          </h1>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111419]/90 shadow-2xl shadow-black/20">
          <div className="border-b border-white/[0.06] px-6 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/25">
                  Registration
                </p>

                <p className="mt-1 text-lg font-semibold tracking-tight">
                  {result.registration_code}
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

          <div className="space-y-5 px-6 py-6 sm:px-7">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail
                label="Full name"
                value={result.full_name}
              />

              <Detail
                label="University"
                value={result.university}
              />

              <Detail
                label="Academic year"
                value={`Year ${result.academic_year}`}
              />

              <Detail
                label="Phone number"
                value={
                  result.phone_number
                }
              />
            </div>

            <div className="border-t border-white/[0.06] pt-5">
              <Detail
                label="Selected plan"
                value={`Year ${result.academic_year} · ${result.plan}`}
              />
            </div>

            <div className="border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/30">
                  Original price
                </span>

                <span className="text-white/60">
                  {formatPrice(
                    result.base_price
                  )}{" "}
                  EGP
                </span>
              </div>

              {result.affiliate_code && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-white/30">
                    <Tag className="h-3.5 w-3.5" />

                    {result.affiliate_code} ·{" "}
                    {
                      result.discount_percent
                    }
                    % off
                  </span>

                  <span className="text-[#5aa9d8]">
                    −
                    {formatPrice(
                      result.discount_amount
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
                    result.final_price
                  )}{" "}
                  <span className="text-sm font-normal text-white/30">
                    EGP
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] bg-white/[0.015] px-6 py-5 sm:px-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5aa9d8]/60">
              Next step
            </p>

            <p className="mt-2 text-sm leading-6 text-white/40">
            Screenshot this card and send it to {" "}
            <span className="font-semibold text-white"> 010 3366 3583</span> on whatsapp to pay.
            <a
              href="https://wa.me/201033663583"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
            >
              <span>💬 Chat on WhatsApp</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </p>
          </div>
        </div>
      </div>
    </div>
  </main>
);


}

/*

* ================================================================
* REGISTRATION FORM
* ================================================================
  */

return ( <main className="relative min-h-screen overflow-hidden bg-[#0b0d10] px-5 py-10 text-white sm:px-8"> <div className="pointer-events-none absolute inset-0"> <div className="absolute left-1/2 top-[20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#1f71a1]/[0.035] blur-[150px]" />


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

  <div className="relative z-10 mx-auto w-full max-w-2xl">
    <header className="mb-10 text-center">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]">
        <img
          src="/mediq.svg"
          alt="MediQ"
          className="h-7 w-7"
        />
      </div>

      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/25">
        MediQ Mentorship
      </p>

      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
        Join the mentorship.
      </h1>

      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/35">
        Tell us a little about yourself,
        choose your plan, and we'll
        prepare your registration.
      </p>
    </header>

    <form onSubmit={handleSubmit}>
      {/* ========================================================
          PERSONAL INFORMATION
          ======================================================== */}

      <section className="rounded-2xl border border-white/[0.07] bg-[#111419]/80 p-5 sm:p-7">
        <div className="mb-6">
          <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#5aa9d8]/60">
            Step 01
          </p>

          <h2 className="mt-1 text-lg font-semibold">
            Your information
          </h2>
        </div>

        <div className="space-y-5">
          <Field
            label="Full name"
            value={fullName}
            onChange={setFullName}
            placeholder="Your full name"
            required
          />

          <Field
            label="University"
            value={university}
            onChange={setUniversity}
            placeholder="Your university"
            required
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="academic-year"
                className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/35"
              >
                Academic year
              </label>

              <div className="relative">
                <select
                  id="academic-year"
                  value={academicYear}
                  onChange={(event) =>
                    handleAcademicYearChange(
                      event.target.value
                    )
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0b0d10] px-3.5 pr-10 text-sm text-white outline-none transition-colors focus:border-[#5aa9d8]/40"
                  required
                >
                  <option
                    value=""
                    disabled
                  >
                    Select year
                  </option>

                  {ACADEMIC_YEARS.map(
                    (year) => (
                      <option
                        key={year}
                        value={year}
                      >
                        Year {year}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              </div>
            </div>

            <Field
              label="Phone number"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="01XXXXXXXXX"
              type="tel"
              required
            />
          </div>

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            type="email"
            hint="Optional"
          />
        </div>
      </section>

      {/* ========================================================
          PLANS
          ======================================================== */}

      {academicYear && (
        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#111419]/80 p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#5aa9d8]/60">
              Step 02
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Choose your plan
            </h2>

            <p className="mt-1.5 text-xs text-white/25">
              Year {academicYear} plans
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {availablePlans.map(
              (plan) => {
                const selected =
                  selectedPlan?.name ===
                  plan.name;

                return (
                  <button
                    key={plan.name}
                    type="button"
                    onClick={() =>
                      handlePlanSelect(
                        plan
                      )
                    }
                    className={`group relative rounded-xl border p-5 text-left transition-all duration-200 ${
                      selected
                        ? "border-[#5aa9d8]/40 bg-[#5aa9d8]/[0.06] shadow-[0_0_30px_rgba(90,169,216,0.05)]"
                        : "border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white/75">
                          {
                            plan.name
                          }
                        </p>

                        <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                          {formatPrice(
                            plan.price
                          )}

                          <span className="ml-1.5 text-xs font-normal text-white/25">
                            EGP
                          </span>
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                          selected
                            ? "border-[#5aa9d8] bg-[#5aa9d8]"
                            : "border-white/15 bg-transparent"
                        }`}
                      >
                        {selected && (
                          <Check className="h-3 w-3 text-[#0b0d10]" />
                        )}
                      </div>
                    </div>

                    {selected && (
                      <div className="mt-4 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[#5aa9d8]/70">
                        Selected
                      </div>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          AFFILIATE + TOTAL
          ======================================================== */}

      {selectedPlan && (
        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#111419]/80 p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-[#5aa9d8]/60">
              Step 03
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Review your registration
            </h2>
          </div>

          <div>
            <label
              htmlFor="affiliate-code"
              className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/35"
            >
              Affiliate code

              <span className="ml-2 text-white/15">
                Optional
              </span>
            </label>

            <div className="relative">
              <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/15" />

              <input
                id="affiliate-code"
                value={affiliateCode}
                onChange={(event) =>
                  setAffiliateCode(
                    event.target.value.toUpperCase()
                  )
                }
                placeholder="Enter your code"
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#0b0d10] pl-10 pr-10 text-sm uppercase tracking-wide text-white outline-none transition-colors placeholder:text-white/15 focus:border-[#5aa9d8]/40"
              />

              {checkingAffiliate && (
                <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-white/20" />
              )}
            </div>

            {/* Affiliate status */}

            {affiliateCode.trim() &&
              !checkingAffiliate &&
              affiliatePreview?.valid && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#5aa9d8]/70">
                  <Check className="h-3 w-3" />

                  {affiliatePreview.discount_percent}% discount applied
                </div>
              )}

            {affiliateCode.trim() &&
              !checkingAffiliate &&
              affiliatePreview &&
              !affiliatePreview.valid && (
                <p className="mt-2 text-[10px] text-white/25">
                  Code not recognized.
                </p>
              )}
          </div>

          {/* Price summary */}

          <div className="mt-7 border-t border-white/[0.06] pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  {selectedPlan.name}
                </p>

                <p className="mt-1 text-[10px] text-white/20">
                  Year {academicYear}
                </p>
              </div>

              <p className="text-lg font-semibold">
                {formatPrice(
                  selectedPrice
                )}{" "}
                <span className="text-xs font-normal text-white/25">
                  EGP
                </span>
              </p>
            </div>

            {previewDiscountPercent >
              0 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-white/30">
                  <Tag className="h-3.5 w-3.5" />

                  Affiliate discount ·{" "}
                  {
                    previewDiscountPercent
                  }
                  %
                </span>

                <span className="text-[#5aa9d8]">
                  −
                  {formatPrice(
                    previewDiscountAmount
                  )}{" "}
                  EGP
                </span>
              </div>
            )}

            <div className="mt-5 flex items-end justify-between border-t border-white/[0.06] pt-5">
              <span className="text-sm font-medium text-white/60">
                Total
              </span>

              <div className="text-right">
                {previewDiscountPercent >
                  0 && (
                  <p className="mb-1 text-xs text-white/20 line-through">
                    {formatPrice(
                      selectedPrice
                    )}{" "}
                    EGP
                  </p>
                )}

                <p className="text-2xl font-semibold tracking-tight">
                  {formatPrice(
                    previewFinalPrice
                  )}{" "}
                  <span className="text-sm font-normal text-white/30">
                    EGP
                  </span>
                </p>
              </div>
            </div>

            {previewDiscountPercent >
              0 && (
              <div className="mt-4 rounded-xl border border-[#5aa9d8]/10 bg-[#5aa9d8]/[0.025] px-4 py-3">
                <p className="text-[10px] leading-5 text-[#5aa9d8]/60">
                  Your {previewDiscountPercent}%
                  affiliate discount has
                  been applied.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Error */}

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3">
          <p className="text-xs leading-5 text-red-300/70">
            {error}
          </p>
        </div>
      )}

      {/* Submit */}

      {selectedPlan && (
        <div className="mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-black transition-all duration-200 hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating registration...
              </>
            ) : (
              <>
                Confirm registration
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <p className="mt-4 text-center text-[9px] leading-5 text-white/15">
            Your registration details will
            be securely saved and assigned
            a unique registration code.
          </p>
        </div>
      )}
    </form>

    <footer className="py-8 text-center">
      <p className="text-[9px] text-white/15">
        MediQ Mentorship
      </p>
    </footer>
  </div>
</main>

);
}

/*

* ================================================================
* SMALL COMPONENTS
* ================================================================
  */

interface FieldProps {
label: string;
value: string;
onChange: (value: string) => void;
placeholder: string;
type?: string;
required?: boolean;
hint?: string;
}

function Field({
label,
value,
onChange,
placeholder,
type = "text",
required = false,
hint,
}: FieldProps) {
return ( <div> <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">
{label}

    {hint && (
      <span className="ml-2 text-white/15">
        {hint}
      </span>
    )}
  </label>

  <input
    type={type}
    value={value}
    onChange={(event) =>
      onChange(event.target.value)
    }
    placeholder={placeholder}
    required={required}
    className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#0b0d10] px-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/15 focus:border-[#5aa9d8]/40"
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
return ( <div> <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/20">
{label} </p>

  <p className="mt-1.5 text-sm text-white/65">
    {value}
  </p>
</div>

);
}

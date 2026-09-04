"use client";

import { useState } from "react";
import {
  Phone,
  ShieldCheck,
  ArrowUpRight,
  UserRound,
} from "lucide-react";

export interface Mentor {
  username: string | null;
  name: string;
  year: number | null;
  phone: string | null;
}

interface MentorSectionProps {
  mentor?: Mentor | null;
}

function getInitials(name: string) {
  const cleaned = name
    .replace(/^Dr\.?\s*/i, "")
    .trim();

  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase();
}

function formatYear(year: number | null) {
  if (!year || year < 1 || year > 5) {
    return null;
  }

  const suffix =
    year === 1
      ? "st"
      : year === 2
        ? "nd"
        : year === 3
          ? "rd"
          : "th";

  return `${year}${suffix} Year`;
}

export default function MentorSection({
  mentor,
}: MentorSectionProps) {
  const [avatarError, setAvatarError] = useState(false);

  /*
   * No mentor assigned yet.
   */

  if (!mentor) {
    return (
      <section className="relative flex h-full w-full items-center px-4 py-8 text-white sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#111419]">
              <UserRound className="h-6 w-6 text-white/25" />
            </div>

            <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
              Your mentor
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Your mentor is coming soon.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/40 sm:text-base">
              You haven't been assigned a mentor yet.
              Once one is assigned, their details and
              contact information will appear here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const initials = getInitials(mentor.name);

  const avatarSrc = mentor.username
    ? `/avatars/${mentor.username}.png`
    : null;

  const academicYear = formatYear(mentor.year);

  return (
    <section className="relative flex h-full w-full items-center px-4 py-8 text-white sm:px-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex w-full flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-14">

          {/* ======================================================
              MENTOR CARD
              ====================================================== */}

          <div className="flex w-full shrink-0 justify-center lg:w-[260px] lg:justify-start">
            <div className="relative w-full max-w-[260px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111419]/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm">

              {/* Glow */}

              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#1f71a1]/[0.07] blur-3xl" />

              {/* Card header */}

              <div className="relative mb-5 flex items-center justify-between">
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/25">
                  Your Mentor
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5aa9d8]/70" />

                  <span className="text-[8px] uppercase tracking-[0.14em] text-white/20">
                    Assigned
                  </span>
                </div>
              </div>

              {/* Avatar */}

              <div className="relative mb-5 flex justify-center">
                <div className="absolute h-28 w-28 rounded-full bg-[#1f71a1]/[0.08] blur-2xl" />

                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/[0.1] bg-[#181c21]">
                  {avatarSrc && !avatarError ? (
                    <img
                      src={avatarSrc}
                      alt={mentor.name}
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-semibold tracking-tight text-white/40">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Identity */}

              <div className="relative text-center">
                <h3 className="text-base font-semibold tracking-tight text-white">
                  {mentor.name}
                </h3>

                <p className="mt-1 text-[10px] text-white/30">
                  Your Mentor
                </p>

                {academicYear && (
                  <p className="mt-0.5 text-[9px] text-white/20">
                    {academicYear}
                  </p>
                )}
              </div>

              {/* Contact */}

              {mentor.phone && (
                <div className="relative mt-5 border-t border-white/[0.06] pt-4">
                  <a
                    href={`tel:${mentor.phone}`}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                      <Phone className="h-3.5 w-3.5 text-[#5aa9d8]/70" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] uppercase tracking-[0.14em] text-white/20">
                        Phone
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-white/55">
                        {mentor.phone}
                      </p>
                    </div>

                    <ArrowUpRight className="h-3 w-3 shrink-0 text-white/15 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================
              EXPLANATION
              ====================================================== */}

          <div className="min-w-0 flex-1 text-center lg:text-left">

            {/* Eyebrow */}

            <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
              <span className="h-px w-6 bg-[#5aa9d8]/40" />

              <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-[#5aa9d8]/60">
                Someone in your corner
              </span>
            </div>

            {/* Heading */}

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              Meet your mentor.
            </h1>

            {/* Description */}

            <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/40 sm:text-base lg:mx-0">
              Your mentor is here to help you make
              sense of your progress, plan what
              comes next, and give you someone to
              turn to when you need guidance.
            </p>

            {/* Highlights */}

            <div className="mx-auto mt-7 max-w-md space-y-4 lg:mx-0">

              {/* Guidance */}

              <div className="flex items-start gap-3 text-left">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#5aa9d8]/60" />
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                    Guidance
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/25">
                    Get another perspective when
                    you're unsure what to do next.
                  </p>
                </div>
              </div>

              {/* Accountability */}

              <div className="flex items-start gap-3 text-left">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
                  <span className="text-[10px] font-semibold text-[#5aa9d8]/60">
                    01
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                    Accountability
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-white/25">
                    Turn your plans into goals you
                    can actually follow through on.
                  </p>
                </div>
              </div>
            </div>

            {/* Connection visual */}

            <div className="relative mx-auto mt-8 hidden h-12 w-full max-w-[320px] sm:block lg:mx-0">
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/[0.05]" />

              <div className="absolute left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-2.5 w-2.5 rounded-full border border-[#5aa9d8]/40 bg-[#0b0d10]" />
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-[#111419]">
                  <span className="text-[8px] font-semibold text-white/35">
                    YOU
                  </span>
                </div>
              </div>

              <div className="absolute right-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-2.5 w-2.5 rounded-full border border-[#5aa9d8]/40 bg-[#0b0d10]" />
              </div>

              <span className="absolute left-[6%] top-0 text-[8px] uppercase tracking-[0.15em] text-white/15">
                Plan
              </span>

              <span className="absolute right-[2%] top-0 text-[8px] uppercase tracking-[0.15em] text-white/15">
                Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

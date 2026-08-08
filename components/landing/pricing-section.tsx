"use client";

import { Check } from "lucide-react";

// Toggle the seasonal Summer plan on/off.
const SHOW_SUMMER_PLAN = true;

const plans = [
  {
    name: "Basic",
    description: "For those wanting to test it out.",
    price: 350,
    period: "week",
    features: [
      "Daily Study Plan",
      "Weekly Mock Exams",
      "Private Groups for Mentees",
      "Early Access to MediQ Data",
      "Personal Daily Call",
    ],
    cta: "Sign Up Now",
    popular: false,
  },
  {
    name: "Gold",
    description: "For those who want the best offer.",
    price: 1050,
    period: "month",
    features: [
      "Daily Study Plan",
      "Weekly Mock Exams",
      "Private Groups for Mentees",
      "Early Access to MediQ Data",
      "Personal Daily Call",
      "Weekly Group Discussions",
      "Mentorship Competitions & Prizes",
    ],
    cta: "Sign Up Now",
    popular: true,
  },
  {
    name: "Summer",
    description: "For those who need extra help.",
    price: 1500,
    period: "module",
    features: [
      "Everything in Gold",
      "Module Data",
      "Previous Exams / Mocks",
      "Daily Level Assessments",
      "Special Follow-up Group",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const visiblePlans = SHOW_SUMMER_PLAN
    ? plans
    : plans.filter((plan) => plan.name !== "Summer");

  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
              }}
            />

            <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              MediQ Mentorship
            </span>

            <span
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--mediq-green), var(--mediq-blue))",
              }}
            />
          </div>

          <h2 className="text-5xl lg:text-7xl font-display leading-[0.95] tracking-tight mb-6">
            Mentorship
            <br />
            pricing
          </h2>

          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            We offer competitive pricing compared to everyone else.
          </p>

          <p className="text-sm font-mono text-muted-foreground mt-4">
            Still not sure? Try the Weekly Plan.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid gap-px bg-foreground/10 ${
            visiblePlans.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3"
          }`}
        >
          {visiblePlans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-7 sm:p-8 lg:p-12 bg-background transition-all duration-300 ${
                plan.popular
                  ? "md:-my-4 md:py-12 lg:py-16"
                  : ""
              }`}
              style={
                plan.popular
                  ? {
                      borderTop:
                        "2px solid var(--mediq-blue)",
                      borderBottom:
                        "2px solid var(--mediq-green)",
                    }
                  : undefined
              }
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span
                  className="absolute -top-3 left-8 px-3 py-1 text-xs font-mono uppercase tracking-widest text-white"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                  }}
                >
                  Most Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {plan.popular && (
                    <span
                      className="text-[10px] font-mono uppercase tracking-widest"
                      style={{
                        color: "var(--mediq-blue)",
                      }}
                    >
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-display text-3xl text-foreground mt-2">
                  {plan.name}
                </h3>

                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-foreground/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl text-[#1f71a1]">
                    £ {plan.price}
                  </span>

                  <span className="text-muted-foreground">
                    /{plan.period}
                  </span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3"
                  >
                    <Check
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{
                        color:
                          featureIndex % 2 === 0
                            ? "var(--mediq-blue)"
                            : "var(--mediq-green)",
                      }}
                    />

                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full h-12 px-6 rounded-full text-sm font-medium transition-all duration-300 ${
                  plan.popular
                    ? "text-white hover:opacity-90"
                    : "border border-foreground/15 text-foreground hover:border-foreground/30 hover:bg-foreground/[0.03]"
                }`}
                style={
                  plan.popular
                    ? {
                        background:
                          "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                      }
                    : undefined
                }
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          If you have any questions or suggestions,{" "}
          <a
            href="https://www.instagram.com/mediq26_/"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Send us a DM
          </a>
        </p>
      </div>
    </section>
  );
}
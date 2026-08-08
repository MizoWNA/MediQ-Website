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
    name: "Monthly",
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
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            MediQ Mentorship
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            Mentorship
            <br />
            <span className="text-stroke">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            We offer competitive pricing compared to everyone else.
          <br />
            Still not sure? Try the Weekly Plan.
          </p>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid gap-px bg-foreground/10 ${
            visiblePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
          }`}
        >
          {visiblePlans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-12 bg-background ${
                plan.popular ? "md:-my-4 md:py-12 lg:py-16 border-2 border-[#46a65c]" : ""
              }`}
            >
              {plan.popular && (
<span className="absolute -top-3 left-8 px-3 py-1 bg-[#46a65c] text-white text-xs font-mono uppercase tracking-widest">                  Most Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                                <span
                  className={`font-mono text-xs ${
                    plan.popular ? "text-[#46a65c]" : "text-[#1f71a1]"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl text-foreground mt-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-foreground/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl text-[#1f71a1]">
                    £ {plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                  <Check
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      plan.popular ? "text-[#46a65c]" : "text-[#1f71a1]"
                    }`}
                  />                    
                  <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          If you have any questions or suggestions,{" "}
          <a href="https://www.instagram.com/mediq26_/" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Send us a DM
          </a>
        </p>
      </div>
    </section>
  );
}

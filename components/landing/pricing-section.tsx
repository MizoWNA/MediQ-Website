import { ArrowRight, Check } from "lucide-react";

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
    cta: "Start free",
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
    cta: "Start trial",
    popular: true,
  },
  {
    name: "Summer",
    description: "For those who need extra help.",
    price: 1500,
    period: "module",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
      "Security audit",
      "Custom contracts",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Pricing
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            Simple, transparent
            <br />
            <span className="text-stroke">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Start free and scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-foreground/10">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-12 bg-background ${
                plan.popular ? "md:-my-4 md:py-12 lg:py-16 border-2 border-foreground" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-foreground text-primary-foreground text-xs font-mono uppercase tracking-widest">
                  Most Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl text-foreground mt-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-foreground/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl lg:text-6xl text-foreground">
                    £ {plan.price}
                  </span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                  plan.popular
                    ? "bg-foreground text-primary-foreground hover:bg-foreground/90"
                    : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include automatic updates, HTTPS, and DDoS protection.{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Compare all features
          </a>
        </p>
      </div>
    </section>
  );
}

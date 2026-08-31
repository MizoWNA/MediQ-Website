import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
{ name: "Features", href: "#features" },
{ name: "Media", href: "#how-it-works" },
{ name: "Reviews", href: "#testamonials" },
{ name: "Pricing", href: "#pricing" },
{ name: "Us", href: "#infrastructure" },
{ name: "Contact", href: "#footer" },
];

export function Navigation() {
return ( <header className="fixed top-0 left-0 right-0 z-[60]"> <nav className="relative z-[60] mx-auto max-w-[1400px] bg-transparent"> <div className="flex h-20 items-center justify-between px-6 lg:px-8">
{/* Logo */}
<Link
href="/"
className="text-2xl tracking-tight"
style={{ fontFamily: "MediQLogo, sans-serif" }}
>
MediQ </Link>

      {/* Desktop Navigation */}
      <div className="hidden items-center gap-12 md:flex">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="group relative text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground"
          >
            {link.name}

            <span
              className="absolute -bottom-1 left-0 h-px w-0 transition-all duration-300 group-hover:w-full"
              style={{
                background:
                  "linear-gradient(90deg, #1f71a1, #46a65c)",
              }}
            />
          </a>
        ))}
      </div>

      {/* Desktop Actions */}
      <div className="hidden items-center gap-3 md:flex">
        <Link
          href="/login"
          className="text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground"
        >
          Log In
        </Link>

        <Link href="/signup">
          <Button
            size="sm"
            className="rounded-full bg-foreground px-6 text-background transition-all duration-300 hover:bg-foreground/90"
            style={{
              boxShadow:
                "0 0 0 1px rgba(31,113,161,0.35), 0 0 0 2px rgba(70,166,92,0.15)",
            }}
          >
            Sign Up
          </Button>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <details className="group md:hidden">
        <summary
          className="flex cursor-pointer list-none items-center justify-center p-2"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6 group-open:hidden" />
          <X className="hidden h-6 w-6 group-open:block" />
        </summary>

        {/* Mobile Menu */}
        <div className="fixed inset-0 z-[-1] bg-background">
          {/* Subtle MediQ background mark */}
          <div className="pointer-events-none absolute right-[-30px] top-1/2 -translate-y-1/2 select-none font-display text-[18rem] leading-none opacity-[0.025]">
            M
          </div>

          <div className="relative z-10 flex h-full flex-col px-8 pb-8 pt-28">
            {/* Navigation Links */}
            <div className="flex flex-1 flex-col justify-center gap-6">
              {navLinks.map((link, i) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`group flex items-baseline gap-4 text-[clamp(2.5rem,10vw,4rem)] font-display leading-none transition-colors duration-300 ${
                    i % 2 === 0
                      ? "hover:text-[#1f71a1]"
                      : "hover:text-[#46a65c]"
                  }`}
                >
                  {/* Number */}
                  <span
                    className={`shrink-0 font-mono text-xs ${
                      i % 2 === 0
                        ? "text-[#1f71a1]/50"
                        : "text-[#46a65c]/50"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Link name */}
                  <span className="transition-transform duration-300 group-hover:translate-x-2">
                    {link.name}
                  </span>
                </a>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-foreground/10 pt-8">
              <div className="grid grid-cols-2 gap-3">
                {/* Log In */}
                <Link
                  href="/login"
                  className="flex h-16 flex-col items-center justify-center rounded-2xl border border-[#1f71a1]/20 bg-[#1f71a1]/[0.04] transition-all duration-300 hover:border-[#1f71a1]/40 hover:bg-[#1f71a1]/[0.09]"
                >
                  <span className="text-sm font-medium">
                    Log In
                  </span>

                  <span className="mt-1 font-mono text-[10px] text-muted-foreground">
                    MENTORSHIP
                  </span>
                </Link>

                {/* Sign Up */}
                <Link
                  href="/signup"
                  className="flex h-16 flex-col items-center justify-center rounded-2xl bg-foreground text-background transition-all duration-300 hover:bg-foreground/90"
                >
                  <span className="text-sm font-medium">
                    Sign Up
                  </span>

                  <span className="mt-1 font-mono text-[10px] text-background/50">
                    JOIN MEDIQ
                  </span>
                </Link>
              </div>

              {/* Tiny footer identity */}
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">
                  MEDIQ™
                </span>

                <span className="font-mono text-[10px] text-muted-foreground">
                  MEDICAL • EDUCATION • COMMUNITY
                </span>
              </div>
            </div>
          </div>
        </div>
      </details>
    </div>
  </nav>
</header>

);
}

"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedTetrahedron } from "./animated-tetrahedron";

// Set the destination URLs for the CTA buttons below.
const MENTORSHIP_URL = "#";
const JOIN_TEAM_URL = "#";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section id={"contact"} ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-foreground transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight effect */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0,0,0,0.15), transparent 40%)`
            }}
          />
          
          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-row items-center gap-2 sm:gap-4">
              {/* Left content */}
              <div className="flex-1">
                <h2 className="text-4xl lg:text-7xl font-display tracking-tight mb-8 leading-[0.95]">
                  Ready to become
                  <br />
                  something great?
                </h2>

                <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-xl">
                  Join the Hundred doctors that rely on MediQ
                  <br />
                  for their studies and plans.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  
                  <Button
                    size="lg"
                    className="relative overflow-hidden bg-foreground text-background hover:text-white px-4 sm:px-8 h-11 sm:h-14 text-xs sm:text-base rounded-full group whitespace-nowrap border-0"
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(31,113,161,0.4), 0 0 0 2px rgba(70,166,92,0.18)",
                    }}
                    onClick={() =>
                      window.open(
                        "https://forms.gle/18KshEMPAuw6mUAc6",
                        "_blank"
                      )
                    }
                  >
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                      }}
                    />

                    <span className="relative z-10 flex items-center">
                      Apply for Mentorship
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>

                  <Button
                  size="lg"
                  variant="outline"
                  className="h-11 sm:h-14 px-4 sm:px-8 text-xs sm:text-base rounded-full whitespace-nowrap transition-all duration-300"
                  style={{
                    borderColor: "color-mix(in srgb, var(--mediq-green) 35%, transparent)",
                    color: "var(--mediq-green)",
                  }}
                  onClick={() =>
                    window.open(
                      "https://forms.gle/6eYVutPqRsydLHQf6",
                      "_blank"
                    )
                  }
                >
                  Join our Team
                </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-8 font-mono">
                  Only click "Join our Team" If you wish to be a Mentor or Designer.
                  <br />
                  Your application might not be accepted.
                </p>
              </div>

              {/* Right animation */}
              <div className="hidden lg:flex items-center justify-center w-[500px] h-[500px] -mr-16">
                <AnimatedTetrahedron />
              </div>
            </div>
          </div>

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-foreground/10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r border-foreground/10" />
        </div>
      </div>
    </section>
  );
}

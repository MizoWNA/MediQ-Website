"use client";

import { useEffect, useRef, useState } from "react";

// Set a custom thumbnail (`image`) and destination (`link`) for each step below.
const steps = [
  {
    number: "I",
    title: "Medicine Aside, ",
    description: "We sit down with your favorite professors and ask them interesting questions about life, medicine, and occasionally football!",
    image: "/media/step-1.png",
    link: "https://www.youtube.com/watch?v=OhS_e5ZPXHc",
  },
  {
    number: "II",
    title: "Media Project 2",
    description: "C'mon Team, we should have more variety in our media productions.",
    image: "/media/step-2.png",
    link: "#",
  },
  {
    number: "III",
    title: "Media Project 3",
    description: "Once we actually work on something new, it'll go here. Until then, I'm just a pretty placeholder!",
    image: "/media/step-3.png",
    link: "#",
  },
];

export function HowItWorksSection() {
  const BLUE = "#1f71a1";
  const GREEN = "#46a65c";
  
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

useEffect(() => {
  const timer = setTimeout(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, 5000);

  return () => clearTimeout(timer);
}, [activeStep]);
  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal lines pattern */}
     <div
  className="absolute inset-0 pointer-events-none"
  style={{
    backgroundImage: `
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 40px,
        ${BLUE}18 40px,
        ${BLUE}18 41px,
        transparent 41px,
        transparent 80px,
        ${GREEN}18 80px,
        ${GREEN}18 81px
      )
    `,
  }}
/>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
          <span
            className="w-8 h-px"
            style={{
              background: `linear-gradient(90deg, ${BLUE}, ${GREEN})`,
            }}
          />
            MediQ Media
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Seen our Media Productions?
            <br />
            <span className="text-background/50">Check them out below!</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${
                  activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
<span
  className="font-display text-3xl transition-colors duration-300"
  style={{
    color:
      activeStep === index
        ? index % 2 === 0
          ? BLUE
          : GREEN
        : "rgba(255,255,255,0.3)",
  }}
>
  {step.number}
</span>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {step.title}
                    </h3>
                    <p className="text-background/60 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Progress indicator */}
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-background/20 overflow-hidden">
                        <div
                          className="h-full w-0"
                          style={{
                            backgroundColor: index % 2 === 0 ? BLUE : GREEN,
                            animation: "progress 5s linear forwards",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Thumbnail display */}
          <div className="lg:sticky lg:top-32 self-start">
            <a
              key={activeStep}
              href={steps[activeStep].link}
              className="thumbnail-reveal group block border border-background/10 overflow-hidden aspect-video relative"
            >
              <img
                src={steps[activeStep].image || "/placeholder.svg"}
                alt={steps[activeStep].title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span
  className="inline-flex items-center gap-2 text-sm font-mono text-background px-4 py-2 backdrop-blur-sm"
  style={{
    border: `1px solid ${
      activeStep % 2 === 0 ? `${BLUE}99` : `${GREEN}99`
    }`,
  }}
>
                  Watch
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .thumbnail-reveal {
          opacity: 0;
          transform: scale(0.98);
          filter: blur(6px);
          animation: thumbnailReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes thumbnailReveal {
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}

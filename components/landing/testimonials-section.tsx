"use client";

import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    quote:
      "You were so helpful, you cant even imagine! On the days i couldn't get anything done you helped me find where to start!",
    author: "Anonymous",
    role: "1st Year",
    company: "Kasr Al Ainy",
    metric: "Motivation Boosted 10X",
  },
  {
    quote:
      "The month i spent in the Mentorship has probably been the most productive month of my life, I got more studying done in that month than in a year!",
    author: "Anonymous",
    role: "1st Year",
    company: "Kasr Al Ainy",
    metric: "40% More Lectures Studied",
  },
  {
    quote:
      "Your support and time-management skills have boosted my confidence in myself to a level i didn't think was possible... Thank you.",
    author: "Anonymous",
    role: "3rd Year",
    company: "Badr University",
    metric: "Full Revision in 1 Week",
  },
  {
    quote:
      "The courses I took with you guys saved my *** from failing, I don't know what i would've done without you.",
    author: "Anonymous",
    role: "1st Year",
    company: "Memphis University",
    metric: "Passed Year 1",
  },
  {
    quote:
      "Thanks to you, I jumped from barely passing in 101 and 102, to getting an Excelent in 104! I never thought i'd be an A Student before.",
    author: "Anonymous",
    role: "2nd Year",
    company: "",
    metric: "Grade Jump from 65% to 83%",
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeTestimonial = (index: number) => {
    if (index === activeIndex) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsAnimating(true);

    timeoutRef.current = setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
    }, 300);
  };

  // Autoplay timer.
  // Because activeIndex is included in the dependency array,
  // changing the testimonial also resets the 5-second timer.
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => {
      clearInterval(interval);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeIndex]);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section id="testamonials" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="flex items-center justify-between mb-12 lg:mb-16">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
              }}
            />

            <span className="text-sm font-mono tracking-widest uppercase text-muted-foreground">
              What people say
            </span>
          </div>

          <span className="font-mono text-xs text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main Quote */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-300 ${
                isAnimating
                  ? "opacity-0 translate-y-4"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <p className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground">
                "{activeTestimonial.quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div
              className={`mt-12 flex items-center gap-6 transition-all duration-300 delay-100 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                className="w-16 h-16 rounded-full border flex items-center justify-center"
                style={{
                  borderColor: "color-mix(in srgb, var(--mediq-blue) 25%, transparent)",
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--mediq-blue) 8%, transparent), color-mix(in srgb, var(--mediq-green) 8%, transparent))",
                }}
              >
                <span className="font-display text-2xl text-foreground">
                  {activeTestimonial.author.charAt(0)}
                </span>
              </div>

              <div>
                <p className="text-lg font-medium text-foreground">
                  {activeTestimonial.author}
                </p>

                {activeTestimonial.company ? (
                  <p className="text-muted-foreground">
                    {activeTestimonial.role}, {activeTestimonial.company}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {activeTestimonial.role}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Metric Highlight */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              className={`p-8 border transition-all duration-300 ${
                isAnimating
                  ? "opacity-0 scale-95"
                  : "opacity-100 scale-100"
              }`}
              style={{
                borderColor:
                  "color-mix(in srgb, var(--mediq-blue) 18%, transparent)",
              }}
            >
              <span
                className="font-mono text-xs tracking-widest uppercase block mb-4"
                style={{
                  color: "var(--mediq-blue)",
                }}
              >
                Key Result
              </span>

              <p className="font-display text-3xl md:text-4xl text-foreground">
                {activeTestimonial.metric}
              </p>

              {/* Small accent */}
              <div
                className="mt-6 h-px w-16"
                style={{
                  background:
                    "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                }}
              />
            </div>

            {/* Navigation Dots */}
            <div className="flex gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changeTestimonial(idx)}
                  aria-label={`View testimonial ${idx + 1}`}
                  className={`h-2 transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8"
                      : "w-2 hover:w-4"
                  }`}
                  style={{
                    background:
                      idx === activeIndex
                        ? "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))"
                        : "color-mix(in srgb, currentColor 20%, transparent)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Company Logos Marquee Label */}
        <div className="mt-24 pt-12 border-t border-foreground/10">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-8 text-center">
            Trusted by Professors & Institutions All Across Cairo
          </p>
        </div>
      </div>

      {/* Full-width marquee */}
      <div className="w-full overflow-hidden">
        <div className="flex gap-16 items-center marquee">
          {[...Array(2)].map((_, setIdx) => (
            <div
              key={setIdx}
              className="flex gap-16 items-center shrink-0"
            >
              {[
                "Dr. Ahmed Galal",
                "Pulse Team",
                "Badr University",
                "Kasr Al Ainy",
                "Dr. Ziad Nasser",
                "Dr. Shehab",
                "Vitals Team",
              ].map((company) => (
                <span
                  key={`${setIdx}-${company}`}
                  className="font-display text-xl md:text-2xl text-foreground/30 whitespace-nowrap transition-colors duration-300 hover:text-foreground"
                >
                  {company}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
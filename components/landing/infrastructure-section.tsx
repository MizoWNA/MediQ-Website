
"use client";

import { useEffect, useState, useRef } from "react";

const locations = [
  {
    city: "Dr. Ahmed Alsharkawy",
    region: "Social Media Head & Mentor",
    latency: "Internship",
  },
  {
    city: "Dr. Nour Farouk",
    region: "External Relations Head & Mentor",
    latency: "Internship",
  },
  {
    city: "Dr. Hassan Okasha",
    region: "CEO & Mentor",
    latency: "5th Year",
  },
  {
    city: "Dr. Ahmed Khaled",
    region: "Mentor",
    latency: "5th Year",
  },
  {
    city: "Dr. Hazem Alsaadani",
    region: "Mentor",
    latency: "5th Year",
  },
  {
    city: "Dr. Nour Abozeid",
    region: "Designer & Mentor",
    latency: "4th Year",
  },
  {
    city: "Dr. Yousef Mohammed",
    region: "Designer & Mentor",
    latency: "4th Year",
  },
  {
    city: "Dr. Nouran Khaled",
    region: "Designer & Mentor",
    latency: "4th Year",
  },
  {
    city: "Dr. Moataz Alsharkawy",
    region: "Designer & Technology Head",
    latency: "2nd Year",
  },
  {
    city: "Dr. Jana Ahmed",
    region: "Designer",
    latency: "2nd Year",
  },
  {
    city: "Dr. Khaled Abdelmeniem",
    region: "Media Productions Head",
    latency: "2nd Year",
  },
];

export function InfrastructureSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeLocation, setActiveLocation] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

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
    const interval = setInterval(() => {
      setActiveLocation((prev) => (prev + 1) % locations.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
<section
  id="infrastructure"
  ref={sectionRef}
  className="relative py-32 lg:py-40"
>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* =========================================
              Left: Content
              ========================================= */}

          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
          >
            {/* Eyebrow */}

            <div className="flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span
                className="w-6 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                }}
              />

              <span>MediQ Team</span>
            </div>

            {/* Heading */}

            <h2 className="text-5xl lg:text-7xl font-display leading-[0.95] tracking-tight mb-8">
              Meet Our
              <br />
              <span>Team.</span>
            </h2>

            {/* Description */}

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl mb-12">
              A team of specialists in their respective fields came together
              under one question; In what way can we help the future?
            </p>

            {/* =========================================
                Stats
                ========================================= */}

            <div className="grid grid-cols-3 gap-8">
              {/* Mentors */}

              <div>
                <div
                  className="text-4xl lg:text-5xl font-display mb-2"
                  style={{
                    color: "var(--mediq-blue)",
                  }}
                >
                  8
                </div>

                <div className="text-sm text-muted-foreground">
                  Mentors
                </div>
              </div>

              {/* Students */}

              <div>
                <div
                  className="text-4xl lg:text-5xl font-display mb-2"
                  style={{
                    color: "var(--mediq-green)",
                  }}
                >
                  100
                </div>

                <div className="text-sm text-muted-foreground">
                  Students in Program
                </div>
              </div>

              {/* Grade */}

              <div>
                <div className="text-4xl lg:text-5xl font-display mb-2">
                  90%
                </div>

                <div className="text-sm text-muted-foreground">
                  Average In-Program Student Grade
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              Right: Member list
              ========================================= */}

          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
          >
            <div className="relative border border-foreground/10">
              {/* =========================================
                  Accent line
                  ========================================= */}

              <div
                className="absolute top-0 left-0 w-1/3 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                }}
              />

              {/* =========================================
                  Header
                  ========================================= */}

              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">
                  List of Members
                </span>

                {/* All Ready */}

                <span
                  className="flex items-center gap-2 text-xs font-mono"
                  style={{
                    color: "var(--mediq-green)",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{
                      backgroundColor: "var(--mediq-green)",
                      boxShadow: "0 0 10px var(--mediq-green)",
                    }}
                  />

                  All Ready
                </span>
              </div>

              {/* =========================================
                  Locations
                  ========================================= */}

              <div>
                {locations.map((location, index) => {
                  const isActive = activeLocation === index;
                  const isBlue = index % 2 === 0;

                  return (
                    <div
                      key={location.city}
                      className={`px-6 py-5 border-b border-foreground/5 last:border-b-0 flex items-center justify-between transition-all duration-300 ${
                        isActive ? "bg-foreground/[0.02]" : ""
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? isBlue
                            ? "color-mix(in srgb, var(--mediq-blue) 4%, transparent)"
                            : "color-mix(in srgb, var(--mediq-green) 4%, transparent)"
                          : "transparent",
                      }}
                    >
                      {/* Member info */}

                      <div className="flex items-center gap-4">
                        {/* Status dot */}

                        <span
                          className="w-2 h-2 rounded-full transition-all duration-500 shrink-0"
                          style={{
                            backgroundColor: isActive
                              ? isBlue
                                ? "var(--mediq-blue)"
                                : "var(--mediq-green)"
                              : "color-mix(in srgb, currentColor 20%, transparent)",

                            boxShadow: isActive
                              ? isBlue
                                ? "0 0 12px var(--mediq-blue)"
                                : "0 0 12px var(--mediq-green)"
                              : "none",
                          }}
                        />

                        <div>
                          <div className="font-medium">
                            {location.city}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {location.region}
                          </div>
                        </div>
                      </div>

                      {/* Year / status */}

                      <span className="font-mono text-sm text-muted-foreground">
                        {location.latency}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

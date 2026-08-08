"use client";

import { useEffect, useState, useRef } from "react";
import {
  MessageCircleMore,
  Camera,
  Send,
} from "lucide-react";

const securityFeatures = [
  {
    icon: MessageCircleMore,
    title: "WhatsApp Community",
    description:
      "Our main communications channel regarding Mentorships & New Drops.",
  },
  {
    icon: Send,
    title: "Academic Telegram",
    description:
      "Our hub & main archive for academic mindmaps, notes, and resources.",
  },
  {
    icon: Send,
    title: "Clinical Telegram",
    description:
      "Our hub & main archive for clinical mindmaps, notes, and resources.",
  },
  {
    icon: Camera,
    title: "Instagram Account",
    description:
      "Our main communication channel regarding Media Production releases & other social media related topics.",
  },
];

const certifications = [
  {
    name: "Academic Telegram",
    url: "https://t.me/mediqacademic",
  },
  {
    name: "Clinical Telegram",
    url: "https://t.me/mediqclinical",
  },
  {
    name: "Instagram Account",
    url: "https://www.instagram.com/mediq26_/",
  },
  {
    name: "TikTok Account",
    url: "https://www.tiktok.com/@mediq26",
  },
  {
    name: "YouTube Channel",
    url: "https://www.youtube.com/@MedIQ.1",
  },
  {
    name: "Facebook Account",
    url: "https://www.facebook.com/profile.php?id=61572036539747",
  },
  {
    name: "WhatsApp Community",
    url: "https://chat.whatsapp.com/ImuE8zaJQXxARov9anUr7s",
  },
];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="security"
      className="py-24 lg:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="w-8 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, var(--mediq-blue), var(--mediq-green))",
                }}
              />

              <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
                Our Channels
              </span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-display tracking-tight leading-[0.95] mb-6">
              Join us Today;
              <br />
              <span className="text-muted-foreground">
                It's Free!
              </span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-3">
              You can find us in all sorts of places across the internet.
            </p>

            <p className="text-sm font-mono text-muted-foreground mb-8">
              Click on any of the buttons below to find us.
            </p>

            {/* Channel Buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {certifications.map((cert, index) => {
                const isBlue = index % 2 === 0;
                const accent = isBlue
                  ? "var(--mediq-blue)"
                  : "var(--mediq-green)";

                return (
                  <a
                    key={cert.name}
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 sm:px-4 sm:py-2 border text-xs sm:text-sm font-mono transition-all duration-300 cursor-pointer whitespace-nowrap ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{
                      borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
                      color: accent,
                      transitionDelay: `${index * 50 + 200}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accent;
                      e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 6%, transparent)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 25%, transparent)`;
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {cert.name}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right: Features */}
          <div className="grid gap-5">
            {securityFeatures.map((feature, index) => {
              const isBlue = index % 2 === 0;
              const accent = isBlue
                ? "var(--mediq-blue)"
                : "var(--mediq-green)";

              return (
                <div
                  key={feature.title}
                  className={`p-6 border transition-all duration-500 group ${
                    isVisible
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-8"
                  }`}
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                    transitionDelay: `${index * 100}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 50%, transparent)`;
                    e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${accent} 3%, transparent)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `color-mix(in srgb, ${accent} 18%, transparent)`;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="shrink-0 w-10 h-10 flex items-center justify-center border transition-all duration-300"
                      style={{
                        borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`,
                        color: accent,
                      }}
                    >
                      <feature.icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-1 transition-transform duration-300 group-hover:translate-x-1">
                        {feature.title}
                      </h3>

                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
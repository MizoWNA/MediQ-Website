"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck, MessageCircleMore, Camera, Send } from "lucide-react";

const securityFeatures = [
  {
    icon: MessageCircleMore,
    title: "Whatsapp Community",
    description: "Our main communications channel regarding Mentorships & New Drops.",
  },
  {
    icon: Send,
    title: "Academic Telegram",
    description: "Our hub & main archive for academic mindmaps, notes, and resources.",
  },
  {
    icon: Send,
    title: "Clinical Telegram",
    description: "Our hub & main archive for clinical mindmaps, notes, and resources.",
  },
  {
    icon: Camera,
    title: "Instagram Account",
    description: "Our main communication channel regarding Media Production releases & other social media related topics.",
  },
];

// Set a custom link (`url`) for each channel below.
const certifications = [
  { name: "Academic Telegram", url: "https://t.me/mediqacademic" },
  { name: "Clinical Telegram", url: "https://t.me/mediqclinical" },
  { name: "Instagram Account", url: "https://www.instagram.com/mediq26_/" },
  { name: "TikTok Account", url: "https://www.tiktok.com/@mediq26" },
  { name: "Youtube Channel", url: "https://www.youtube.com/@MedIQ.1" },
  { name: "Facebook Account", url: "https://www.facebook.com/profile.php?id=61572036539747" },
  { name: "Whatsapp Community", url: "https://chat.whatsapp.com/ImuE8zaJQXxARov9anUr7s" },
];

export function SecuritySection() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section id="security" ref={sectionRef} className="relative py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Our Channels
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Join us Today;
              <br />
              - It's Free!
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              You can find us in all sorts of places across the internet.
              <br />
              Click on any of the Buttons below to find us:
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {certifications.map((cert, index) => (
                <a
                  key={cert.name}
                  href={cert.url}
                  className={`px-3 py-2 sm:px-4 sm:py-2 border text-xs sm:text-sm font-mono whitespace-nowrap transition-all duration-500 cursor-pointer ${
                    index % 2 === 0
                      ? "border-[#1f71a1]/30 text-[#1f71a1] hover:border-[#1f71a1] hover:bg-[#1f71a1] hover:text-white"
                      : "border-[#46a65c]/30 text-[#46a65c] hover:border-[#46a65c] hover:bg-[#46a65c] hover:text-white"
                  } ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  {cert.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Features */}
          <div className="grid gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-4 sm:p-6 border transition-all duration-500 group ${
                  index % 2 === 0
                    ? "border-[#1f71a1]/20 hover:border-[#1f71a1]/60 hover:bg-[#1f71a1]/[0.03]"
                    : "border-[#46a65c]/20 hover:border-[#46a65c]/60 hover:bg-[#46a65c]/[0.03]"
                } ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`shrink-0 w-10 h-10 flex items-center justify-center border transition-colors duration-300 ${
  index % 2 === 0
    ? "border-[#1f71a1]/30 group-hover:bg-[#1f71a1] group-hover:text-white"
    : "border-[#46a65c]/30 group-hover:bg-[#46a65c] group-hover:text-white"
}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

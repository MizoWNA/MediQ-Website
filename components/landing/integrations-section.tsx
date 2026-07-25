"use client";

import { useEffect, useState, useRef } from "react";

// Set a custom link for each mindmap in the `url` field below.
const integrations = [
  { name: "The Placenta", category: "Emberyology", url: "/media/ThePlacerna.pdf" },
  { name: "Cardiology Curves", category: "Physiology", url: "/media/Cardio.pdf" },
  { name: "Arteries & Veins", category: "Histology", url: "/media/Avv.pdf" },
  { name: "Midaxillary Relations", category: "Anatomy", url: "/media/Midax.pdf" },
  { name: "Microscopic Slides", category: "Histology", url: "/media/Microscope.pdf" },
  { name: "Hormones & Arteriolar Diameter", category: "Physiology", url: "/media/Horm.pdf" },
  { name: "Arteries Drawings", category: "Anatomy", url: "/media/Art.pdf" },
  { name: "Drug Principles", category: "Pharmacology", url: "/media/Pharma.pdf" },
  { name: "Cell Injury & Depositions", category: "Pathology", url: "/media/Patho.pdf" },
  { name: "Most Common Series", category: "All Subjects", url: "/media/Sam.pdf" },
  { name: "ABP Receptors", category: "Physiology", url: "/media/ABP.pdf" },
  { name: "Thorax Nerves", category: "Anatomy", url: "/media/Thorax.pdf" },
];

export function IntegrationsSection() {
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
    <section id="integrations" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-16 lg:mb-24 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Mindmaps
            <span className="w-8 h-px bg-foreground/30" />
          </span>
          <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-6">
            Here for everything
            <br />
            you will ever study.
          </h2>
          <p className="text-xl text-muted-foreground">
            Hundreds of mindmaps and notes for any stage of your learning journey.
            <br />
            Click on one to check it out!
          </p>
        </div>

      </div>

      {/* Full-width marquees outside container */}
      <div className="w-full mb-6">
        <div className="flex gap-6 marquee">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 shrink-0">
              {integrations.map((integration) => (
                <a
                  key={`${integration.name}-${setIndex}`}
                  href={integration.url}
                  className="shrink-0 block px-8 py-6 border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-all duration-300 group cursor-pointer"
                >
                  <div className="text-lg font-medium group-hover:translate-x-1 transition-transform">
                    {integration.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{integration.category}</div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Reverse marquee */}
      <div className="w-full">
        <div className="flex gap-6 marquee-reverse">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 shrink-0">
              {[...integrations].reverse().map((integration) => (
                <a
                  key={`${integration.name}-reverse-${setIndex}`}
                  href={integration.url}
                  className="shrink-0 block px-8 py-6 border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.02] transition-all duration-300 group cursor-pointer"
                >
                  <div className="text-lg font-medium group-hover:translate-x-1 transition-transform">
                    {integration.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{integration.category}</div>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

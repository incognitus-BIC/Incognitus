"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="relative py-[var(--section-padding-y)] px-[var(--section-padding-x)]"
      style={{ background: "var(--color-surface)" }}
    >
      {/* Decorative accent */}
      <div
        className="absolute top-0 left-0 w-full h-1"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--color-secondary) 50%, transparent 100%)",
          opacity: 0.3,
        }}
      />

      <div
        ref={ref}
        className={`max-w-[var(--container-max)] mx-auto transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <span className="section-label">&lt;about/&gt;</span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-6"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-dark)" }}
          >
            Who We Are
          </h2>

          <div className="space-y-5">
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-foreground)" }}
            >
              <strong style={{ color: "var(--color-primary)" }}>inCognitus</strong>{" "}
              is a youth-driven cybersecurity community based in Biratnagar,
              operating under{" "}
              <strong style={{ color: "var(--color-dark)" }}>BIC DevCorps</strong>{" "}
              at Biratnagar International College. We bring together students
              and enthusiasts who are passionate about understanding and
              defending digital systems.
            </p>

            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-foreground)" }}
            >
              Our mission is clear:{" "}
              <em className="gradient-text font-semibold not-italic">
                build a generation of security-minded builders and breakers
              </em>
              . From capture-the-flag competitions to hands-on workshops, we
              create spaces where curiosity meets capability.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
              {[
                { value: "BIC", label: "College" },
                { value: "DevCorps", label: "Parent Org" },
                { value: "Nepal", label: "Based In" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-xl sm:text-2xl font-bold gradient-text"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-xs sm:text-sm mt-1"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

const focusAreas = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    title: "CTFs & Challenges",
    description:
      "Compete in capture-the-flag competitions, solve real-world security puzzles, and sharpen offensive and defensive skills through gamified learning.",
    tag: "compete",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    title: "Workshops & Training",
    description:
      "Hands-on sessions covering penetration testing, network security, cryptography, and secure coding practices — from beginner to advanced.",
    tag: "learn",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "Security Talks",
    description:
      "Industry experts and community members share insights on emerging threats, responsible disclosure, bug bounty, and career paths in cybersecurity.",
    tag: "discuss",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
        <path d="M14.5 4l-5 16" />
      </svg>
    ),
    title: "Open Community Projects",
    description:
      "Collaborate on open-source security tools, contribute to vulnerability research, and build projects that make the digital world safer.",
    tag: "build",
  },
];

export default function WhatWeDo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="focus"
      className="relative py-[var(--section-padding-y)] px-[var(--section-padding-x)] bg-transparent"
    >
      <div ref={ref} className="max-w-[var(--container-max)] mx-auto">
        <div className="text-center mb-14">
          <span className="section-label">&lt;focus/&gt;</span>
          <h2
            className={`text-3xl sm:text-4xl font-bold transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-dark)" }}
          >
            What We Do
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {focusAreas.map((area, i) => (
            <div
              key={area.title}
              className={`card-hover group relative rounded-2xl p-7 border transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border)",
                transitionDelay: `${i * 0.12}s`,
              }}
            >
              {/* Top gradient line on hover */}
              <div
                className="absolute top-0 left-4 right-4 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-secondary), var(--color-primary))",
                }}
              />

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-[var(--color-primary)]"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-primary)",
                }}
              >
                <div className="group-hover:text-white transition-colors duration-300 [&>svg]:stroke-current">
                  {area.icon}
                </div>
              </div>

              {/* Tag */}
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full mb-3 inline-block"
                style={{
                  background: "var(--color-surface-alt)",
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {area.tag}
              </span>

              {/* Title */}
              <h3
                className="text-lg font-bold mb-2"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-dark)",
                }}
              >
                {area.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-muted)" }}
              >
                {area.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

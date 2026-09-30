"use client";

import { useEffect, useRef, useState } from "react";

export default function Events() {
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
      id="events"
      className="relative py-[var(--section-padding-y)] px-[var(--section-padding-x)] bg-transparent"
    >
      <div ref={ref} className="max-w-[var(--container-max)] mx-auto">
        <div className="text-center mb-14">
          <span className="section-label">&lt;events/&gt;</span>
          <h2
            className={`text-3xl sm:text-4xl font-bold transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-dark)" }}
          >
            Events
          </h2>
        </div>

        {/* Empty state — styled, not broken-looking */}
        <div
          className={`max-w-xl mx-auto text-center rounded-3xl border-2 border-dashed p-12 sm:p-16 transition-all duration-700 ${
            visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* Decorative angle brackets */}
          <div
            className="text-5xl sm:text-6xl font-bold mb-6 select-none"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-border)",
            }}
          >
            &lt; /&gt;
          </div>

          <h3
            className="text-xl sm:text-2xl font-semibold mb-3"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-dark)",
            }}
          >
            Events Coming Soon
          </h3>

          <p
            className="text-sm sm:text-base max-w-sm mx-auto mb-6"
            style={{ color: "var(--color-muted)" }}
          >
            We&apos;re cooking up CTF challenges, workshops, and talks.
            Stay tuned — something is brewing.
          </p>

          {/* Placeholder event cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl p-5 text-left"
                style={{ background: "var(--color-surface)" }}
              >
                <div
                  className="h-3 w-24 rounded-full mb-3"
                  style={{ background: "var(--color-border)" }}
                />
                <div
                  className="h-2 w-full rounded-full mb-2"
                  style={{ background: "var(--color-border)" }}
                />
                <div
                  className="h-2 w-3/4 rounded-full"
                  style={{ background: "var(--color-border)" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

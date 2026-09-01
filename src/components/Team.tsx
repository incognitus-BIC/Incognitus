"use client";

import { useEffect, useRef, useState } from "react";

const teamMembers = [
  { name: "Member Name", role: "President", initials: "MN" },
  { name: "Member Name", role: "Vice President", initials: "MN" },
  { name: "Member Name", role: "Technical Lead", initials: "MN" },
  { name: "Member Name", role: "Events Coordinator", initials: "MN" },
  { name: "Member Name", role: "CTF Captain", initials: "MN" },
  { name: "Member Name", role: "Community Manager", initials: "MN" },
];

export default function Team() {
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
      id="team"
      className="relative py-[var(--section-padding-y)] px-[var(--section-padding-x)]"
      style={{ background: "var(--color-surface)" }}
    >
      <div ref={ref} className="max-w-[var(--container-max)] mx-auto">
        <div className="text-center mb-14">
          <span className="section-label">&lt;team/&gt;</span>
          <h2
            className={`text-3xl sm:text-4xl font-bold transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-dark)" }}
          >
            The People Behind the Screen
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {teamMembers.map((member, i) => (
            <div
              key={`${member.role}-${i}`}
              className={`card-hover group text-center rounded-2xl p-6 border transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border)",
                transitionDelay: `${i * 0.08}s`,
              }}
            >
              {/* Avatar placeholder */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-secondary-light), var(--color-primary))",
                }}
              >
                <span
                  className="text-lg sm:text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {member.initials}
                </span>
              </div>

              {/* Name */}
              <h3
                className="text-sm font-semibold mb-1"
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-dark)",
                }}
              >
                {member.name}
              </h3>

              {/* Role */}
              <span
                className="text-xs"
                style={{
                  color: "var(--color-secondary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

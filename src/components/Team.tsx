"use client";

import { useEffect, useRef, useState } from "react";
import { getTeamMembers, DEFAULT_TEAM_MEMBERS } from "@/lib/team";
import type { TeamMember } from "@/types/database";

export default function Team() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);

  useEffect(() => {
    let isMounted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);

    // Fetch dynamic team members from Supabase
    getTeamMembers().then((data) => {
      if (isMounted && data && data.length > 0) {
        setMembers(data);
      }
    });

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="team"
      className="relative py-[var(--section-padding-y)] px-[var(--section-padding-x)]"
      style={{
        background: "rgba(248, 247, 252, 0.72)",
        backdropFilter: "blur(3px)",
      }}
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
          {members.map((member, i) => (
            <div
              key={member.id || `${member.role}-${i}`}
              className={`card-hover group text-center rounded-2xl p-6 border transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border)",
                transitionDelay: `${i * 0.08}s`,
              }}
            >
              {/* Avatar placeholder or image */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-secondary-light), var(--color-primary))",
                }}
              >
                {member.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-lg sm:text-xl font-bold text-white select-none"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {member.initials || member.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name */}
              <h3
                className="text-sm font-semibold mb-1 truncate px-1"
                title={member.name}
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-dark)",
                }}
              >
                {member.name}
              </h3>

              {/* Role */}
              <span
                className="text-xs block truncate px-1"
                title={member.role}
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

"use client";

import { useEffect, useRef, useState } from "react";

export default function JoinUs() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="join"
      className="relative py-[var(--section-padding-y)] px-[var(--section-padding-x)] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1F1A33 0%, #4B3F87 50%, #8B7BB8 100%)",
      }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing orbs */}
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(139,123,184,0.3), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, rgba(139,123,184,0.2), transparent 70%)",
          filter: "blur(40px)",
          animationDelay: "2s",
        }}
      />

      <div
        ref={ref}
        className={`relative z-10 max-w-2xl mx-auto text-center transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <span
          className="text-sm font-medium tracking-wider mb-4 inline-block"
          style={{
            fontFamily: "var(--font-mono)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          &lt;join/&gt;
        </span>

        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Think you&apos;ve got what it takes?
        </h2>

        <p
          className="text-base sm:text-lg mb-10 max-w-lg mx-auto"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          Whether you&apos;re a seasoned hacker or just curious about
          cybersecurity, there&apos;s a place for you in inCognitus.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[var(--color-primary)] font-semibold rounded-xl text-base transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Join Us
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl text-base transition-all duration-300 hover:border-white/60 hover:bg-white/10"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Discord
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 19.9312 19.9312 0 005.9932 3.0294.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.8732.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 19.8975 19.8975 0 006.0022-3.0294.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--color-background)" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full animate-pulse-glow"
          style={{
            background:
              "radial-gradient(circle, rgba(139,123,184,0.18) 0%, rgba(75,63,135,0.08) 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Logo */}
        <div className="animate-fade-in-up mb-8">
          <div className="inline-block animate-float">
            <Image
              src="/Logo.png"
              alt="inCognitus — bowler hat and eye mark"
              width={180}
              height={180}
              priority
              className="mx-auto drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Name */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 animate-fade-in-up delay-200"
          style={{
            fontFamily: "var(--font-heading)",
            opacity: 0,
          }}
        >
          <span style={{ color: "var(--color-dark)" }}>in</span>
          <span className="gradient-text">Cognitus</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-lg sm:text-xl mb-3 animate-fade-in-up delay-300"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-secondary)",
            opacity: 0,
          }}
        >
          &lt;Identity is a Variable&gt;
        </p>

        {/* Sub-line */}
        <p
          className="text-base sm:text-lg mb-10 max-w-lg mx-auto animate-fade-in-up delay-400"
          style={{
            color: "var(--color-muted)",
            opacity: 0,
          }}
        >
          A cybersecurity community by BIC DevCorps,
          <br className="hidden sm:block" /> Biratnagar International College.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-in-up delay-500"
          style={{ opacity: 0 }}
        >
          <a href="#join" className="btn-primary text-base">
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
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in-up delay-600" style={{ opacity: 0 }}>
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-xs tracking-widest uppercase transition-colors duration-300 hover:text-[var(--color-primary)]"
          style={{
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>Scroll</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-bounce"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}

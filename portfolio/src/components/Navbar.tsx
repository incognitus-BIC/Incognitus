"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "What We Do", href: "#focus" },
  { label: "Team", href: "#team" },
  { label: "Events", href: "#events" },
  { label: "Join", href: "#join" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(75,63,135,0.08)] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-3 group"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Image
            src="/Logo.png"
            alt="inCognitus logo"
            width={40}
            height={40}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <span
            className="font-[var(--font-heading)] font-bold text-xl tracking-tight"
            style={{ color: "var(--color-dark)" }}
          >
            in<span className="gradient-text">Cognitus</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-300 hover:text-[var(--color-primary)] relative group"
              style={{
                color: "var(--color-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          ))}
          <a href="#join" className="btn-primary text-sm !py-2.5 !px-5">
            Join Us
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col gap-1.5 p-2 relative z-50"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
              mobileOpen
                ? "rotate-45 translate-y-2 bg-white"
                : "bg-[var(--color-dark)]"
            }`}
          />
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
              mobileOpen ? "opacity-0" : "bg-[var(--color-dark)]"
            }`}
          />
          <span
            className={`block w-6 h-0.5 rounded-full transition-all duration-300 ${
              mobileOpen
                ? "-rotate-45 -translate-y-2 bg-white"
                : "bg-[var(--color-dark)]"
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          background:
            "linear-gradient(135deg, #1F1A33 0%, #4B3F87 50%, #8B7BB8 100%)",
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`text-2xl font-semibold text-white/90 hover:text-white transition-all duration-300 ${
                mobileOpen ? "animate-fade-in-up" : ""
              }`}
              style={{
                fontFamily: "var(--font-heading)",
                animationDelay: `${i * 0.08}s`,
                opacity: mobileOpen ? undefined : 0,
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#join"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-3 bg-white text-[var(--color-primary)] font-semibold rounded-xl text-lg transition-transform duration-300 hover:scale-105"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Join Us
          </a>
        </div>
      </div>
    </nav>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Console | inCognitus",
  description: "inCognitus executive admin panel for managing events, team members, and site sections.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col font-sans selection:bg-purple-100 selection:text-[var(--color-primary)]"
      style={{
        background: "radial-gradient(ellipse at top left, #FAF9FD 0%, #F5F3FA 45%, #F0EEF8 100%)",
        color: "var(--color-foreground, #4A4A4A)",
      }}
    >
      {/* Top Brand Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-[var(--color-primary,#4B3F87)] via-purple-500 via-50% to-indigo-500 sticky top-0 z-50 shadow-sm" />

      {/* Admin Top Navigation */}
      <header className="border-b border-purple-100/80 bg-white/85 backdrop-blur-xl sticky top-1 z-40 shadow-[0_4px_20px_-4px_rgba(75,63,135,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Left Brand Area */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Image
                  src="/Logo.png"
                  alt="inCognitus Logo"
                  width={34}
                  height={34}
                  className="group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight font-[var(--font-heading)] text-[var(--color-dark,#1F1A33)]">
                in<span style={{ color: "var(--color-primary,#4B3F87)" }}>Cognitus</span>
              </span>
            </Link>

            <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />

            {/* Portal Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50/80 border border-purple-200/80 text-[11px] font-mono font-semibold text-[var(--color-primary,#4B3F87)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>CONSOLE</span>
            </div>
          </div>

          {/* Right Utility Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-purple-100 bg-white hover:bg-purple-50/60 hover:border-purple-300 text-xs font-semibold text-slate-700 hover:text-[var(--color-primary)] transition-all shadow-xs"
            >
              <span>View Live Portfolio</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-400 group-hover:text-[var(--color-primary)]"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-purple-100/60 bg-white/70 py-4 px-6 text-center text-xs text-slate-500 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
          <p className="font-mono text-[11px]">
            inCognitus IT &amp; Cybersecurity Club &bull; Biratnagar International College
          </p>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Supabase Connected
            </span>
            <span>&bull;</span>
            <span>Internal Admin Panel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

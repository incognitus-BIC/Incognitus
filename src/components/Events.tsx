"use client";

import { useEffect, useRef, useState } from "react";
import { getPublishedEvents } from "@/lib/events";
import type { Event } from "@/types/database";

export default function Events() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;
    getPublishedEvents()
      .then((data) => {
        if (mounted) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

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
            Events &amp; Workshops
          </h2>
        </div>

        {/* Dynamic Events Grid from Supabase */}
        {!loading && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <div
                key={event.id}
                className={`card-hover group relative rounded-2xl border overflow-hidden flex flex-col transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
                style={{
                  background: "var(--color-background)",
                  borderColor: "var(--color-border)",
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                {/* Event Image */}
                {event.image_url && (
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date & Location Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                        style={{
                          background: "var(--color-surface-alt)",
                          color: "var(--color-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {formatDate(event.date)}
                      </span>

                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full text-slate-600 inline-flex items-center gap-1"
                        style={{ background: "var(--color-surface)" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {event.location}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--color-dark)",
                      }}
                    >
                      {event.title}
                    </h3>

                    <p
                      className="text-sm line-clamp-3 mb-6"
                      style={{ color: "var(--color-muted)" }}
                    >
                      {event.description}
                    </p>
                  </div>

                  {/* Action / Registration Form Link */}
                  {event.registration_form_url && (
                    <a
                      href={event.registration_form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary !py-2.5 !px-4 text-sm w-full text-center inline-flex items-center justify-center gap-2 mt-auto"
                    >
                      Register Now
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state — styled, shown when no events published yet */
          <div
            className={`max-w-xl mx-auto text-center rounded-3xl border-2 border-dashed p-12 sm:p-16 transition-all duration-700 ${
              visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{
              borderColor: "var(--color-border)",
              background: "rgba(255, 255, 255, 0.8)",
            }}
          >
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

            {/* Skeleton preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl p-5 text-left border"
                  style={{
                    background: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                  }}
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
        )}
      </div>
    </section>
  );
}

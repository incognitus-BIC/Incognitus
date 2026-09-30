"use client";

import { useEffect, useRef } from "react";

// Highly meaningful, recognizable code from inCognitus, Next.js, and cybersecurity engineering
const MEANINGFUL_CODE = [
  'export default function inCognitus() {',
  'const TAGLINE = "<Identity is a Variable>";',
  'const community = "Cybersecurity Builders & Breakers";',
  'const campus = "Biratnagar International College";',
  'const parentOrg = "BIC DevCorps, Nepal";',
  'interface SecurityResearcher { role: "hacker"; ethical: true; }',
  'const tracks = ["CTF", "Workshops", "Security Talks", "Open Projects"];',
  'const payload = await crypto.subtle.digest("SHA-256", token);',
  'const brand = { primary: "#4B3F87", secondary: "#8B7BB8", dark: "#1F1A33" };',
  'const social = { discord: "5avTYe8VX", insta: "bic_incognitus" };',
  'export const metadata: Metadata = { title: "inCognitus" };',
  'const firewall = new Firewall({ defaultPolicy: "DROP", stateful: true });',
  'function auditVulnerabilities(target: string): SecurityAudit {',
  'const flag = atob("SU5DT0dOSVRVU3tleHBsb2l0X2ZyZWVkb219");',
  'sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT',
  'const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);',
  'return <section id="hero" className="cyber-terminal" />;',
  'const zeroTrust = { verifyAlways: true, trustNever: true };',
  'async function handleCTFChallenge(id: "web-01"): Promise<Flag> {',
  'git commit -m "feat: inCognitus cybersecurity portfolio"',
  'const mission = "Building a generation of security-minded builders";',
  'const headers = { "Content-Security-Policy": "default-src \'self\'" };',
  'nmap -sV -sC -T4 -Pn target.bicnepal.edu.np',
  'SELECT username, privilege FROM users WHERE role = "admin";',
  'const sanitizeInput = (raw: string): string => DOMPurify.sanitize(raw);',
  'export const viewport: Viewport = { themeColor: "#4B3F87" };',
  'chmod 700 ~/.ssh/id_ed25519 && ssh root@devcorps.local',
  'const devCorps = { mission: "Learn, Build, Secure", year: 2026 };',
];

interface ColumnState {
  x: number;
  row: number;
  speed: number; // ms per step (brisk & smooth)
  lastUpdate: number;
  snippet: string;
  charIndex: number;
  trailLength: number;
  trail: { char: string; row: number }[];
}

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animationFrameId: number;
    let isVisible = !document.hidden;
    let width = 0;
    let height = 0;

    const fontSize = 13.5;
    const colSpacing = 24; // Crisp, balanced column grid
    let columns: ColumnState[] = [];

    const initColumns = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const numCols = Math.max(1, Math.floor(width / colSpacing));
      const now = performance.now();
      const rowHeight = fontSize * 1.32;
      const maxRows = Math.floor(height / rowHeight);

      columns = Array.from({ length: numCols }, (_, i) => {
        const snippet =
          MEANINGFUL_CODE[Math.floor(Math.random() * MEANINGFUL_CODE.length)];
        // Brisk, smooth speed: 55ms - 85ms per character (~12-18 chars/sec)
        const speed = 55 + Math.random() * 30;
        const trailLength = 16 + Math.floor(Math.random() * 10);
        // Stagger drops smoothly across the vertical height initially
        const initialRow = Math.floor(Math.random() * maxRows * 1.5) - maxRows;

        return {
          x: i * colSpacing + 8,
          row: initialRow,
          speed,
          lastUpdate: now + Math.random() * 150,
          snippet,
          charIndex: Math.floor(Math.random() * snippet.length),
          trailLength,
          trail: [],
        };
      });
    };

    initColumns();

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);

      if (!isVisible || prefersReducedMotion) return;

      ctx.clearRect(0, 0, width, height);

      const rowHeight = fontSize * 1.32;
      const maxRows = Math.floor(height / rowHeight) + 2;

      ctx.font = `600 ${fontSize}px "JetBrains Mono", Consolas, monospace`;

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];

        // Smooth advancement based on column's tuned interval
        if (time - col.lastUpdate >= col.speed) {
          col.lastUpdate = time;

          // Sequential character from meaningful code
          const char = col.snippet[col.charIndex % col.snippet.length];
          col.charIndex++;

          // If snippet ended, rotate to another meaningful snippet smoothly
          if (col.charIndex >= col.snippet.length) {
            col.charIndex = 0;
            col.snippet =
              "   " +
              MEANINGFUL_CODE[
                Math.floor(Math.random() * MEANINGFUL_CODE.length)
              ];
          }

          col.trail.unshift({ char, row: col.row });
          if (col.trail.length > col.trailLength) {
            col.trail.pop();
          }

          col.row++;

          // Continuous loop: reset to top with slight random stagger when exiting bottom
          if (col.row > maxRows + col.trailLength) {
            col.row = -Math.floor(Math.random() * 10);
            col.trail = [];
            col.charIndex = 0;
            col.snippet =
              MEANINGFUL_CODE[
                Math.floor(Math.random() * MEANINGFUL_CODE.length)
              ];
            col.speed = 55 + Math.random() * 30;
          }
        }

        // Draw trail with smooth exponential falloff
        const len = col.trail.length;
        for (let t = 0; t < len; t++) {
          const item = col.trail[t];
          const y = item.row * rowHeight;

          if (y < -fontSize || y > height + fontSize) continue;

          if (t === 0) {
            // Leading character: bold deep brand purple with vivid accent glow
            ctx.fillStyle = "#3A2E78";
            ctx.shadowColor = "rgba(139, 123, 184, 0.7)";
            ctx.shadowBlur = 6;
            ctx.fillText(item.char, col.x, y);
            ctx.shadowBlur = 0;
          } else {
            // Smooth, non-linear fading curve for high aesthetic quality
            const progress = t / len;
            const alpha = Math.pow(1 - progress, 1.4) * 0.52;
            ctx.fillStyle = `rgba(139, 123, 184, ${alpha.toFixed(3)})`;
            ctx.fillText(item.char, col.x, y);
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      initColumns();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      style={{
        opacity: 0.48,
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

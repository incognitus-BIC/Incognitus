# inCognitus — Website Spec

**Community:** inCognitus — Cybersecurity Community
**Parent org:** BIC DevCorps, Biratnagar International College (BIC)
**Tagline:** `<Identity is a Variable>`
**Location:** Biratnagar, Nepal

---

## 1. Tech Stack

- **Framework:** Next.js
- **Deployment:** Netlify
- **Styling:** TBD at build time — Tailwind CSS recommended for speed and easy theming off the color tokens below (can also do plain CSS Modules if preferred)

---

## 2. Design System

### Colors (derived from logo)
| Role | Color | Hex |
|---|---|---|
| Primary (headings, buttons) | Deep indigo-purple | `#4B3F87` |
| Secondary / accent (hover, tags) | Lavender-purple | `#8B7BB8` |
| Dark accent (footer, contrast sections) | Near-black indigo | `#1F1A33` |
| Background | White | `#FFFFFF` |
| Body text | Warm grey | `#4A4A4A` |
| Muted text (tagline-style) | Light grey | `#6B6B6B` |

Gradient (reused from logo, used sparingly — hero text, buttons, section accents):
`linear-gradient(135deg, #8B7BB8 0%, #4B3F87 60%, #1F1A33 100%)`

### Typography
- **Headings:** Sora or Poppins (bold, geometric — matches wordmark weight)
- **Body:** Inter
- **Labels / tags / eyebrow text:** JetBrains Mono — styled like `<about/>`, `<team/>`, `<events/>` echoing the tagline's angle-bracket motif

### Hero Background
White base with a soft purple gradient glow radiating behind the logo (radial gradient, low opacity, blurred) — ties the hero directly to the logo's own color story without needing a pattern or texture.

### General Style Notes
- Generous whitespace, minimal layout, no clutter
- Angle-bracket (`< />`) motif reused as a recurring design element for section labels
- Subtle hover states (underline/lift/glow) on interactive elements — nothing flashy
- Rounded-soft or sharp-edged cards — TBD at build time, default to soft (8–12px radius) unless you'd rather sharp/technical edges

---

## 3. Site Structure & Content (Single Page, Scroll Sections)

### Nav
Logo (left) · About · What We Do · Team · Events · Join · (CTA button: "Join Us")

### 1. Hero
- Logo (bowler hat + eye mark)
- **inCognitus**
- Tagline: `<Identity is a Variable>`
- Sub-line: "A cybersecurity community by BIC DevCorps, Biratnagar International College."
- CTA button: "Join Us" → scrolls to Join section

### 2. About (`<about/>`)
- What inCognitus is: a youth-driven cybersecurity community based in Biratnagar, operating under BIC DevCorps at Biratnagar International College
- Mission line: building a generation of security-minded builders and breakers — placeholder for your actual mission statement
- *(Placeholder paragraph — to be filled with real copy)*

### 3. What We Do (`<focus/>`)
Grid of 3–4 cards, placeholder icons + labels:
- CTFs & Challenges
- Workshops & Training
- Security Talks
- Open Community Projects
*(placeholder descriptions, one line each)*

### 4. Team (`<team/>`)
- Grid of member cards — placeholder avatar, "Name", "Role"
- 4–6 empty placeholder slots to start

### 5. Events (`<events/>`)
- Empty state, styled (not broken-looking): e.g. "Events coming soon" with the angle-bracket motif
- Card layout ready to populate later with real past/upcoming events

### 6. Join Us (`<join/>`)
- Short CTA line: "Think you've got what it takes?"
- Button → placeholder link (form / Discord / email — TBD)

### 7. Footer
- Logo mark (small)
- Social icons: Instagram, LinkedIn, GitHub, Discord/Telegram — placeholder links (`#`)
- "Powered by BIC DevCorps" credit line
- © inCognitus, Biratnagar International College

---

## 4. Notes
- All team, event, and social handle content is placeholder for now — structure is ready, real content swaps in later without layout changes
- Fully responsive: mobile-first, single column stacking on small screens
- No dark mode planned (white background is core to brand per request) — can revisit later
- Build target: Next.js app deployed via Netlify (netlify.toml + `@netlify/plugin-nextjs` for SSR/ISR support if needed; static export also viable since content is mostly static placeholders for now)

---

**Status: Pending your approval before build.**

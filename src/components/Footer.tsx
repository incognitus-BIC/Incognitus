import Image from "next/image";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/bic_incognitus/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.gg/5avTYe8VX",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 19.9312 19.9312 0 005.9932 3.0294.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.8732.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 19.8975 19.8975 0 006.0022-3.0294.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:incognitus@bicnepal.edu.np",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4l-10 8L2 4" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="py-12 px-[var(--section-padding-x)]"
      style={{
        background: "var(--color-dark)",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <div className="max-w-[var(--container-max)] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="inCognitus"
              width={36}
              height={36}
              className="opacity-80"
            />
            <span
              className="font-bold text-white/90 text-lg"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              in<span style={{ color: "var(--color-secondary)" }}>Cognitus</span>
            </span>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:scale-110"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-8"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p>
            Crafted by{" "}
            <span className="text-white/80 font-medium">
              Hackers &amp; Builders at inCognitus
            </span>
          </p>
          <p>
            © {new Date().getFullYear()} inCognitus, Biratnagar International
            College
          </p>
        </div>
      </div>
    </footer>
  );
}

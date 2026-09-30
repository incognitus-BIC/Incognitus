import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://incognitus.netlify.app";

export const viewport: Viewport = {
  themeColor: "#4B3F87",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "inCognitus — Cybersecurity Community | BIC DevCorps",
    template: "%s | inCognitus",
  },
  description:
    "inCognitus is the premier youth-driven cybersecurity community by BIC DevCorps at Biratnagar International College, Nepal. Fostering security-minded builders, ethical hackers, and CTF competitors.",
  applicationName: "inCognitus",
  authors: [
    {
      name: "BIC DevCorps",
      url: siteUrl,
    },
  ],
  generator: "Next.js",
  keywords: [
    "inCognitus",
    "cybersecurity Nepal",
    "BIC DevCorps",
    "Biratnagar International College",
    "ethical hacking",
    "CTF competitions Nepal",
    "cyber security community",
    "information security",
    "infosec Nepal",
    "cyber workshops",
    "security researchers",
    "student tech portfolio",
    "bug bounty",
    "network security",
    "cryptography",
  ],
  creator: "BIC DevCorps",
  publisher: "BIC DevCorps",
  category: "technology",
  icons: {
    icon: [
      { url: "/Logo.png", sizes: "any", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/Logo.png",
    apple: [
      { url: "/Logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "inCognitus — Cybersecurity Community | BIC DevCorps",
    description:
      "A youth-driven cybersecurity community by BIC DevCorps, Biratnagar International College. Empowering the next generation of security researchers, ethical hackers, and builders.",
    url: siteUrl,
    siteName: "inCognitus",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/Logo.png",
        width: 800,
        height: 800,
        alt: "inCognitus Logo — Cybersecurity Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "inCognitus — Cybersecurity Community | BIC DevCorps",
    description:
      "A youth-driven cybersecurity community by BIC DevCorps at Biratnagar International College. Identity is a Variable.",
    images: ["/Logo.png"],
    creator: "@bic_devcorps",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "inCognitus",
      alternateName: "inCognitus Cyber Community",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/Logo.png`,
        caption: "inCognitus Logo",
      },
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "Biratnagar International College",
      },
      department: {
        "@type": "Organization",
        name: "BIC DevCorps",
      },
      description:
        "Youth-driven cybersecurity community by BIC DevCorps at Biratnagar International College, Nepal.",
      email: "incognitus@bicnepal.edu.np",
      sameAs: [
        "https://discord.gg/5avTYe8VX",
        "https://www.instagram.com/bic_incognitus/",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "inCognitus",
      description:
        "Cybersecurity community and tech portfolio by BIC DevCorps, Biratnagar International College.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/Logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/Logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

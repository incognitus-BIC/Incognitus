import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "inCognitus — Cybersecurity Community | BIC DevCorps",
  description:
    "inCognitus is a youth-driven cybersecurity community by BIC DevCorps at Biratnagar International College. Building security-minded builders and breakers.",
  keywords: [
    "cybersecurity",
    "CTF",
    "BIC DevCorps",
    "Biratnagar International College",
    "Nepal",
    "inCognitus",
    "security community",
  ],
  openGraph: {
    title: "inCognitus — Cybersecurity Community",
    description:
      "A youth-driven cybersecurity community by BIC DevCorps, Biratnagar International College.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

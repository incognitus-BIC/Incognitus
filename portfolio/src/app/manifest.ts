import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "inCognitus — Cybersecurity Community",
    short_name: "inCognitus",
    description:
      "Youth-driven cybersecurity community by BIC DevCorps at Biratnagar International College.",
    start_url: "/",
    display: "standalone",
    background_color: "#1F1A33",
    theme_color: "#4B3F87",
    icons: [
      {
        src: "/Logo.png",
        sizes: "192x192 512x512",
        type: "image/png",
      },
    ],
  };
}

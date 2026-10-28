import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Homies — Find Your People",
    short_name: "Homies",
    description: "A thoughtful social and personals space for LGBTQ+ men.",
    start_url: "/",
    display: "standalone",
    background_color: "#1C1C1E",
    theme_color: "#1C1C1E",
    icons: []
  };
}

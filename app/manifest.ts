import type { MetadataRoute } from "next";
import { SITE } from "@/src/lib/seo/config";

/** Required under `output: 'export'` — without it the route is treated as dynamic and never written to `out/`. */
export const dynamic = "force-static";

/**
 * Emitted as `/manifest.webmanifest`, which is what the `manifest` link in the
 * root layout points at.
 *
 * `start_url` is the funnel, not `/`: if someone installs this to a home screen
 * they are here to create a store, and `/` is the placeholder landing page.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.shortName,
    description: SITE.shortDescription,
    start_url: "/onboard/",
    scope: "/",
    display: "standalone",
    background_color: SITE.backgroundColor,
    theme_color: SITE.themeColor,
    lang: SITE.language,
    dir: "ltr",
    categories: ["business", "shopping", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      /**
       * Android crops "any" icons to whatever mask the launcher uses, which
       * clips a square logo's corners. The maskable variant is drawn full-bleed
       * with the mark inside the middle 80% so it survives a circular mask.
       */
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

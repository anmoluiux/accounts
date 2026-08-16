import type { MetadataRoute } from "next";
import { ABS } from "@/src/lib/seo/config";

/** Required under `output: 'export'` — without it the route is treated as dynamic and never written to `out/`. */
export const dynamic = "force-static";

/**
 * Only indexable URLs belong here. A sitemap is a statement that these are the
 * pages worth crawling, so listing one that carries `noindex` sends Google two
 * contradictory instructions and gets the file's accuracy discounted as a
 * whole.
 *
 * Absent on purpose:
 *   `/`        — `noindex` while it still carries the placeholder ShopWave copy
 *                and duplicates bravo (see app/page.tsx).
 *   `/404`     — an error page.
 *
 * Trailing slashes are load-bearing: `trailingSlash: true` makes `/onboard/`
 * the real URL, and it has to match the `alternates.canonical` on each page
 * exactly or the two disagree about which URL is authoritative.
 *
 * `lastModified` is written by hand rather than stamped with `new Date()` at
 * build time. A build-time timestamp claims every page changed on every deploy
 * — including deploys that only bumped a dependency — and once `lastmod` is
 * shown to be unreliable Google stops trusting it site-wide, which costs the
 * one thing it is good for: getting a real copy change recrawled quickly.
 * Update the date when the page's *content* changes.
 */
const ROUTES = [
  { path: "/onboard/", lastModified: "2026-08-16", changeFrequency: "monthly", priority: 1 },
  { path: "/login/", lastModified: "2026-08-16", changeFrequency: "yearly", priority: 0.5 },
] as const satisfies ReadonlyArray<{
  path: string;
  lastModified: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: ABS(route.path),
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

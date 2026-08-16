import { MARKETING_URL } from "@/src/assets/url";

/**
 * Single source of truth for everything a crawler or a link-preview bot reads.
 *
 * Mirrors `bravo/src/lib/seo/config.ts` on purpose — the two sites are one
 * brand, and Organization structured data has to agree across both or Google
 * treats them as separate entities.
 *
 * ── Which host is this? ───────────────────────────────────────────────────
 * `accounts.brandwik.com`, not `brandwik.com`. bravo owns the apex domain and
 * links out to this app for signup and sign-in (`bravo/src/lib/links.ts`), so
 * this is a sibling subdomain, not the marketing site.
 *
 * That matters for `metadataBase`: it is what Next resolves every relative
 * `openGraph.images` path against. Point it at the wrong host and every social
 * preview requests an image that 404s — the link then renders as a bare URL in
 * WhatsApp, Slack and iMessage with no title, no description and no image.
 *
 * Baked in at build time — this is a static export (`output: 'export'`), so
 * `NEXT_PUBLIC_SITE_URL` has to be set for the build, not for the runtime.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://accounts.brandwik.com";

/** Trailing slash stripped so `ABS()` never emits a double slash. */
export const SITE_URL = RAW_SITE_URL.replace(/\/+$/, "");

export const SITE = {
  url: SITE_URL,
  /** The marketing site. Canonical home of the brand entity. */
  marketingUrl: MARKETING_URL,

  name: "Brandwik",
  shortName: "Brandwik",
  tagline: "Create your online store",

  /**
   * ~150 characters. Google truncates the SERP snippet around 155–160, and
   * WhatsApp shows roughly the first two lines, so the sentence has to carry
   * its meaning in the first ~100.
   */
  description:
    "Pick a name, tell us what you sell, and Brandwik builds your online storefront for you — live in minutes, with no code and no designer.",

  /** Manifest / short-form contexts where the long one would be clipped. */
  shortDescription:
    "Pick a name, tell us what you sell — Brandwik builds the storefront.",

  locale: "en_US",
  language: "en-US",

  /**
   * Tints the browser chrome on Android Chrome and the iOS Safari toolbar, and
   * the in-app browsers WhatsApp / Instagram / LinkedIn open links in — which
   * is where most shared links actually get opened.
   *
   * `--bw-forest`, matching the showcase panel that fills 60% of every screen
   * in this app.
   */
  themeColor: "#2e4b3a",
  /** `--bw-cream`, the funnel's page background. */
  backgroundColor: "#f3f2ea",

  twitter: "@brandwik",

  /**
   * `sameAs` for the Organization node. Copied from bravo's config so both
   * sites describe the same entity; a mismatch here splits the knowledge-graph
   * signal between two hosts instead of consolidating it.
   */
  social: [
    "https://x.com/brandwik",
    "https://www.youtube.com/@brandwik",
    "https://www.instagram.com/brandwik",
    "https://www.linkedin.com/company/brandwik",
    "https://www.facebook.com/brandwik",
  ],

  /**
   * `keywords` carries no ranking weight at Google and has not since 2009. It
   * stays because Bing still reads it as a weak relevance hint and it costs
   * nothing. Do not grow this list expecting rankings — the page copy is what
   * ranks.
   */
  keywords: [
    "create an online store",
    "online store builder",
    "ecommerce store builder",
    "start an online store",
    "sell online",
    "storefront builder",
    "brandwik signup",
    "brandwik login",
  ],
} as const;

/**
 * Relative path → absolute URL on this host.
 *
 * Needed anywhere a raw string has to be absolute — JSON-LD `@id`s, the robots
 * `sitemap:` line, the sitemap entries. Metadata `openGraph.images` does NOT
 * need it: Next resolves those against `metadataBase` itself.
 */
export const ABS = (path: string) => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Social preview cards, as real files under `public/og/`.
 *
 * ── Why files and not `opengraph-image.tsx` ───────────────────────────────
 * Next's metadata-image convention does work under `output: 'export'`, but it
 * emits the PNG to an **extensionless** path (`/onboard/opengraph-image-5a60y9`).
 * A static host has no way to know that is a PNG, so it serves it as
 * `application/octet-stream` — and every major scraper (WhatsApp, Facebook,
 * X, LinkedIn, Slack, iMessage) drops an `og:image` whose Content-Type is not
 * `image/*`. The card silently degrades to a bare link.
 *
 * A plain `.png` under `public/` is served as `image/png` by every static host
 * with no configuration, so the preview works everywhere.
 *
 * Regenerate with `npm run brand:assets` (see scripts/generate-brand-assets.mjs).
 */
export const OG_IMAGE = {
  default: "/og/brandwik-og.png",
  onboard: "/og/brandwik-onboard-og.png",
} as const;

/** Every card is rendered at this size. Declared so `og:image:width/height` is always right. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/**
 * Builds the `openGraph.images` / `twitter.images` entry for a card.
 *
 * `width`/`height` are not decorative. WhatsApp uses them to decide between a
 * large hero card and a small square thumbnail, and Facebook/LinkedIn use them
 * to reserve layout before the image finishes downloading. Omit them and a
 * correct 1200×630 image can still render as a cramped thumbnail.
 */
export const ogImage = (src: string, alt: string) => [{ url: src, ...OG_SIZE, alt, type: "image/png" }];

/**
 * The per-page social + canonical block.
 *
 * Exists because Next merges metadata **shallowly**: a page that declares its
 * own `openGraph` replaces the root layout's object wholesale rather than
 * merging into it. Hand-writing the block on each page silently dropped
 * `og:locale`, `og:site_name`, `twitter:site` and `twitter:creator` from every
 * route — each one individually easy to miss in review, because the tags that
 * *were* written looked complete.
 *
 * Routing every page through one builder means a field added here appears
 * everywhere, and no page can be accidentally short.
 *
 * @param path       Route path **with the trailing slash** (`/onboard/`).
 *                   `trailingSlash: true` makes that the real URL, and the
 *                   canonical has to name the URL that actually serves.
 * @param titleFull  What social cards show. Distinct from the `<title>`, which
 *                   the root layout's template suffixes — a card has no
 *                   surrounding browser chrome to supply the brand, so it
 *                   carries the brand itself.
 */
export function pageSocial({
  path,
  titleFull,
  description,
  image,
  imageAlt,
}: {
  path: string;
  titleFull: string;
  description: string;
  image: string;
  imageAlt: string;
}) {
  const images = ogImage(image, imageAlt);
  return {
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      url: path,
      siteName: SITE.name,
      locale: SITE.locale,
      title: titleFull,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image" as const,
      site: SITE.twitter,
      creator: SITE.twitter,
      title: titleFull,
      description,
      images,
    },
  };
}

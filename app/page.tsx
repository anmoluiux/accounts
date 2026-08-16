import type { Metadata } from "next";
import LandingPage from "@/src/components/landing/LandingPage";
import { OG_IMAGE, SITE, pageSocial } from "@/src/lib/seo/config";

/**
 * A server component wrapping the client landing page.
 *
 * The split exists because `export const metadata` is only read from server
 * components, and the page itself is `"use client"` (AntD Drawer, Segmented,
 * Collapse all hold state). Before the split this route inherited the root
 * layout's title verbatim, so the host's own front door shared as
 * "Accounts — SaaS Platform for Account Management" with no image at all.
 */
export const metadata: Metadata = {
  /**
   * No `title` here on purpose, so the root layout's `title.default`
   * ("Brandwik — Create your online store") applies.
   *
   * A title set on *this* file would render bare. `title.template` only
   * decorates titles from **child** route segments, and `app/page.tsx` shares
   * the root segment with `app/layout.tsx` — so `title: "Create your online
   * store"` here produced exactly that, with the brand missing from the
   * homepage tab and from search.
   */
  description: SITE.description,

  /**
   * ⚠️ `noindex` is deliberate — remove it only together with the content.
   *
   * Two reasons, both about what is actually on this page today:
   *
   * 1. It is unfinished. The copy is the create-next-app-era "ShopWave"
   *    placeholder — a different product name, a "Backed by Y Combinator" badge
   *    that is not true, and every image a `via.placeholder.com` hotlink.
   *    Indexed, this is the page Google would show for "Brandwik".
   *
   * 2. It duplicates bravo. `brandwik.com` is the real marketing site with the
   *    same job; two near-identical landing pages on two hosts of one brand
   *    compete for the same queries and split the ranking signal.
   *
   * `follow` stays on so link equity still flows through to /onboard/ and
   * /login/, which are indexable and are the pages that should rank.
   *
   * The page is still fully described for social: `noindex` governs search
   * results, not link previews, and someone pasting the bare host into WhatsApp
   * should still see Brandwik rather than a naked URL.
   */
  robots: { index: false, follow: true },

  ...pageSocial({
    path: "/",
    titleFull: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    image: OG_IMAGE.default,
    imageAlt: `${SITE.name} — ${SITE.tagline}`,
  }),
};

export default function Page() {
  return <LandingPage />;
}

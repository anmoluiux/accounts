import type { MetadataRoute } from "next";
import { ABS } from "@/src/lib/seo/config";

/** Required under `output: 'export'` — without it the route is treated as dynamic and never written to `out/`. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          /**
           * Next 16 writes the RSC flight payload for every route beside its
           * HTML — `out/onboard/index.txt`, `out/onboard/__next._full.txt` and
           * friends. They are plain-text copies of the same page content, on
           * crawlable URLs, with no way to add `X-Robots-Tag` on a static host.
           * Left open they are textbook duplicate content: the same words as
           * /onboard/ at a second URL, competing with it.
           *
           * `/__next` catches the `__next.*` family; the `$`-anchored pattern
           * catches `index.txt`. Both anchors are honoured by Google and Bing.
           */
          "/__next",
          "/*index.txt$",
        ],
      },
      /**
       * `/_next/` is deliberately NOT disallowed for anyone.
       *
       * Every stylesheet and JS chunk is served from `/_next/static/`, and
       * Google renders a page before deciding how to index it. Blocking that
       * path means Googlebot sees the DOM with no CSS and no hydration, which
       * scores as a broken, non-mobile-friendly page. It is the single most
       * common self-inflicted Next.js SEO wound.
       */
    ],
    sitemap: ABS("/sitemap.xml"),
  };
}

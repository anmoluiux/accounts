import type { Metadata } from "next";
import PersistBoundary from "@/src/store/PersistBoundary";
import FormSkeleton from "@/src/components/onboarding/shell/FormSkeleton";
import OnboardingFunnel from "@/src/components/onboarding/OnboardingFunnel";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { ABS, OG_IMAGE, SITE, pageSocial } from "@/src/lib/seo/config";
import { breadcrumbSchema, webPageSchema } from "@/src/lib/seo/schema";

const TITLE = "Create your store";
const DESCRIPTION =
  "Pick a name, tell us what you sell, and Brandwik builds your online storefront for you — live in minutes, with no code and no designer.";

/**
 * The most-shared URL on this host: it is where bravo's every CTA points and
 * what a merchant pastes to a partner. Its preview gets its own card.
 *
 * Trailing slash on the canonical is required, not cosmetic — `trailingSlash:
 * true` in next.config.ts means the export emits `out/onboard/index.html` and
 * the live URL is `/onboard/`. A canonical of `/onboard` would name a URL that
 * redirects, which Google reports as "Alternate page with proper canonical tag"
 * and quietly drops from the index.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...pageSocial({
    path: "/onboard/",
    titleFull: `${TITLE} — ${SITE.name}`,
    description: DESCRIPTION,
    image: OG_IMAGE.onboard,
    imageAlt: "Create your online store with Brandwik — three steps to a live storefront",
  }),
};

/**
 * The funnel. A server component so it can export metadata; the step switcher
 * inside it is the client part.
 *
 * The rehydration gate lives here rather than in the shared shell: this is the
 * only route that reads persisted state, so it is the only one that should wait
 * for it. /login would otherwise flash a skeleton waiting on a store it never
 * consults.
 */
export default function OnboardPage() {
  return (
    <>
      {/* Outside PersistBoundary on purpose: the boundary swaps in a skeleton
          until redux-persist rehydrates, and structured data should be in the
          first byte of HTML regardless of client state. */}
      <JsonLd
        id="schema-onboard"
        data={[
          webPageSchema({ path: "/onboard/", name: TITLE, description: DESCRIPTION, image: OG_IMAGE.onboard }),
          breadcrumbSchema([
            { name: SITE.name, url: SITE.marketingUrl },
            { name: TITLE, url: ABS("/onboard/") },
          ]),
        ]}
      />

      <PersistBoundary fallback={<FormSkeleton />}>
        <OnboardingFunnel />
      </PersistBoundary>
    </>
  );
}

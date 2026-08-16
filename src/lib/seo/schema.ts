import { ABS, SITE } from "./config";

type JsonLdNode = Record<string, unknown>;

/**
 * Entity IDs are anchored to the **marketing** domain, not to this host.
 *
 * `bravo/src/lib/seo/schema.ts` declares the full Organization and WebSite
 * nodes under `https://brandwik.com/#organization` and `…/#website`. Reusing
 * those exact IDs here tells Google that accounts.brandwik.com is the same
 * company and the same site — the nodes merge. Minting `accounts.brandwik.com
 * /#organization` instead would describe a *second* company that happens to
 * share a name, and split the entity signal across two hosts.
 *
 * Keep these in sync with bravo. If the marketing site's IDs change, change
 * them here in the same commit.
 */
const ORG_ID = `${SITE.marketingUrl}/#organization`;
const WEBSITE_ID = `${SITE.marketingUrl}/#website`;

/** A pointer to the Organization node rather than a second copy of it. */
export const organizationRef = () => ({ "@id": ORG_ID });

/**
 * A deliberately lean Organization node.
 *
 * bravo emits the authoritative version (founding date, contact points, areas
 * served). This one carries only what identifies the entity, so the two can
 * never contradict each other on a field that only one of them updates.
 *
 * Note what is absent: no `AggregateRating`, no `Review`. The testimonials in
 * `showcase.data.ts` are still marked PLACEHOLDER, and marking up invented
 * ratings is a Google structured-data spam violation that risks a manual action
 * against the whole brandwik.com domain — including the marketing site. Add
 * rating markup only when the reviews behind it are real and attributable.
 */
export function organizationSchema(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.marketingUrl,
    logo: {
      "@type": "ImageObject",
      url: ABS("/icon-512.png"),
      width: 512,
      height: 512,
    },
    sameAs: [...SITE.social],
  };
}

/**
 * A page node on this host, tied back to the shared WebSite and Organization.
 *
 * `WebPage` earns its place on a signup funnel less by ranking better and more
 * by naming the relationship: this URL belongs to the brandwik.com site, is
 * published by the brandwik.com organization, and its preview image is X.
 */
export function webPageSchema({
  path,
  name,
  description,
  image,
}: {
  path: string;
  name: string;
  description: string;
  image: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${ABS(path)}#webpage`,
    url: ABS(path),
    name,
    description,
    inLanguage: SITE.language,
    isPartOf: { "@id": WEBSITE_ID },
    about: organizationRef(),
    publisher: organizationRef(),
    primaryImageOfPage: { "@type": "ImageObject", url: ABS(image) },
  };
}

/**
 * Breadcrumbs.
 *
 * The trail starts at the marketing site because that is where a visitor
 * actually comes from — bravo's CTAs are the only inbound links to this host.
 * Modelling it as `brandwik.com › Create your store` matches reality; pretending
 * accounts.brandwik.com is its own root would not.
 */
export function breadcrumbSchema(trail: ReadonlyArray<{ name: string; url: string }>): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

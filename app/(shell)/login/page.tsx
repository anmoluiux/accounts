import type { Metadata } from "next";
import LoginForm from "@/src/components/auth/LoginForm";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { ABS, OG_IMAGE, SITE, pageSocial } from "@/src/lib/seo/config";
import { breadcrumbSchema, webPageSchema } from "@/src/lib/seo/schema";

const TITLE = "Sign in";
const DESCRIPTION = "Sign in to your Brandwik account to manage your storefront, products and orders.";

/**
 * Indexable, on purpose. "<brand> login" is one of the highest-intent queries a
 * SaaS gets, and it is usually the brand's own login page that should answer
 * it — otherwise the slot goes to a directory or a phishing lookalike.
 *
 * ⚠️ Worth re-checking before this can actually rank: the form posts to
 * `/customer/login` and `/customer/magic-link`, and neither route exists in
 * laracom yet (see the note in src/assets/url.tsx). Submitting today returns a
 * clear "not available yet" message rather than failing silently, and a new
 * host takes weeks to earn any ranking at all, so this is a race the backend
 * should comfortably win. If it does not, flip to `robots: { index: false }`
 * here and drop the entry from app/sitemap.ts.
 *
 * Uses the default social card. A tailored one buys nothing — nobody shares a
 * login link to sell the product.
 */
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  ...pageSocial({
    path: "/login/",
    titleFull: `${TITLE} — ${SITE.name}`,
    description: DESCRIPTION,
    image: OG_IMAGE.default,
    imageAlt: `${SITE.name} — ${SITE.tagline}`,
  }),
};

/**
 * /login — the form only. The split, the showcase panel and the footer all come
 * from the shared layout at `app/(shell)/layout.tsx`, the same instance the
 * funnel uses, so moving between the two does not rebuild the left side.
 *
 * No rehydration gate: nothing here reads persisted state.
 */
export default function LoginPage() {
  return (
    <>
      <JsonLd
        id="schema-login"
        data={[
          webPageSchema({ path: "/login/", name: TITLE, description: DESCRIPTION, image: OG_IMAGE.default }),
          breadcrumbSchema([
            { name: SITE.name, url: SITE.marketingUrl },
            { name: TITLE, url: ABS("/login/") },
          ]),
        ]}
      />
      <LoginForm />
    </>
  );
}

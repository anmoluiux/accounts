import type { Metadata } from "next";
import SplitShell from "@/src/components/onboarding/shell/SplitShell";

/**
 * The 60 / 40 onboarding shell.
 *
 * A server component, which is what makes the split cheap: the showcase panel
 * and the form chrome are prerendered into the static export, and the only
 * JavaScript the route ships is the step itself plus a few small islands
 * (`FormHeader`, the two `SceneSwitch`es and the step-2 scenes).
 *
 * It lives in the layout rather than the page so it survives across steps — the
 * panel never remounts as the funnel advances, so nothing on the left flickers.
 * `SplitShell` is shared with the login route, which passes different flags.
 *
 * Metadata belongs here too: `page.tsx` is a client component and cannot export it.
 */
export const metadata: Metadata = {
  title: "Create your store — Brandwik",
  description: "Pick a name, tell us what you sell, and we build the storefront for you.",
};

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return <SplitShell>{children}</SplitShell>;
}

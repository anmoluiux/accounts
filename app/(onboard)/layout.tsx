import type { Metadata } from "next";
import ShowcasePanel from "@/src/components/onboarding/showcase/ShowcasePanel";
import FormColumn from "@/src/components/onboarding/shell/FormColumn";
import styles from "@/src/components/onboarding/onboard.module.css";

/**
 * The 60 / 40 onboarding shell.
 *
 * A server component, which is what makes the split cheap: the showcase panel
 * and the form chrome are prerendered into the static export, and the only
 * JavaScript the route ships is the step itself plus a few small islands
 * (`FormHeader`, the two `SceneSwitch`es and the step-2 scenes).
 *
 * It lives in the layout rather than the page so it survives across steps — the
 * panel never remounts as the funnel advances, so its carousel keeps its place
 * and nothing on the left flickers.
 *
 * Metadata belongs here too: `page.tsx` is a client component and cannot export it.
 */
export const metadata: Metadata = {
  title: "Create your store — Brandwik",
  description: "Pick a name, tell us what you sell, and we build the storefront for you.",
};

export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <ShowcasePanel />
      <FormColumn>{children}</FormColumn>
    </div>
  );
}

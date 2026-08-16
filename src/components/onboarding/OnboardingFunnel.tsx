"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppSelector } from "@/src/lib/hooks";
import Step1_Prompt from "./Step1_Prompt";
import FormSkeleton from "./shell/FormSkeleton";
import styles from "./onboard.module.css";

// Step2_Vibe / Building / Step5_Reveal still exist on disk but are not rendered.
// They were imported here, which kept all three (plus Building's hardcoded
// localhost API URL) in the shipped bundle. Add one to STEPS to re-enable it.

/**
 * Steps 2 and 3 load on demand; step 1 is bundled normally.
 *
 * The funnel only ever renders one step, but importing all three statically put
 * every dependency of the last two on the critical path of the first —
 * AntD's Select, Checkbox, Progress, Card, Descriptions, Tag and Tooltip plus
 * six icon components, none of which a visitor looking at two text inputs can
 * reach yet. Lighthouse counted it as unused JavaScript, and it is: on mobile
 * the parse cost lands squarely in Total Blocking Time.
 *
 * `ssr: false` costs nothing here. The whole funnel sits inside
 * `PersistBoundary`, which renders `FormSkeleton` until redux-persist
 * rehydrates — so the prerendered HTML never contained a step component
 * anyway, and which step to show is only knowable on the client.
 *
 * The same skeleton is the loading state, so a chunk that has not arrived looks
 * like rehydration rather than a blank panel.
 */
const Details = dynamic(() => import("./Details"), { ssr: false, loading: () => <FormSkeleton /> });
const UserCredentials = dynamic(() => import("./userCredentials"), { ssr: false, loading: () => <FormSkeleton /> });

// Index is the source of truth for `onboarding.currentStep`. Keep this in the
// same order as FUNNEL_STEPS in showcase/showcase.data.ts.
const STEPS = [Step1_Prompt, Details, UserCredentials];

/**
 * The active step, and nothing else.
 *
 * Lives in `src/` rather than being the route's `page.tsx` so that the page can
 * stay a server component and export `metadata` — a client component cannot.
 * All the chrome (the split, the panel, the theme) comes from the shared layout.
 */
export default function OnboardingFunnel() {
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);
  const Step = STEPS[currentStep] ?? STEPS[0];

  /**
   * Warm the next step's chunk while the visitor is still typing into this one.
   *
   * Without this, splitting the steps would trade blocking time at load for a
   * skeleton flash on every Continue — a worse deal, because the flash lands
   * mid-task where it is far more noticeable. Filling in a brand name takes
   * seconds; a ~30 KiB chunk fetched in that window makes the transition
   * indistinguishable from the static import it replaced.
   *
   * Deferred to idle, which is not a detail. Prefetching straight from the
   * effect measurably hurt: it starts the moment hydration does, competing with
   * it for the main thread, and Largest Contentful Paint went from 2.5s to 3.2s
   * — trading a real paint delay for a hypothetical future one. Waiting for the
   * browser to go idle keeps the whole win and none of the cost.
   *
   * `requestIdleCallback` is still unimplemented in Safari, so a timeout stands
   * in there; the exact delay does not matter, only that it clears first paint.
   *
   * Fire-and-forget: a failed prefetch is not an error, it just means the real
   * import pays for itself on advance. `.catch` keeps it from surfacing as an
   * unhandled rejection.
   */
  useEffect(() => {
    const warm = () => {
      if (currentStep === 0) import("./Details").catch(() => {});
      if (currentStep === 1) import("./userCredentials").catch(() => {});
    };

    const ric = typeof window !== "undefined" && window.requestIdleCallback;
    if (ric) {
      const id = ric(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(id);
  }, [currentStep]);

  // Keyed on the step so React remounts on advance and the enter animation
  // replays — the step components already assume a fresh mount (Step1_Prompt
  // re-probes subdomain availability in a mount effect).
  return (
    <div key={currentStep} className={styles.stepEnter}>
      <Step />
    </div>
  );
}

"use client";

import { useAppSelector } from "@/src/lib/hooks";
import Step1_Prompt from "@/src/components/onboarding/Step1_Prompt";
import Details from "@/src/components/onboarding/Details";
import UserCredentials from "@/src/components/onboarding/userCredentials";
import styles from "@/src/components/onboarding/onboard.module.css";

// Step2_Vibe / Building / Step5_Reveal still exist on disk but are not rendered.
// They were imported here, which kept all three (plus Building's hardcoded
// localhost API URL) in the shipped bundle. Add one to STEPS to re-enable it.

// Index is the source of truth for `onboarding.currentStep`. Keep this in the
// same order as FUNNEL_STEPS in showcase/showcase.data.ts, which labels the rail.
const STEPS = [Step1_Prompt, Details, UserCredentials];

/**
 * The active step, and nothing else.
 *
 * All the chrome — 60/40 split, showcase panel, header, footer, AntD theme and
 * the rehydration gate — is in `app/(onboard)/layout.tsx`, which is a server
 * component. This file is the only part of the route that has to be a client
 * component, because picking the step is the only thing here that reads Redux.
 */
export default function OnboardingPage() {
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);
  const Step = STEPS[currentStep] ?? STEPS[0];

  // Keyed on the step so React remounts on advance and the enter animation
  // replays — the step components already assume a fresh mount (Step1_Prompt
  // re-probes subdomain availability in a mount effect).
  return (
    <div key={currentStep} className={styles.stepEnter}>
      <Step />
    </div>
  );
}

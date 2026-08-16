"use client";

import { useAppSelector } from "@/src/lib/hooks";
import { useRehydrated } from "@/src/store/useRehydrated";
import { STEP_COUNT } from "../showcase/showcase.data";
import styles from "../onboard.module.css";

/**
 * "Step 2 of 3" plus a three-segment progress bar, above the form.
 *
 * Deliberately absent on the first step: someone who has just landed has not
 * committed to anything yet, and "Step 1 of 3" up front reads as a warning that
 * two more are coming. It appears once they are actually in the funnel, where
 * the same bar reassures instead. Since the panel's step rail was dropped, this
 * is the only progress signal on the page from step 2 onwards.
 */
export default function FormHeader() {
  const rehydrated = useRehydrated();
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);
  const displayStep = Math.min(Math.max(currentStep, 0), STEP_COUNT - 1);

  // Nothing on step 0, and nothing until persisted state lands — the latter
  // also keeps the prerendered HTML and the hydration render identical, since
  // the static export has no store yet.
  if (!rehydrated || displayStep < 1) return null;

  return (
    <div className={styles.formHeader}>
      <span className={styles.stepCount}>
        Step {displayStep + 1} of {STEP_COUNT}
      </span>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
        aria-valuenow={displayStep + 1}
      >
        {Array.from({ length: STEP_COUNT }, (_, index) => (
          <span
            key={index}
            className={`${styles.progressSegment}${
              index <= displayStep ? ` ${styles.progressSegmentFilled}` : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

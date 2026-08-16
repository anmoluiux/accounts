"use client";

import { useAppSelector } from "@/src/lib/hooks";
import { useRehydrated } from "@/src/store/useRehydrated";
import { STEP_COUNT } from "../showcase/showcase.data";
import styles from "../onboard.module.css";

/**
 * "Step 2 of 3" plus a three-segment progress bar, above the form.
 *
 * It renders immediately with an empty bar and fills in once persisted state
 * lands, instead of blocking paint or claiming step 1 for a returning user.
 * Since the panel's step rail was dropped, this is the *only* progress signal
 * on the page — so it has to be right, and it has to be here, next to the form
 * the customer is actually filling in.
 */
export default function FormHeader() {
  const rehydrated = useRehydrated();
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);
  const displayStep = rehydrated ? Math.min(currentStep, STEP_COUNT - 1) : -1;

  return (
    <div className={styles.formHeader}>
      <span className={styles.stepCount}>
        {rehydrated ? `Step ${displayStep + 1} of ${STEP_COUNT}` : ` `}
      </span>

      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-label="Setup progress"
        aria-valuemin={1}
        aria-valuemax={STEP_COUNT}
        aria-valuenow={rehydrated ? displayStep + 1 : undefined}
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

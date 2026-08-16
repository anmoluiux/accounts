import type { Metadata } from "next";
import SplitShell from "@/src/components/onboarding/shell/SplitShell";

/**
 * The login shell — the same 60 / 40 split as the funnel, different flags.
 *
 * `lockedScene={0}` pins the panel to the themes/proof scene: a visitor who
 * abandoned onboarding at step 3 still has `currentStep: 2` in localStorage,
 * and without this the left side would greet them with "We're putting it
 * together" while they try to sign in.
 *
 * No step header (there are no steps) and no rehydration gate (login reads
 * nothing from persisted state, so waiting on redux-persist would only flash a
 * skeleton for no reason).
 */
export const metadata: Metadata = {
  title: "Sign in — Brandwik",
  description: "Sign in to your Brandwik account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <SplitShell lockedScene={0} showStepHeader={false} gateOnRehydration={false}>
      {children}
    </SplitShell>
  );
}

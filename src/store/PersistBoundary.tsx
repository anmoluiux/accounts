"use client";

import { PersistGate } from "redux-persist/integration/react";
import { usePersistor } from "./ReduxProvider";

/**
 * Opt-in rehydration gate.
 *
 * Wrap a route in this when it must not render until redux-persist has restored
 * localStorage — the onboarding funnel does, because rendering before rehydration
 * would flash step 0 before jumping to the user's saved step.
 *
 * Do NOT put this in the root layout: PersistGate renders `null` until a
 * browser-only post-mount event fires, so anything above it is excluded from the
 * static export and ships as an empty <body>.
 */
export default function PersistBoundary({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  /** Rendered while rehydration is in flight. Defaults to nothing, but pass a
   *  skeleton wherever the gap is user-visible — the funnel does. */
  fallback?: React.ReactNode;
}) {
  const persistor = usePersistor();

  // No persistor (e.g. rendered outside ReduxProvider) — render rather than hang.
  if (!persistor) return <>{children}</>;

  return (
    <PersistGate loading={fallback} persistor={persistor}>
      {children}
    </PersistGate>
  );
}

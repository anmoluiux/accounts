"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePersistor } from "./ReduxProvider";

/**
 * Has redux-persist finished restoring localStorage?
 *
 * `PersistBoundary` is the blunt instrument — it withholds a whole subtree until
 * rehydration. This is the sharp one, for components that must paint immediately
 * from the static export but read persisted state: they render a neutral variant
 * until this flips true. The onboarding step rail uses it so the showcase panel
 * is never blank, yet never shows "step 1" to someone resuming at step 3.
 */
export function useRehydrated(): boolean {
  const persistor = usePersistor();

  const subscribe = useCallback(
    (onChange: () => void) => persistor?.subscribe(onChange) ?? (() => {}),
    [persistor]
  );

  return useSyncExternalStore(
    subscribe,
    // No persistor (rendered outside ReduxProvider) means nothing to wait for.
    () => (persistor ? persistor.getState().bootstrapped : true),
    () => false
  );
}

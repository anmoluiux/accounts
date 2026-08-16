"use client";

import { useAppSelector } from "@/src/lib/hooks";
import { useRehydrated } from "@/src/store/useRehydrated";
import { BUILD_STAGES, BUILD_STATUS_RANK } from "../showcase.data";

/**
 * The live store build, read from persisted state.
 *
 * Nothing here fetches: `userCredentials.tsx` already polls
 * /customer/store/status every 4s and writes the result into
 * `users[customer_id].status`. A second poller would double laracom's load to
 * show the same number twice.
 *
 * Shared by `LaunchHeadline` and `LaunchScene`, which sit in different zones of
 * the panel and must agree on what is happening.
 */
export function useBuildStatus() {
  // Both consumers stay mounted even when their scene is hidden, so without
  // gating on rehydration the prerendered HTML (no store yet) and the hydration
  // render (store possibly already restored) disagree and React throws a
  // hydration mismatch. Until this flips, report the neutral "queued" state —
  // exactly what the static export contains.
  const rehydrated = useRehydrated();

  const persistedStatus = useAppSelector((state) => {
    const id = state.onboarding.customer_id;
    return (id ? state.onboarding.users[id]?.status?.status : undefined) as string | undefined;
  });

  const persistedSubdomain = useAppSelector((state) => {
    const id = state.onboarding.customer_id;
    return (id ? state.onboarding.users[id]?.site?.subdomain : undefined) as string | undefined;
  });

  const status = rehydrated ? persistedStatus : undefined;
  const failed = status === "FAILED";

  // Unknown status ranks 0: the job is queued but has not reported yet, so the
  // first stage reads as in progress rather than the whole list looking dead.
  const rank = failed ? -1 : BUILD_STATUS_RANK[status ?? ""] ?? 0;

  return {
    status,
    subdomain: rehydrated ? persistedSubdomain : undefined,
    failed,
    complete: status === "COMPLETED",
    rank,
    // Exactly one stage is "Working": the first that has not finished. Derived
    // once rather than per-stage, which is how you end up with three rows
    // spinning at the same time.
    runningIndex: failed ? -1 : BUILD_STAGES.findIndex((stage) => rank <= stage.reachedAt),
  };
}

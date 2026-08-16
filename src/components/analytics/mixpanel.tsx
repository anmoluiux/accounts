"use client";

import { useEffect } from "react";

export default function AnalyticsMixpanel() {
  useEffect(() => {
    let cancelled = false;

    /**
     * Imported here rather than at module scope, and the difference is large.
     *
     * A static `import mixpanel from "mixpanel-browser"` is resolved by the
     * bundler, not by the `ANALYTICS_ENABLED` check that guards this component
     * in app/layout.tsx — so the whole library shipped in the initial bundle on
     * every route even with analytics switched off. Lighthouse measured it: a
     * 97 KiB chunk that was 96 KiB unused, ~420 KiB to parse, on the critical
     * path of a three-field form.
     *
     * As a dynamic import it becomes its own async chunk that is only fetched
     * if this component actually renders — never when analytics are off, and
     * after hydration rather than before it when they are on.
     */
    import("mixpanel-browser").then(({ default: mixpanel }) => {
      if (cancelled) return;

      mixpanel.init("480230acecd6e86d79703295632fb1f7", {
        autocapture: true,
        record_sessions_percent: 100,
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    });

    // React 18+ mounts effects twice in development. Without this the second
    // run could init a library instance the first run already tore down.
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

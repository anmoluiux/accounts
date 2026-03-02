"use client";

import { useEffect } from "react";
import mixpanel from "mixpanel-browser";

export default function AnalyticsMixpanel() {
  useEffect(() => {
    mixpanel.init("480230acecd6e86d79703295632fb1f7", {
      autocapture: true,
      record_sessions_percent: 100,
      debug: true,
      ignore_dnt: true,
      track_pageview: true,
    });
  }, []);

  return null;
}
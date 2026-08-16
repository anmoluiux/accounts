"use client";

import { useBuildStatus } from "./useBuildStatus";
import styles from "../Showcase.module.css";

/**
 * The header headline for step 2, which has three states rather than one.
 *
 * Split out from `LaunchScene` because the panel's headline and body now live
 * in separate zones of the layout with the theme row between them. Both read
 * the same build status through `useBuildStatus`, so the wording and the stage
 * list can never disagree.
 */
export default function LaunchHeadline() {
  const { failed, complete } = useBuildStatus();

  if (failed) return <h1 className={styles.headline}>That didn&apos;t go through.</h1>;

  if (complete) {
    return (
      <h1 className={styles.headline}>
        You&apos;re <span className={styles.headlineAccent}>live.</span>
      </h1>
    );
  }

  return (
    <h1 className={styles.headline}>
      We&apos;re putting it <span className={styles.headlineAccent}>together.</span>
    </h1>
  );
}

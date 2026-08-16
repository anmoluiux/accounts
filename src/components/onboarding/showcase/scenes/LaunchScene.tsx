"use client";

import { MAIN_SITE_URL } from "@/src/assets/url";
import { BUILD_STAGES } from "../showcase.data";
import { useBuildStatus } from "./useBuildStatus";
import styles from "../Showcase.module.css";

/**
 * Scene 2 body — the build, stage by stage, and the live address when it lands.
 *
 * Body only: the headline for this step lives in `LaunchHeadline`, in the
 * panel's header zone. Both read `useBuildStatus`, so they cannot disagree.
 */
export default function LaunchScene() {
  const { failed, complete, rank, runningIndex, subdomain } = useBuildStatus();

  return (
    <section className={styles.stages} aria-label="Build progress">
      <p className={styles.sectionLabel}>
        {failed
          ? "Nothing is lost — your details are saved."
          : complete
            ? "Everything below is ready"
            : "A couple of minutes, give or take"}
      </p>

      <ol className={styles.stageList}>
        {BUILD_STAGES.map((stage, index) => {
          const isDone = !failed && rank > stage.reachedAt;
          const isRunning = index === runningIndex;

          return (
            <li
              key={stage.id}
              className={[
                styles.stageItem,
                isDone ? styles.stageItemDone : "",
                isRunning ? styles.stageItemRunning : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className={styles.stageGlyph} aria-hidden="true">
                {isDone ? <TickIcon /> : <span className={styles.stageDot} />}
              </span>
              <span className={styles.stageLabel}>{stage.label}</span>
              <span className={styles.stageState}>{isDone ? "Done" : isRunning ? "Working" : "Queued"}</span>
            </li>
          );
        })}
      </ol>

      {complete && subdomain && MAIN_SITE_URL && (
        <a
          className={styles.stageLink}
          href={`https://${subdomain}.${MAIN_SITE_URL}`}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.stageLinkDot} aria-hidden="true" />
          {subdomain}.{MAIN_SITE_URL}
          <ArrowIcon />
        </a>
      )}
    </section>
  );
}

function TickIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8.5 6.2 11.7 13 4.9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12 12 4M6 4h6v6" />
    </svg>
  );
}

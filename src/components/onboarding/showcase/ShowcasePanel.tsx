import styles from "./Showcase.module.css";
import SceneSwitch from "./SceneSwitch";
import TestimonialMarquee from "./TestimonialMarquee";
import ThemesScene from "./scenes/ThemesScene";
import IncludedScene from "./scenes/IncludedScene";
import LaunchScene from "./scenes/LaunchScene";
import LaunchHeadline from "./scenes/LaunchHeadline";
import { PROOF } from "./showcase.data";

/**
 * Left 60% of the onboarding shell — three zones, pushed apart.
 *
 *   header   brand + one headline, nothing else
 *   centre   what you get, changing with the step
 *   footer   testimonials, edge to edge, looping
 *
 * The zones are spaced with `justify-content: space-between` rather than packed
 * with gaps, so the panel breathes at any viewport height instead of stacking
 * five competing blocks down the left side.
 *
 * A server component — no `"use client"`. With `output: 'export'` the whole
 * panel is baked into `out/onboard/index.html`: brand, headline, theme mockups
 * and every testimonial paint with no JS on the wire. Only `SceneSwitch` and
 * the step-2 scenes hydrate, and the marquee's loop is pure CSS.
 *
 * Content comes from `showcase.data.ts` — the quotes there are placeholders.
 */
export default function ShowcasePanel() {
  return (
    <aside className={styles.panel} aria-label="About Brandwik">
      <div className={styles.panelInner}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.mark} aria-hidden="true">
              B
            </span>
            <span className={styles.wordmark}>brandwik</span>
          </div>

          {/* Index matches `onboarding.currentStep`, same as the body below. */}
          <SceneSwitch
            className={styles.headlineStage}
            scenes={[
              <h1 key="0" className={styles.headline}>
                Your store, live before your{" "}
                <span className={styles.headlineAccent}>coffee gets cold.</span>
              </h1>,
              <h1 key="1" className={styles.headline}>
                Everything included. <span className={styles.headlineAccent}>Nothing to install.</span>
              </h1>,
              <LaunchHeadline key="2" />,
            ]}
          />
        </header>

        <SceneSwitch
          className={styles.bodyStage}
          scenes={[<ThemesScene key="0" />, <IncludedScene key="1" />, <LaunchScene key="2" />]}
        />
      </div>

      {/* Outside `.panelInner` on purpose: "end to end" means the panel's edges,
          and a child of the padded content column can only ever bleed to that
          column's edges, not the panel's. */}
      <TestimonialMarquee items={PROOF} />
    </aside>
  );
}

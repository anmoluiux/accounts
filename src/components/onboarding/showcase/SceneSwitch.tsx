"use client";

import { useAppSelector } from "@/src/lib/hooks";
import { useRehydrated } from "@/src/store/useRehydrated";
import styles from "./Showcase.module.css";

/**
 * Shows one of N server-rendered scenes, chosen by the funnel step.
 *
 * Used twice in the panel — once for the headline in the header, once for the
 * body in the centre — because those two now sit in different zones of the
 * layout with the theme row and marquee between them. Two instances rather than
 * one component owning the whole panel: each reads `currentStep` itself, which
 * is a cheap selector on a primitive, and neither has to know where the other
 * one renders.
 *
 * The scenes arrive as already-rendered elements from the server component
 * above, so scene *content* stays out of the client bundle; this file is just
 * the switch.
 *
 * All scenes stay mounted, stacked in one grid cell, so the zone is as tall as
 * its tallest scene and nothing below it shifts as the step changes. Inactive
 * ones get `inert` + `aria-hidden`, keeping them out of the tab order and the
 * accessibility tree.
 */
export default function SceneSwitch({
  scenes,
  className,
  lockedScene,
}: {
  scenes: React.ReactNode[];
  className?: string;
  /** Pin to one scene and ignore the funnel step. The login route uses this:
   *  a visitor who abandoned at step 3 must not be greeted by "We're putting it
   *  together" when they come back to sign in. */
  lockedScene?: number;
}) {
  const rehydrated = useRehydrated();
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);

  // Scene 0 until localStorage is read — right for a new visitor, and what the
  // static HTML already contains. A returning visitor sees one cross-fade to
  // their real scene as rehydration lands.
  const fromStore = rehydrated ? Math.min(Math.max(currentStep, 0), scenes.length - 1) : 0;
  const activeIndex = lockedScene ?? fromStore;

  return (
    <div className={className ? `${styles.stage} ${className}` : styles.stage}>
      {scenes.map((scene, index) => {
        const isActive = index === activeIndex;

        return (
          <div
            key={index}
            className={`${styles.scene}${isActive ? ` ${styles.sceneActive}` : ""}`}
            aria-hidden={!isActive}
            inert={!isActive}
          >
            {scene}
          </div>
        );
      })}
    </div>
  );
}

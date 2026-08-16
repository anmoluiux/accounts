"use client";

import { usePathname } from "next/navigation";
import { useAppSelector } from "@/src/lib/hooks";
import { useRehydrated } from "@/src/store/useRehydrated";
import { IN_FUNNEL } from "@/src/lib/routes";
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
}: {
  scenes: React.ReactNode[];
  className?: string;
}) {
  const pathname = usePathname();
  const rehydrated = useRehydrated();
  const currentStep = useAppSelector((state) => state.onboarding.currentStep);

  // Scene 0 until localStorage is read — right for a new visitor, and what the
  // static HTML already contains. A returning visitor sees one cross-fade to
  // their real scene as rehydration lands.
  //
  // Off the funnel there is no current step, so scene 0 stands: /login shares
  // this panel, and someone who abandoned at step 3 must not be greeted by
  // "We're putting it together" while trying to sign in.
  const inFunnel = IN_FUNNEL(pathname);
  const activeIndex = inFunnel && rehydrated ? Math.min(Math.max(currentStep, 0), scenes.length - 1) : 0;

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

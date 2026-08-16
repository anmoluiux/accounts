import ShowcasePanel from "../showcase/ShowcasePanel";
import FormColumn from "./FormColumn";
import styles from "../onboard.module.css";

/**
 * The 60 / 40 split: showcase panel on the left, form column on the right.
 *
 * Rendered once, by the single shared layout at `app/(shell)/layout.tsx`, so
 * this exact instance is reused across /onboard and /login. That is what keeps
 * the panel — and the marquee's animation — alive across navigation between
 * them.
 *
 * Deliberately propless. It used to take `lockedScene` / `showStepHeader` /
 * `gateOnRehydration` so two sibling layouts could configure it differently;
 * those two layouts were the reason the panel remounted. Each of those knobs now
 * lives with the component that actually cares about it.
 *
 * A server component, so both routes keep prerendering the panel into the static
 * export with no client JS beyond the scene switches.
 */
export default function SplitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <ShowcasePanel />
      <FormColumn>{children}</FormColumn>
    </div>
  );
}

import ShowcasePanel from "../showcase/ShowcasePanel";
import FormColumn from "./FormColumn";
import styles from "../onboard.module.css";

/**
 * The 60 / 40 split, shared by every route that puts a form beside the showcase
 * panel — the onboarding funnel and the login screen.
 *
 * Extracted so "left side stays the same, only the form changes" is enforced by
 * the code rather than by remembering to keep two layouts in sync. Each route's
 * `layout.tsx` is now three lines and a config object.
 *
 * A server component, so both routes keep prerendering the panel into the
 * static export with no client JS beyond the scene switches.
 */
export default function SplitShell({
  children,
  lockedScene,
  showStepHeader = true,
  gateOnRehydration = true,
}: {
  children: React.ReactNode;
  lockedScene?: number;
  showStepHeader?: boolean;
  gateOnRehydration?: boolean;
}) {
  return (
    <div className={styles.shell}>
      <ShowcasePanel lockedScene={lockedScene} />
      <FormColumn showStepHeader={showStepHeader} gateOnRehydration={gateOnRehydration}>
        {children}
      </FormColumn>
    </div>
  );
}

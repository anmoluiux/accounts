import PersistBoundary from "@/src/store/PersistBoundary";
import { MARKETING_URL } from "@/src/assets/url";
import FormHeader from "./FormHeader";
import FormSkeleton from "./FormSkeleton";
import OnboardTheme from "./OnboardTheme";
import styles from "../onboard.module.css";

/**
 * Right 40% of the onboarding shell: header, the active step, footer.
 *
 * Deliberately NOT a client component. It renders client components
 * (`FormHeader`, `OnboardTheme`, `PersistBoundary`) and passes the step through
 * as `children`, which keeps the `"use client"` boundary on the leaves that
 * actually need state. The chrome around the form — header row, footer, legal
 * links — ships as static HTML.
 *
 * `PersistBoundary` wraps only the step, not the column. The old funnel gated
 * the entire route on rehydration, so the whole page was blank until
 * localStorage was read; now the showcase panel and this chrome paint first and
 * only the form itself waits.
 */
export default function FormColumn({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.formColumn}>
      <div className={styles.formInner}>
        <FormHeader />

        <div className={styles.formBody}>
          <OnboardTheme>
            <PersistBoundary fallback={<FormSkeleton />}>{children}</PersistBoundary>
          </OnboardTheme>
        </div>

        <div className={styles.formFooter}>
          <span>© {new Date().getFullYear()} Brandwik</span>
          <a href={`${MARKETING_URL}/privacy`} target="_blank" rel="noreferrer">
            Privacy
          </a>
          <a href={`${MARKETING_URL}/terms`} target="_blank" rel="noreferrer">
            Terms
          </a>
        </div>
      </div>
    </main>
  );
}

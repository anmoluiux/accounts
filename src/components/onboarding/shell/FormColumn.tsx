import { MARKETING_URL } from "@/src/assets/url";
import FormHeader from "./FormHeader";
import OnboardTheme from "./OnboardTheme";
import styles from "../onboard.module.css";

/**
 * Right 40% of the shell: step counter, the page's own content, footer.
 *
 * Shared by /onboard and /login — one instance, from the single layout above.
 *
 * Deliberately NOT a client component. It renders client components
 * (`FormHeader`, `OnboardTheme`) and passes the page through as `children`,
 * which keeps the `"use client"` boundary on the leaves that actually need
 * state. The chrome — header row, footer, legal links — ships as static HTML.
 *
 * The rehydration gate is NOT here: only /onboard reads persisted state, so that
 * route wraps its own content in `PersistBoundary`. Gating the shared column
 * would make /login wait on a store it never reads.
 */
export default function FormColumn({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.formColumn}>
      <div className={styles.formInner}>
        {/* Renders null off the funnel and on step 0 — those rules live in the
            component, so `.formInner`'s flex gap collapses with it and neither
            case leaves phantom space where the counter would be. */}
        <FormHeader />

        <div className={styles.formBody}>
          <OnboardTheme>{children}</OnboardTheme>
        </div>
      </div>

      {/* Outside `.formInner` so it spans the whole column: that wrapper caps
          itself at the form's reading width (500px), and a child of it can only
          ever be that wide. It carries its own inline padding instead. */}
      <div className={styles.formFooter}>
        <span>© {new Date().getFullYear()} Brandwik</span>

        {/* Grouped so `space-between` has two things to separate — with all
            three as siblings it would spread the copyright and both links
            evenly across the column instead of pinning the links right. */}
        <span className={styles.footerLinks}>
          <a href={`${MARKETING_URL}/privacy`} target="_blank" rel="noreferrer">
            Privacy
          </a>
          <a href={`${MARKETING_URL}/terms`} target="_blank" rel="noreferrer">
            Terms
          </a>
        </span>
      </div>
    </main>
  );
}

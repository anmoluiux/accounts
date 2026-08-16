import styles from "../onboard.module.css";

/**
 * Placeholder shown while redux-persist rehydrates.
 *
 * The old funnel passed `loading={null}` to PersistGate, so the form column was
 * empty until localStorage was read and then the real step appeared — a flash of
 * nothing, then a jump. This holds the same vertical rhythm as a step, so the
 * swap is a cross-fade rather than a reflow. No client JS: pure CSS animation.
 */
export default function FormSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={`${styles.skeletonBar} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonInput}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonInput}`} />
      <div className={`${styles.skeletonBar} ${styles.skeletonButton}`} />
    </div>
  );
}

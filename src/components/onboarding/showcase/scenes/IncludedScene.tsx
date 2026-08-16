import { INCLUDED, type Included } from "../showcase.data";
import styles from "../Showcase.module.css";

/**
 * Scene 1 body — shown while the customer is filling in details.
 *
 * They are already sold by this point; what they need is a reason to finish a
 * longer form. So the panel stops selling and starts describing: the fields
 * you are typing turn into this. Server component, zero client JS.
 */
export default function IncludedScene() {
  return (
    <section aria-label="What every store includes">
      <p className={styles.sectionLabel}>Every store ships with</p>

      <ul className={styles.includedGrid}>
        {INCLUDED.map((item) => (
          <li key={item.id} className={styles.includedTile}>
            <span className={styles.includedIcon} aria-hidden="true">
              <IncludedIcon name={item.icon} />
            </span>
            <span className={styles.includedTitle}>{item.title}</span>
            <span className={styles.includedLine}>{item.line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* Inline so this subtree stays free of an icon package. Single stroke weight
   across all four, to match the tick and star elsewhere in the panel. */
function IncludedIcon({ name }: { name: Included["icon"] }) {
  const paths: Record<Included["icon"], React.ReactNode> = {
    storefront: (
      <>
        <path d="M3 7.5 4.5 3h11L17 7.5" />
        <path d="M3 7.5v9h14v-9" />
        <path d="M3 7.5a2.4 2.4 0 0 0 4.7 0 2.4 2.4 0 0 0 4.6 0 2.4 2.4 0 0 0 4.7 0" />
      </>
    ),
    payments: (
      <>
        <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
        <path d="M2.5 8.5h15" />
        <path d="M5.5 12.5h3" />
      </>
    ),
    shield: (
      <>
        <path d="M10 2.5 16.5 5v5c0 3.4-2.6 6.2-6.5 7.5C6.1 16.2 3.5 13.4 3.5 10V5Z" />
        <path d="M7.3 9.9 9.3 12l3.4-3.9" />
      </>
    ),
    admin: (
      <>
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
        <path d="M2.5 7.5h15" />
        <path d="M7 7.5v9" />
      </>
    ),
  };

  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

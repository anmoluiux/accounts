import { SOURCE_LABEL, type Proof } from "./showcase.data";
import styles from "./Showcase.module.css";

/**
 * The panel's footer band: testimonials scrolling edge to edge, forever.
 *
 * No client JS at all — the loop is a CSS animation, pause-on-hover is `:hover`,
 * and `prefers-reduced-motion` stops it in the stylesheet. That matters here
 * more than usual: this runs on every step, so a JS-driven ticker would be the
 * one thing on the panel burning frames the whole time the customer types.
 *
 * The list is rendered twice and the track slides exactly one copy's width, so
 * the loop is seamless. Spacing is per-card `margin-right` rather than a flex
 * `gap`: with `gap`, the track's total width is `2×items + (2n−1)×gap`, whose
 * half is not one copy, and the seam drifts a few pixels every lap. The second
 * copy is `aria-hidden` so each quote is announced once.
 */
export default function TestimonialMarquee({ items }: { items: readonly Proof[] }) {
  return (
    <section className={styles.marquee} aria-label="What merchants say">
      <div className={styles.marqueeTrack}>
        <ProofRow items={items} />
        <ProofRow items={items} duplicate />
      </div>
    </section>
  );
}

function ProofRow({ items, duplicate = false }: { items: readonly Proof[]; duplicate?: boolean }) {
  return (
    <ul className={styles.marqueeRow} aria-hidden={duplicate || undefined}>
      {items.map((item) => (
        <li key={item.id} className={styles.marqueeCard}>
          <div className={styles.marqueeHead}>
            <Stars rating={item.rating} />
            <span className={styles.sourceChip}>
              <SourceMark source={item.source} />
              {SOURCE_LABEL[item.source]}
            </span>
          </div>

          <blockquote className={styles.marqueeQuote}>“{item.quote}”</blockquote>

          <div className={styles.marqueeWho}>
            <span className={styles.marqueeAvatar} aria-hidden="true">
              {item.initials}
            </span>
            <span>
              <span className={styles.marqueeName}>{item.name}</span>
              <span className={styles.marqueeRole}>{item.role}</span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    // `role="img"` is required, not decorative: `aria-label` is prohibited on a
    // bare <span>, because a span has no implicit role for the label to name —
    // so screen readers discard it and the rating is announced as five
    // meaningless graphics. The role makes the group a single labelled image.
    <span className={styles.stars} role="img" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={i < rating ? styles.starOn : styles.starOff}
          width="12"
          height="12"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6 4.8 17.5 6 11.7 1.6 7.7l5.9-.7z" />
        </svg>
      ))}
    </span>
  );
}

/* A neutral glyph, not the platform's actual logo — reproducing those marks is
   a trademark question, and the name in text is what does the attributing. */
function SourceMark({ source }: { source: Proof["source"] }) {
  if (source === "google") {
    return (
      <span className={styles.sourceMark} aria-hidden="true">
        G
      </span>
    );
  }

  return (
    <svg className={styles.sourceMark} width="10" height="10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6 4.8 17.5 6 11.7 1.6 7.7l5.9-.7z" />
    </svg>
  );
}

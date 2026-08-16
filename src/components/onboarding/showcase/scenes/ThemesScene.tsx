import { THEMES, type Theme } from "../showcase.data";
import styles from "../Showcase.module.css";

/**
 * Scene 0 body — "here's what you could be running".
 *
 * One row, bleeding off the right edge of the panel so it reads as a longer
 * gallery than the space allows rather than a tidy set of four. Server
 * component: the row is native horizontal scroll with scroll-snap, so touch
 * swipe and keyboard scrolling come free and nothing here hydrates.
 */
export default function ThemesScene() {
  return (
    <section className={styles.themes} aria-label="Store themes">
      <p className={styles.sectionLabel}>Start from a theme</p>

      <ul className={styles.themeRow}>
        {THEMES.map((theme) => (
          <li key={theme.id} className={styles.themeCard}>
            <ThemeShot theme={theme} />
            <span className={styles.themeMeta}>
              <span className={styles.themeName}>{theme.name}</span>
              <span className={styles.themeTag}>{theme.tag}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * A storefront, drawn in CSS.
 *
 * Not a screenshot on purpose — inventing storefronts that don't exist, or
 * borrowing real ones, both misrepresent the product. This is legibly a mockup.
 * Set `preview` on a theme and the real image takes over.
 *
 * Palette arrives as custom properties so one set of rules covers every theme,
 * light or dark, with no per-theme CSS.
 */
function ThemeShot({ theme }: { theme: Theme }) {
  if (theme.preview) {
    // eslint-disable-next-line @next/next/no-img-element -- images are unoptimized in a static export; next/image adds nothing here
    return <img className={styles.themeShot} src={theme.preview} alt="" loading="lazy" />;
  }

  return (
    <span
      className={styles.themeShot}
      style={
        {
          "--t-bg": theme.bg,
          "--t-accent": theme.accent,
          "--t-ink": theme.ink,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <span className={styles.themeChrome}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.themeHero}>
        <span className={styles.themeHeroBar} />
        <span className={styles.themeHeroBarShort} />
      </span>
      <span className={styles.themeGrid}>
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

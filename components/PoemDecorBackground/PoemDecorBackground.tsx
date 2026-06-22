import styles from "./PoemDecorBackground.module.css";

/** Subtle Belarusian ornament layer for poem pages without video. */
export function PoemDecorBackground() {
  return (
    <div className={styles.root} aria-hidden>
      <img
        src="/images/decor/stork-left.svg"
        alt=""
        className={styles.storkLeft}
        draggable={false}
      />
      <img
        src="/images/decor/stork-right.svg"
        alt=""
        className={styles.storkRight}
        draggable={false}
      />
      <img
        src="/images/decor/ornament.svg"
        alt=""
        className={styles.ornament}
        draggable={false}
      />
    </div>
  );
}

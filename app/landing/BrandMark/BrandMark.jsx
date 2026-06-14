import styles from "./BrandMark.module.css";

export default function BrandMark({ className = "", size = "default" }) {
  const sizeClass = size === "large" ? styles.large : "";

  return (
    <p
      className={`${styles.brandMark} ${sizeClass} ${className}`.trim()}
      aria-label="모여라 Moyora"
    >
      <span className={styles.brandKr}>모여라</span>
      <span className={styles.brandDivider} aria-hidden="true" />
      <span className={styles.brandEn}>Moyora</span>
    </p>
  );
}

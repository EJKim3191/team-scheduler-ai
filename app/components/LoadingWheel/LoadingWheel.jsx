import styles from "./LoadingWheel.module.css";

export default function LoadingWheel({
  label,
  size = "md",
  centered = false,
  className = "",
}) {
  const sizeClass = styles[size] ?? styles.md;

  return (
    <div
      className={`${styles.wrap} ${centered ? styles.centered : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label || "로딩 중"}
    >
      <div className={`${styles.wheel} ${sizeClass}`} aria-hidden="true" />
      {label ? <p className={styles.label}>{label}</p> : null}
    </div>
  );
}

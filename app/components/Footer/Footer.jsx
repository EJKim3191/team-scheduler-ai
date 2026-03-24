import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.version}>v0.0.2</span>
      <a
        className={styles.link}
        href="https://github.com/EJKim3191/team-scheduler-ai"
        target="_blank"
        rel="noopener noreferrer"
      >
        github.com/EJKim3191/team-scheduler-ai
      </a>
    </footer>
  );
}

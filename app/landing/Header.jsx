import styles from "./Landing.module.css";
import Link from "next/link";

function Header() {
  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <span className={styles.brand}>AI 팀 싱크</span>
        <Link className={styles.navLink} href="/login">
          로그인
        </Link>
      </div>
    </header>
  );
}

export default Header;

import styles from "./OverviewSection.module.css";

export default function OverviewSection() {
  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>시스템 상태</h2>
          <div className={styles.cardMeta}>오늘 기준</div>
        </div>
        <div className={styles.statusRow}>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>업타임</div>
            <div className={styles.statusValue}>99.98%</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>미처리 요청</div>
            <div className={styles.statusValue}>0</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>에러</div>
            <div className={styles.statusValue}>2</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>최근 활동</h2>
        <ul className={styles.activityList}>
          <li>
            팀 코드가 생성되었습니다: <span className={styles.mono}>AB12CD</span>
          </li>
          <li>
            일정 동기화 작업이 완료되었습니다:{" "}
            <span className={styles.mono}>2026-05-27</span>
          </li>
          <li>
            권한 변경이 발생했습니다:{" "}
            <span className={styles.mono}>관리자 → 편집</span>
          </li>
        </ul>
      </div>
    </>
  );
}


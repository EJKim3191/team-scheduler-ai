import styles from "./TeamsSection.module.css";

export default function TeamsSection() {
  const rows = [
    { name: "Design Squad", members: 7, status: "활성" },
    { name: "Dev Guild", members: 12, status: "활성" },
    { name: "Research Lab", members: 5, status: "대기" },
  ];

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>팀 목록</h2>
          <div className={styles.cardMeta}>예시 UI</div>
        </div>
        <div className={styles.table}>
          <div className={styles.tableRowHeader}>
            <div>팀명</div>
            <div>멤버</div>
            <div>상태</div>
          </div>
          {rows.map((row) => (
            <div key={row.name} className={styles.tableRow}>
              <div className={styles.tableCellPrimary}>{row.name}</div>
              <div className={styles.tableCell}>{row.members}</div>
              <div className={styles.tableCell}>
                <span
                  className={`${styles.badge} ${
                    row.status === "활성" ? styles.badgeActive : ""
                  }`}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>초대/권한 관리</h2>
        <p className={styles.cardDescription}>
          추후 팀 초대 코드 생성, 팀 역할(관리자/일반) 관리 기능을 연결하세요.
        </p>
      </div>
    </>
  );
}


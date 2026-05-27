import styles from "./SettingsSection.module.css";

export default function SettingsSection() {
  const items = [
    {
      title: "기본 알림 정책",
      desc: "일정 변경 시 사용자에게 알림을 보냅니다.",
    },
    {
      title: "데이터 보존 기간",
      desc: "로그/이력의 보관 기간을 설정합니다.",
    },
    {
      title: "보안 설정",
      desc: "세션 정책 및 접근 제어를 강화합니다.",
    },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>관리자 설정</h2>
        <div className={styles.cardMeta}>예시 UI</div>
      </div>
      <div className={styles.settingsGrid}>
        {items.map((s) => (
          <div key={s.title} className={styles.settingsItem}>
            <h3 className={styles.settingsTitle}>{s.title}</h3>
            <p className={styles.settingsDesc}>{s.desc}</p>
            <button type="button" className={styles.linkButton}>
              설정하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


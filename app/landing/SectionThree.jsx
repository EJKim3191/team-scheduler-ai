import styles from "./Landing.module.css";

function SectionThree() {
  return (
    <section className={styles.snapSection} aria-label="푸터">
      <div className={styles.sectionInner}>
        <footer className={`${styles.foot} ${styles.snapReveal}`}>
          © {new Date().getFullYear()} AI 팀 싱크 · 소개 문구·카피는 이후에
          다듬을 수 있습니다.
        </footer>
      </div>
    </section>
  );
}

export default SectionThree;

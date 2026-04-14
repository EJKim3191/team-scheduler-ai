import styles from "./Landing.module.css";
import Link from "next/link";

function SectionOne() {
  return (
    <section className={styles.snapSection} aria-labelledby="lp-hero-heading">
      <div className={styles.sectionInner}>
        <div className={styles.snapReveal}>
          <p className={styles.eyebrow}>Team scheduling</p>
          <h1 id="lp-hero-heading" className={styles.title}>
            <span className={styles.titleGradient}>팀 일정을</span>
            <br />
            말로 정리하고, 한눈에 맞추세요.
          </h1>
          <p className={styles.lead}>
            AI 팀 싱크는 회의·교대·마감 일정을 빠르게 조율할 수 있도록 돕는
            도구입니다. 여기에는 서비스에 대한 대략적인 소개와 핵심 가치가
            들어갑니다. 문구는 나중에 교체하시면 됩니다.
          </p>
          <div className={styles.actions}>
            <Link className={styles.cta} href="/login">
              시작하기
            </Link>
            <span className={styles.ghost}>
              이미 계정이 있으신가요? 상단에서 로그인
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionOne;

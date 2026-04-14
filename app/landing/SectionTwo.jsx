import styles from "./Landing.module.css";

function SectionTwo() {
  return (
    <section
      className={styles.snapSection}
      aria-labelledby="lp-features-heading"
    >
      <div className={styles.sectionInner}>
        <div className={styles.snapReveal}>
          <h2 id="lp-features-heading" className={styles.sectionLabel}>
            이런 흐름을 염두에 두었어요
          </h2>
          <div className={styles.grid}>
            <article className={styles.card}>
              <h3>빠른 입력</h3>
              <p>
                자연어로 일정 후보를 적고, 팀이 이해하기 쉬운 형태로 정리합니다.
              </p>
            </article>
            <article className={styles.card}>
              <h3>한곳에서 싱크</h3>
              <p>
                흩어진 대화 대신 한 화면에서 가능한 시간과 충돌을 확인합니다.
              </p>
            </article>
            <article className={styles.card}>
              <h3>가볍게 시작</h3>
              <p>복잡한 설정 없이 팀 코드와 계정으로 바로 써볼 수 있습니다.</p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectionTwo;

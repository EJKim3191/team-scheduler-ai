import LandingContent from "./LandingContent";
import styles from "./Landing.module.css";

export const metadata = {
  title: "AI 팀 싱크 — 팀 일정, 한곳에서",
  description:
    "AI가 팀 일정 조율을 돕는 가벼운 협업 도구. 소개와 시작하기를 위한 랜딩 페이지입니다.",
};

export default function LandingPage() {
  return (
    <main className={styles.root}>
      <LandingContent />
    </main>
  );
}

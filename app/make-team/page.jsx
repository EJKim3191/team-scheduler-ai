"use client";

import { useState } from "react";

import styles from "./Make-team.module.css";

export default function MakeTeamPage() {
  const [teamCode, setTeamCode] = useState("");

  const onCreateTeam = () => {
    // TODO: 팀 생성 플로우 연결
  };

  const onTeamCodeChange = (e) => {
    setTeamCode(e.target.value);
  };

  return (
    <main className={styles.page}>
      <div className={styles.bg} aria-hidden />

      <div className={styles.createZone}>
        <button type="button" className={styles.textAction} onClick={onCreateTeam}>
          <span className={styles.textActionLabel}>새로운 팀을 만들어보세요</span>
          <span className={styles.textActionArrow} aria-hidden>
            →
          </span>
        </button>
      </div>

      <section className={styles.joinBlock} aria-labelledby="join-team-prompt">
        <p id="join-team-prompt" className={styles.joinPrompt}>
          이미 초대 받은 팀이 있으신가요?
        </p>
        <label className={styles.inputWrap}>
          <span className={styles.srOnly}>팀 코드</span>
          <input
            className={styles.input}
            type="text"
            name="teamCode"
            placeholder="팀 코드를 입력하세요"
            value={teamCode}
            onChange={onTeamCodeChange}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </section>
    </main>
  );
}

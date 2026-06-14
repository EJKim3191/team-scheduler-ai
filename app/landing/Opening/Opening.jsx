"use client";

import { useEffect, useRef } from "react";

import BrandMark from "../BrandMark/BrandMark";
import styles from "./Opening.module.css";

export default function Opening({ onContinue }) {
  const hasContinued = useRef(false);

  useEffect(() => {
    const handleKeyDown = () => {
      if (hasContinued.current) return;
      hasContinued.current = true;
      onContinue?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onContinue]);

  return (
    <section className={styles.root} aria-label="오프닝">
      <div className={styles.content}>
        <header className={styles.header}>
          <BrandMark size="large" />
          <h1 className={styles.title}>AI 팀 싱크</h1>
        </header>

        <div className={styles.body}>
          <p className={styles.mantra}>팀 일정, 한곳에서.</p>
          <p className={styles.sub}>
            AI가 조율을 돕는 가벼운 협업 도구로
            <br />
            팀의 리듬을 맞춰보세요.
          </p>
        </div>
      </div>

      <div className={styles.hintSlot}>
        <p className={styles.hint} aria-live="polite">
          아무 키나 눌러 시작
        </p>
      </div>
    </section>
  );
}

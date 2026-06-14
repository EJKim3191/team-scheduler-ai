"use client";

import { useEffect, useState } from "react";

import Tetris from "../Tetris/Tetris";
import styles from "./TetrisStage.module.css";

export default function TetrisStage({
  instanceId,
  isStageActive = false,
  options,
  onContinue,
  intro,
}) {
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isStageActive) {
      setHasStarted(false);
    }
  }, [isStageActive, instanceId]);

  const showIntro = isStageActive && !hasStarted;

  return (
    <section className={styles.root} aria-label={intro?.title ?? "테트리스"}>
      <div
        className={`${styles.gameLayer} ${showIntro ? styles.gameDimmed : ""}`}
        aria-hidden={showIntro}
      >
        <Tetris
          instanceId={instanceId}
          isActive={isStageActive}
          isPlaying={hasStarted}
          options={options}
          onContinue={onContinue}
        />
      </div>

      {showIntro && (
        <div className={styles.introOverlay}>
          <div className={styles.introCard}>
            {intro?.badge && <span className={styles.badge}>{intro.badge}</span>}
            <h2 className={styles.title}>{intro?.title}</h2>
            <div className={styles.description}>
              {intro?.description?.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <button
              type="button"
              className={styles.startButton}
              onClick={() => setHasStarted(true)}
            >
              {intro?.buttonLabel ?? "시작하기"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

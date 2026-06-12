"use client";

import { useCallback, useState } from "react";

import Opening from "./Opening/Opening";
import Tetris from "./Tetris/Tetris";
import styles from "./Landing.module.css";

const STEPS = {
  opening: 0,
  tetris_with_line_limit: 1,
  tetris_cannot_win: 2,
};

const CHAOS_CANNOT_WIN_SCHEDULE = [
  { when: { piecesLocked: 0 }, trigger: "spawn", effects: { dualPiece: true } },
  { when: { piecesLocked: 1 }, trigger: "spawn", effects: { dualPiece: true } },
  {
    when: { piecesLocked: 2 },
    trigger: "firstInput",
    effects: { randomInject: { count: 5 } },
  },
  {
    when: { piecesLocked: 3 },
    trigger: "spawn",
    effects: { speedBoost: { multiplier: 2 } },
  },
  {
    when: { piecesLockedGte: 4 },
    trigger: "spawn",
    effects: { dualPiece: true, speedBoost: { multiplier: 1.5 } },
  },
];

export default function LandingContent() {
  const [step, setStep] = useState(STEPS.opening);

  const goToNextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  return (
    <div className={styles.stageStack}>
      <div
        className={`${styles.stage} ${step === STEPS.opening ? styles.stageActive : styles.stageHidden}`}
        aria-hidden={step !== STEPS.opening}
      >
        <Opening onContinue={goToNextStep} />
      </div>

      <div
        className={`${styles.stage} ${step === STEPS.tetris_with_line_limit ? styles.stageActive : styles.stageHidden}`}
        aria-hidden={step !== STEPS.tetris_with_line_limit}
      >
        <Tetris
          instanceId="line-limit"
          isActive={step === STEPS.tetris_with_line_limit}
          options={{ lineLimit: 1 }}
          onContinue={goToNextStep}
        />
      </div>

      <div
        className={`${styles.stage} ${step === STEPS.tetris_cannot_win ? styles.stageActive : styles.stageHidden}`}
        aria-hidden={step !== STEPS.tetris_cannot_win}
      >
        <Tetris
          instanceId="cannot-win"
          isActive={step === STEPS.tetris_cannot_win}
          options={{
            lineLimit: 0,
            chaosSchedule: CHAOS_CANNOT_WIN_SCHEDULE,
          }}
          onContinue={goToNextStep}
        />
      </div>
    </div>
  );
}

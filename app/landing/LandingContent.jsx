"use client";

import { useCallback, useState } from "react";

import Finale from "./Finale/Finale";
import Opening from "./Opening/Opening";
import TetrisScenario from "./TetrisScenario/TetrisScenario";
import TetrisStage from "./TetrisStage/TetrisStage";
import styles from "./Landing.module.css";

const STEPS = {
  opening: 0,
  tetris_with_line_limit: 1,
  tetris_cannot_win: 2,
  tetris_ai_help: 3,
  finale: 4,
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

const TETRIS_INTRO = {
  lineLimit: {
    badge: "미션 1",
    title: "라인 1개를 클리어하세요",
    description: [
      "나만의 일정을 만드는 것은",
      "마치 테트리스 한 줄을 맞추는 것만큼 쉬울지도 몰라요.",
      "← → 이동 · ↑/Space 회전 · ↓ 소프트 드롭 · Enter 하드 드롭",
    ],
    buttonLabel: "시작하기",
  },
  cannotWin: {
    badge: "미션 2",
    title: "이번엔 조금 다릅니다",
    description: [
      "하지만 우리는 항상 '누군가'와 함께 일정을 맞춥니다.",
      "다양한 '상황' 속에서 최적의 일정을 맞출 수 있을까요?",
    ],
    buttonLabel: "도전하기",
  },
};

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
        <TetrisStage
          instanceId="line-limit"
          isStageActive={step === STEPS.tetris_with_line_limit}
          options={{ lineLimit: 1 }}
          intro={TETRIS_INTRO.lineLimit}
          onContinue={goToNextStep}
        />
      </div>

      <div
        className={`${styles.stage} ${step === STEPS.tetris_cannot_win ? styles.stageActive : styles.stageHidden}`}
        aria-hidden={step !== STEPS.tetris_cannot_win}
      >
        <TetrisStage
          instanceId="cannot-win"
          isStageActive={step === STEPS.tetris_cannot_win}
          options={{
            lineLimit: 0,
            chaosSchedule: CHAOS_CANNOT_WIN_SCHEDULE,
          }}
          intro={TETRIS_INTRO.cannotWin}
          onContinue={goToNextStep}
        />
      </div>

      <div
        className={`${styles.stage} ${step === STEPS.tetris_ai_help ? styles.stageActive : styles.stageHidden}`}
        aria-hidden={step !== STEPS.tetris_ai_help}
      >
        <TetrisScenario
          isStageActive={step === STEPS.tetris_ai_help}
          onContinue={goToNextStep}
        />
      </div>
      <div
        className={`${styles.stage} ${step === STEPS.finale ? styles.stageActive : styles.stageHidden}`}
        aria-hidden={step !== STEPS.finale}
      >
        <Finale isStageActive={step === STEPS.finale} />
      </div>
    </div>
  );
}

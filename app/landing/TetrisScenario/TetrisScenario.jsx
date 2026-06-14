"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import TetrisAuto from "../Tetris/TetrisAuto";
import ScenarioChat from "./ScenarioChat";
import styles from "./TetrisScenario.module.css";

const PHASE = {
  intro: "intro",
  scene: "scene",
};

const FORCE_CONTINUE_MS = 20000;

export default function TetrisScenario({ isStageActive = false, onContinue }) {
  const [phase, setPhase] = useState(PHASE.intro);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const messageIdRef = useRef(0);
  const hasCompletedRef = useRef(false);

  const pushMessage = useCallback((role, text) => {
    messageIdRef.current += 1;
    setMessages((prev) => [...prev, { id: messageIdRef.current, role, text }]);
  }, []);

  const resetScenario = useCallback(() => {
    setPhase(PHASE.intro);
    setMessages([]);
    setIsTyping(false);
    setIsPlaying(false);
    hasCompletedRef.current = false;
    messageIdRef.current = 0;
  }, []);

  const finishStage = useCallback(
    ({ delay = 0, showFinalMessage = false } = {}) => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;
      setIsPlaying(false);

      if (showFinalMessage) {
        pushMessage("ai", "이렇게 도와드릴 수 있어요.");
      }

      setTimeout(() => {
        onContinue?.();
      }, delay);
    },
    [onContinue, pushMessage],
  );

  useEffect(() => {
    if (!isStageActive) {
      resetScenario();
      return undefined;
    }

    resetScenario();
    const sceneTimer = setTimeout(() => {
      setPhase(PHASE.scene);
    }, 2000);

    const forceContinueTimer = setTimeout(() => {
      finishStage();
    }, FORCE_CONTINUE_MS);

    return () => {
      clearTimeout(sceneTimer);
      clearTimeout(forceContinueTimer);
    };
  }, [isStageActive, resetScenario, finishStage]);

  useEffect(() => {
    if (!isStageActive || phase !== PHASE.scene) return undefined;

    pushMessage("user", "테트리스를 완성시켜줘");

    const typingTimer = setTimeout(() => {
      setIsTyping(true);
    }, 500);

    const aiReplyTimer = setTimeout(() => {
      setIsTyping(false);
      pushMessage("ai", "알겠어요. 제가 맞춰볼게요.");
      setIsPlaying(true);
    }, 1400);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(aiReplyTimer);
    };
  }, [isStageActive, phase, pushMessage]);

  const handleLinesChange = useCallback(
    (lines) => {
      if (lines === 1) {
        pushMessage("ai", "한 줄 맞췄어요.");
      }
      if (lines === 3) {
        pushMessage("ai", "계속 맞춰볼게요.");
      }
    },
    [pushMessage],
  );

  const handleDemoComplete = useCallback(() => {
    finishStage({ delay: 3000, showFinalMessage: true });
  }, [finishStage]);

  if (phase === PHASE.intro) {
    return (
      <section className={styles.root} aria-label="AI 도움 시나리오">
        <div className={styles.intro}>
          <p className={styles.introText}>그럼 약간의 도움을 받아볼까요?</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.root} aria-label="AI 도움 시나리오">
      <div className={styles.scene}>
        <div className={styles.gameWrap}>
          <TetrisAuto
            isActive={isStageActive}
            isPlaying={isPlaying}
            onLinesChange={handleLinesChange}
            onDemoComplete={handleDemoComplete}
          />
        </div>
        <ScenarioChat messages={messages} isTyping={isTyping} />
      </div>
    </section>
  );
}

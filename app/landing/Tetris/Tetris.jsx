"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  applyFirstInputChaos,
  getActiveModifiers,
  spawnNextPieces,
} from "./chaos";
import { GAME_CONFIG } from "./constants";
import {
  createInitialState,
  getShape,
  hardDropPieces,
  lockActivePieces,
  movePieces,
  tryRotatePieces,
} from "./engine";
import { applyEndRules } from "./rules";
import styles from "./Tetris.module.css";

const { cols, rows, cellSize, colors } = GAME_CONFIG;

function drawCell(ctx, x, y, color) {
  const padding = 1;
  ctx.fillStyle = color;
  ctx.fillRect(
    x * cellSize + padding,
    y * cellSize + padding,
    cellSize - padding * 2,
    cellSize - padding * 2,
  );
}

function drawActivePieces(ctx, board, activePieces) {
  if (!activePieces?.length) return;

  const ghostPieces = hardDropPieces(board, activePieces);

  ghostPieces.forEach((ghostPiece) => {
    const shape = getShape(ghostPiece);

    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (!shape[y][x]) continue;
        const boardX = ghostPiece.x + x;
        const boardY = ghostPiece.y + y;
        if (boardY < 0) continue;
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(
          boardX * cellSize + 1,
          boardY * cellSize + 1,
          cellSize - 2,
          cellSize - 2,
        );
      }
    }
  });

  activePieces.forEach((piece) => {
    const shape = getShape(piece);

    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (!shape[y][x]) continue;
        const boardX = piece.x + x;
        const boardY = piece.y + y;
        if (boardY < 0) continue;
        drawCell(ctx, boardX, boardY, colors[piece.type]);
      }
    }
  });
}

function drawBoard(ctx, board, activePieces) {
  const width = cols * cellSize;
  const height = rows * cellSize;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = colors.grid;
  ctx.lineWidth = 1;

  for (let x = 0; x <= cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize + 0.5, 0);
    ctx.lineTo(x * cellSize + 0.5, height);
    ctx.stroke();
  }

  for (let y = 0; y <= rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize + 0.5);
    ctx.lineTo(width, y * cellSize + 0.5);
    ctx.stroke();
  }

  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        drawCell(ctx, x, y, colors[cell]);
      }
    });
  });

  drawActivePieces(ctx, board, activePieces);
}

const END_MESSAGES = {
  lineLimit: "목표 달성!",
  collision: "Game Over",
  custom: "Game Over",
};

export default function Tetris({
  instanceId = "default",
  isActive = true,
  options = { lineLimit: 0 },
  onContinue,
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef(createInitialState());
  const optionsRef = useRef(options);
  const isActiveRef = useRef(isActive);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [endReason, setEndReason] = useState(null);
  const [modifiers, setModifiers] = useState({
    dualPiece: false,
    randomInjectPending: false,
    speedBoostPending: false,
    speedBoostActive: false,
    dropIntervalMs: GAME_CONFIG.dropIntervalMs,
  });

  optionsRef.current = options;
  isActiveRef.current = isActive;

  const syncUi = useCallback(
    (state) => {
      setScore(state.score);
      setLines(state.lines);
      setGameOver(state.gameOver);
      setEndReason(state.endReason ?? null);
      setModifiers(
        getActiveModifiers(state, optionsRef.current.chaosSchedule ?? []),
      );
    },
    [],
  );

  const commitState = useCallback(
    (state) => {
      const nextState = applyEndRules(state, optionsRef.current);
      gameRef.current = nextState;
      syncUi(nextState);
      return nextState;
    },
    [syncUi],
  );

  const resetGame = useCallback(() => {
    commitState(createInitialState());
  }, [commitState]);

  useEffect(() => {
    if (!isActive) return;
    resetGame();
  }, [isActive, instanceId, resetGame]);

  const settlePiece = useCallback(
    (state) => {
      const result = lockActivePieces(state.board, state.activePieces);
      const piecesLocked = state.piecesLocked + 1;
      const spawn = spawnNextPieces(
        result.board,
        piecesLocked,
        optionsRef.current.chaosSchedule ?? [],
        { dropIntervalMs: state.dropIntervalMs },
      );

      commitState({
        ...state,
        board: result.board,
        activePieces: spawn.activePieces,
        piecesLocked,
        controlStarted: spawn.controlStarted,
        pendingFirstInputEffects: spawn.pendingFirstInputEffects,
        dropIntervalMs: spawn.dropIntervalMs,
        gameOver: spawn.gameOver,
        endReason: spawn.gameOver ? "collision" : null,
        lines: state.lines + result.linesCleared,
        score: state.score + result.linesCleared * 100,
        lastDropAt: performance.now(),
      });
    },
    [commitState],
  );

  const withFirstInputChaos = useCallback(
    (state) => {
      if (state.controlStarted || !state.pendingFirstInputEffects) {
        return state;
      }

      return applyFirstInputChaos(state);
    },
    [],
  );

  useEffect(() => {
    if (!isActive || !gameOver) return;
    onContinue?.();
  }, [isActive, gameOver, onContinue]);

  useEffect(() => {
    if (!isActive) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const dpr = window.devicePixelRatio || 1;
    const width = cols * cellSize;
    const height = rows * cellSize;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let frameId;

    const loop = (time) => {
      if (!isActiveRef.current) return;

      const state = gameRef.current;

      const dropIntervalMs =
        state.dropIntervalMs ?? GAME_CONFIG.dropIntervalMs;

      if (!state.gameOver && time - state.lastDropAt >= dropIntervalMs) {
        const moved = movePieces(state.board, state.activePieces, 0, 1);

        if (moved) {
          gameRef.current = { ...state, activePieces: moved, lastDropAt: time };
        } else {
          settlePiece(state);
        }
      }

      const current = gameRef.current;
      drawBoard(
        ctx,
        current.board,
        current.gameOver ? null : current.activePieces,
      );
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isActive, instanceId, settlePiece]);

  useEffect(() => {
    if (!isActive) return undefined;

    const handleKeyDown = (event) => {
      if (!isActiveRef.current) return;

      let state = gameRef.current;
      if (state.gameOver) return;

      state = withFirstInputChaos(state);
      if (state.gameOver) {
        commitState(state);
        return;
      }

      let nextState = state;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          nextState = {
            ...state,
            controlStarted: true,
            activePieces:
              movePieces(state.board, state.activePieces, -1, 0) ??
              state.activePieces,
          };
          break;
        case "ArrowRight":
          event.preventDefault();
          nextState = {
            ...state,
            controlStarted: true,
            activePieces:
              movePieces(state.board, state.activePieces, 1, 0) ??
              state.activePieces,
          };
          break;
        case "ArrowDown": {
          event.preventDefault();
          const moved = movePieces(state.board, state.activePieces, 0, 1);
          if (moved) {
            nextState = {
              ...state,
              controlStarted: true,
              activePieces: moved,
              score: state.score + 1,
            };
          } else {
            settlePiece(state);
            return;
          }
          break;
        }
        case "ArrowUp":
        case " ":
          event.preventDefault();
          nextState = {
            ...state,
            controlStarted: true,
            activePieces: tryRotatePieces(state.board, state.activePieces, 1),
          };
          break;
        case "Enter":
          event.preventDefault();
          settlePiece({
            ...state,
            controlStarted: true,
            activePieces: hardDropPieces(state.board, state.activePieces),
          });
          return;
        default:
          return;
      }

      commitState(nextState);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, instanceId, commitState, settlePiece, withFirstInputChaos]);

  const endMessage = END_MESSAGES[endReason] ?? "Game Over";

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="테트리스 게임 보드"
        />

        <aside className={styles.sidebar}>
          <h2 className={styles.title}>Tetris</h2>
          <dl className={styles.stats}>
            <div>
              <dt>Score</dt>
              <dd>{score}</dd>
            </div>
            <div>
              <dt>Lines</dt>
              <dd>{lines}</dd>
            </div>
          </dl>

          {(modifiers.dualPiece ||
            modifiers.randomInjectPending ||
            modifiers.speedBoostPending ||
            modifiers.speedBoostActive) && (
            <ul className={styles.modifiers}>
              {modifiers.dualPiece && <li>듀얼 블록</li>}
              {modifiers.randomInjectPending && <li>랜덤 블록 대기</li>}
              {modifiers.speedBoostPending && <li>배속 대기</li>}
              {modifiers.speedBoostActive && (
                <li>
                  배속 진행 ({modifiers.dropIntervalMs}ms)
                </li>
              )}
            </ul>
          )}

          <p className={styles.controls}>
            ← → 이동 · ↑/Space 회전
            <br />↓ 소프트 드롭 · Enter 하드 드롭
          </p>

          {gameOver && (
            <div className={styles.overlay}>
              <p>{endMessage}</p>
              <button type="button" onClick={resetGame}>
                다시 시작
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

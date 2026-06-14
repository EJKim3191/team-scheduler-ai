"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { findBestPlacement } from "./autoPlayer";
import { GAME_CONFIG } from "./constants";
import {
  collides,
  createInitialState,
  createPiece,
  getShape,
  hardDrop,
  hardDropPieces,
  lockActivePieces,
  movePiece,
  tryRotate,
} from "./engine";
import styles from "./Tetris.module.css";

const { cols, rows, cellSize, colors } = GAME_CONFIG;

const AUTO_DROP_INTERVAL_MS = 120;
const AUTO_MOVE_INTERVAL_MS = 42;
const DEMO_LINE_TARGET = 4;

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

function drawBoard(ctx, board, activePiece) {
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
      if (cell) drawCell(ctx, x, y, colors[cell]);
    });
  });

  if (!activePiece) return;

  const ghost = hardDrop(board, activePiece);
  const shape = getShape(activePiece);
  const ghostShape = getShape(ghost);

  for (let y = 0; y < ghostShape.length; y += 1) {
    for (let x = 0; x < ghostShape[y].length; x += 1) {
      if (!ghostShape[y][x]) continue;
      const boardX = ghost.x + x;
      const boardY = ghost.y + y;
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

  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) continue;
      const boardX = activePiece.x + x;
      const boardY = activePiece.y + y;
      if (boardY < 0) continue;
      drawCell(ctx, boardX, boardY, colors[activePiece.type]);
    }
  }
}

function spawnNextPiece(board) {
  const nextPiece = createPiece();
  return {
    activePieces: [nextPiece],
    gameOver: collides(board, nextPiece),
  };
}

export default function TetrisAuto({
  isActive = false,
  isPlaying = false,
  onLinesChange,
  onDemoComplete,
}) {
  const canvasRef = useRef(null);
  const gameRef = useRef(createInitialState());
  const targetRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const isPlayingRef = useRef(isPlaying);
  const [lines, setLines] = useState(0);

  isActiveRef.current = isActive;
  isPlayingRef.current = isPlaying;

  const resetGame = useCallback(() => {
    gameRef.current = createInitialState();
    targetRef.current = null;
    setLines(0);
    onLinesChange?.(0);
  }, [onLinesChange]);

  useEffect(() => {
    if (!isActive) return;
    resetGame();
  }, [isActive, resetGame]);

  useEffect(() => {
    if (!isActive || !isPlaying) return;
    resetGame();
  }, [isActive, isPlaying, resetGame]);

  const lockPiece = useCallback(
    (state) => {
      const result = lockActivePieces(state.board, state.activePieces);
      const spawn = spawnNextPiece(result.board);
      const nextLines = state.lines + result.linesCleared;

      gameRef.current = {
        ...state,
        board: result.board,
        activePieces: spawn.activePieces,
        lines: nextLines,
        score: state.score + result.linesCleared * 100,
        gameOver: spawn.gameOver,
        lastDropAt: performance.now(),
      };
      targetRef.current = null;
      setLines(nextLines);
      onLinesChange?.(nextLines);

      if (nextLines >= DEMO_LINE_TARGET) {
        onDemoComplete?.();
      }
    },
    [onDemoComplete, onLinesChange],
  );

  const runAutoStep = useCallback(
    (state) => {
      if (state.gameOver) return state;

      const piece = state.activePieces[0];
      if (!targetRef.current || targetRef.current.type !== piece.type) {
        targetRef.current = findBestPlacement(state.board, piece);
      }

      const target = targetRef.current;

      if (piece.rotation !== target.rotation) {
        const rotated = tryRotate(state.board, piece, 1);
        return { ...state, activePieces: [rotated] };
      }

      if (piece.x < target.x) {
        const moved = movePiece(state.board, piece, 1, 0);
        if (moved) return { ...state, activePieces: [moved] };
      }

      if (piece.x > target.x) {
        const moved = movePiece(state.board, piece, -1, 0);
        if (moved) return { ...state, activePieces: [moved] };
      }

      const movedDown = movePiece(state.board, piece, 0, 1);
      if (movedDown) {
        return { ...state, activePieces: [movedDown] };
      }

      lockPiece({
        ...state,
        activePieces: hardDropPieces(state.board, state.activePieces),
      });
      return gameRef.current;
    },
    [lockPiece],
  );

  const setupCanvas = useCallback((canvas) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const dpr = window.devicePixelRatio || 1;
    const width = cols * cellSize;
    const height = rows * cellSize;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return ctx;
  }, []);

  useEffect(() => {
    if (!isActive || !isPlaying) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = setupCanvas(canvas);
    if (!ctx) return undefined;

    let frameId;
    let lastMoveAt = 0;
    let lastDropAt = performance.now();

    const loop = (time) => {
      if (!isActiveRef.current || !isPlayingRef.current) return;

      let state = gameRef.current;

      if (!state.gameOver && time - lastMoveAt >= AUTO_MOVE_INTERVAL_MS) {
        state = runAutoStep(state);
        gameRef.current = state;
        lastMoveAt = time;
      }

      if (
        !state.gameOver &&
        time - lastDropAt >= AUTO_DROP_INTERVAL_MS
      ) {
        const moved = movePiece(state.board, state.activePieces[0], 0, 1);
        if (moved) {
          gameRef.current = { ...state, activePieces: [moved] };
        }
        lastDropAt = time;
      }

      const current = gameRef.current;
      drawBoard(
        ctx,
        current.board,
        current.gameOver ? null : current.activePieces[0],
      );
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isActive, isPlaying, runAutoStep, setupCanvas]);

  useEffect(() => {
    if (!isActive || isPlaying) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = setupCanvas(canvas);
    if (!ctx) return undefined;

    const state = gameRef.current;
    drawBoard(ctx, state.board, state.activePieces[0]);

    return undefined;
  }, [isActive, isPlaying, setupCanvas]);

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          aria-label="AI가 진행하는 테트리스"
        />
        <aside className={styles.sidebar}>
          <h2 className={styles.title}>Tetris</h2>
          <dl className={styles.stats}>
            <div>
              <dt>Lines</dt>
              <dd>{lines}</dd>
            </div>
          </dl>
          <p className={styles.controls}>AI가 자동으로 진행 중</p>
        </aside>
      </div>
    </div>
  );
}

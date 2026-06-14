import { GAME_CONFIG, TETROMINOES } from "./constants";
import {
  clearLines,
  collides,
  hardDrop,
  mergePiece,
} from "./engine";

const { cols, rows } = GAME_CONFIG;

function getColumnHeights(board) {
  const heights = Array(cols).fill(0);

  for (let x = 0; x < cols; x += 1) {
    for (let y = 0; y < rows; y += 1) {
      if (board[y][x]) {
        heights[x] = rows - y;
        break;
      }
    }
  }

  return heights;
}

function countHoles(board) {
  let holes = 0;

  for (let x = 0; x < cols; x += 1) {
    let blocked = false;
    for (let y = 0; y < rows; y += 1) {
      if (board[y][x]) blocked = true;
      else if (blocked) holes += 1;
    }
  }

  return holes;
}

function evaluateBoard(board, linesCleared) {
  const heights = getColumnHeights(board);
  const aggregateHeight = heights.reduce((sum, height) => sum + height, 0);
  const holes = countHoles(board);
  let bumpiness = 0;

  for (let i = 0; i < cols - 1; i += 1) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  return (
    linesCleared * 800 -
    aggregateHeight * 4 -
    holes * 40 -
    bumpiness * 2
  );
}

export function findBestPlacement(board, piece) {
  const rotationCount = TETROMINOES[piece.type].length;
  let bestScore = -Infinity;
  let bestPiece = hardDrop(board, piece);

  for (let rotation = 0; rotation < rotationCount; rotation += 1) {
    for (let x = -2; x < cols; x += 1) {
      const candidate = { ...piece, rotation, x, y: 0 };
      if (collides(board, candidate)) continue;

      const dropped = hardDrop(board, candidate);
      const merged = mergePiece(board, dropped);
      const { board: clearedBoard, linesCleared } = clearLines(merged);
      const score = evaluateBoard(clearedBoard, linesCleared);

      if (score > bestScore) {
        bestScore = score;
        bestPiece = dropped;
      }
    }
  }

  return bestPiece;
}

import { GAME_CONFIG, PIECE_TYPES, TETROMINOES } from "./constants";

const { cols, rows } = GAME_CONFIG;

export function createEmptyBoard() {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function randomPieceType() {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

export function createPiece(type = randomPieceType()) {
  return {
    type,
    rotation: 0,
    x: 3,
    y: 0,
  };
}

export function getShape(piece) {
  const rotations = TETROMINOES[piece.type];
  return rotations[piece.rotation % rotations.length];
}

export function collides(
  board,
  piece,
  offsetX = 0,
  offsetY = 0,
  rotation = piece.rotation,
) {
  const shape =
    TETROMINOES[piece.type][rotation % TETROMINOES[piece.type].length];

  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) continue;

      const boardX = piece.x + x + offsetX;
      const boardY = piece.y + y + offsetY;

      if (boardX < 0 || boardX >= cols || boardY >= rows) {
        return true;
      }

      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

export function collidesAny(board, pieces, offsetX = 0, offsetY = 0) {
  return pieces.some((piece) => collides(board, piece, offsetX, offsetY));
}

export function mergePiece(board, piece) {
  const nextBoard = board.map((row) => [...row]);
  const shape = getShape(piece);

  for (let y = 0; y < shape.length; y += 1) {
    for (let x = 0; x < shape[y].length; x += 1) {
      if (!shape[y][x]) continue;

      const boardY = piece.y + y;
      const boardX = piece.x + x;

      if (boardY >= 0 && boardY < rows && boardX >= 0 && boardX < cols) {
        nextBoard[boardY][boardX] = piece.type;
      }
    }
  }

  return nextBoard;
}

export function mergePieces(board, pieces) {
  return pieces.reduce((nextBoard, piece) => mergePiece(nextBoard, piece), board);
}

export function clearLines(board) {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = rows - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () =>
    Array(cols).fill(null),
  );

  return {
    board: [...emptyRows, ...remaining],
    linesCleared: cleared,
  };
}

export function rotatePiece(piece, direction = 1) {
  const rotations = TETROMINOES[piece.type];
  return {
    ...piece,
    rotation:
      (piece.rotation + direction + rotations.length) % rotations.length,
  };
}

export function tryRotate(board, piece, direction = 1) {
  const rotated = rotatePiece(piece, direction);

  if (!collides(board, rotated)) {
    return rotated;
  }

  for (const offset of [-1, 1, -2, 2]) {
    const nudged = { ...rotated, x: rotated.x + offset };
    if (!collides(board, nudged)) {
      return nudged;
    }
  }

  return piece;
}

export function tryRotatePieces(board, pieces, direction = 1) {
  const rotated = pieces.map((piece) => rotatePiece(piece, direction));

  if (!collidesAny(board, rotated)) {
    return rotated;
  }

  for (const offset of [-1, 1, -2, 2]) {
    const nudged = rotated.map((piece) => ({ ...piece, x: piece.x + offset }));
    if (!collidesAny(board, nudged)) {
      return nudged;
    }
  }

  return pieces;
}

export function movePiece(board, piece, offsetX, offsetY) {
  const next = { ...piece, x: piece.x + offsetX, y: piece.y + offsetY };

  if (collides(board, next)) {
    return null;
  }

  return next;
}

export function movePieces(board, pieces, offsetX, offsetY) {
  const next = pieces.map((piece) => ({
    ...piece,
    x: piece.x + offsetX,
    y: piece.y + offsetY,
  }));

  if (collidesAny(board, next)) {
    return null;
  }

  return next;
}

export function hardDrop(board, piece) {
  let dropped = { ...piece };

  while (!collides(board, dropped, 0, 1)) {
    dropped = { ...dropped, y: dropped.y + 1 };
  }

  return dropped;
}

export function hardDropPieces(board, pieces) {
  let dropped = pieces.map((piece) => ({ ...piece }));

  while (!collidesAny(board, dropped, 0, 1)) {
    dropped = dropped.map((piece) => ({ ...piece, y: piece.y + 1 }));
  }

  return dropped;
}

export function lockActivePieces(board, activePieces) {
  const merged = mergePieces(board, activePieces);
  return clearLines(merged);
}

export function createInitialState() {
  const board = createEmptyBoard();
  const activePieces = [createPiece()];
  const gameOver = collidesAny(board, activePieces);

  return {
    board,
    activePieces,
    piecesLocked: 0,
    controlStarted: false,
    pendingFirstInputEffects: null,
    dropIntervalMs: GAME_CONFIG.dropIntervalMs,
    score: 0,
    lines: 0,
    gameOver,
    endReason: gameOver ? "collision" : null,
    lastDropAt: 0,
  };
}

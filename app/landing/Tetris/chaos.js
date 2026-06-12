import { GAME_CONFIG } from "./constants";
import { collides, createPiece, randomPieceType } from "./engine";

const { cols, rows } = GAME_CONFIG;

/**
 * chaosSchedule 이벤트 예시:
 * [
 *   { when: { piecesLocked: 0 }, trigger: "spawn", effects: { dualPiece: true } },
 *   { when: { piecesLocked: 1 }, trigger: "spawn", effects: { dualPiece: true } },
 *   { when: { piecesLocked: 2 }, trigger: "firstInput", effects: { randomInject: { count: 5 } } },
 *   { when: { piecesLockedGte: 4 }, trigger: "spawn", effects: { dualPiece: true } },
 *   { when: { piecesLocked: 3 }, trigger: "spawn", effects: { speedBoost: { multiplier: 2 } } },
 * ]
 *
 * when.piecesLocked    - 정확히 N번째 블록 고정 직후
 * when.piecesLockedGte - N번 이상 고정 직후
 * trigger.spawn        - 다음 블록 스폰 시
 * trigger.firstInput   - 다음 블록 컨트롤 첫 입력 시
 * effects.speedBoost   - { multiplier: 2 } 또는 { dropIntervalMs: 300 }
 */
function matchesWhen(when = {}, piecesLocked) {
  if (when.piecesLocked !== undefined) {
    return piecesLocked === when.piecesLocked;
  }
  if (when.piecesLockedGte !== undefined) {
    return piecesLocked >= when.piecesLockedGte;
  }
  return false;
}

function hasFirstInputEffects(effects) {
  return Boolean(effects.randomInject || effects.speedBoost);
}

export function resolveSpeedBoost(currentInterval, speedBoost) {
  if (!speedBoost) return currentInterval;

  if (speedBoost.dropIntervalMs !== undefined) {
    return Math.max(50, speedBoost.dropIntervalMs);
  }

  const multiplier = speedBoost.multiplier ?? 2;
  return Math.max(50, Math.floor(currentInterval / multiplier));
}

export function applySpeedBoost(currentInterval, speedBoost) {
  if (!speedBoost) return currentInterval;
  return resolveSpeedBoost(currentInterval, speedBoost);
}

export function getScheduledEffects(schedule = [], piecesLocked, trigger) {
  const effects = {
    dualPiece: false,
    randomInject: null,
    speedBoost: null,
  };

  for (const event of schedule) {
    if (event.trigger !== trigger) continue;
    if (!matchesWhen(event.when ?? {}, piecesLocked)) continue;

    if (event.effects?.dualPiece) {
      effects.dualPiece = true;
    }

    if (event.effects?.randomInject) {
      effects.randomInject =
        typeof event.effects.randomInject === "object"
          ? event.effects.randomInject
          : { count: 4 };
    }

    if (event.effects?.speedBoost) {
      const nextBoost =
        typeof event.effects.speedBoost === "object"
          ? event.effects.speedBoost
          : { multiplier: 2 };
      effects.speedBoost = effects.speedBoost
        ? {
            multiplier:
              (effects.speedBoost.multiplier ?? 1) *
              (nextBoost.multiplier ?? 1),
            dropIntervalMs: nextBoost.dropIntervalMs ?? effects.speedBoost.dropIntervalMs,
          }
        : nextBoost;
    }
  }

  return effects;
}

export function createActivePieces(dualPiece = false) {
  if (!dualPiece) {
    return [createPiece()];
  }

  return [createPiece(), createPiece()];
}

export function spawnNextPieces(
  board,
  piecesLocked,
  schedule = [],
  { dropIntervalMs = GAME_CONFIG.dropIntervalMs } = {},
) {
  const spawnEffects = getScheduledEffects(schedule, piecesLocked, "spawn");
  const firstInputEffects = getScheduledEffects(
    schedule,
    piecesLocked,
    "firstInput",
  );
  const activePieces = createActivePieces(spawnEffects.dualPiece);
  const gameOver = activePieces.some((piece) => collides(board, piece));
  const nextDropIntervalMs = applySpeedBoost(
    dropIntervalMs,
    spawnEffects.speedBoost,
  );

  return {
    activePieces,
    controlStarted: false,
    pendingFirstInputEffects: hasFirstInputEffects(firstInputEffects)
      ? firstInputEffects
      : null,
    dropIntervalMs: nextDropIntervalMs,
    gameOver,
  };
}

export function injectRandomBlocks(board, { count = 4 } = {}) {
  const nextBoard = board.map((row) => [...row]);
  const stackCandidates = [];
  const fallbackCandidates = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (nextBoard[y][x]) continue;

      const hasBlockBelow = y < rows - 1 && nextBoard[y + 1][x];
      const hasBlockBeside =
        (x > 0 && nextBoard[y][x - 1]) || (x < cols - 1 && nextBoard[y][x + 1]);
      const nearStack = y >= rows - 6;

      if (hasBlockBelow || hasBlockBeside || nearStack) {
        stackCandidates.push([x, y]);
      } else {
        fallbackCandidates.push([x, y]);
      }
    }
  }

  const pool =
    stackCandidates.length > 0 ? [...stackCandidates] : [...fallbackCandidates];

  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    const [x, y] = pool.splice(index, 1)[0];
    nextBoard[y][x] = randomPieceType();
  }

  return nextBoard;
}

export function applyFirstInputChaos(state) {
  if (state.controlStarted || !state.pendingFirstInputEffects) {
    return state;
  }

  const { randomInject, speedBoost } = state.pendingFirstInputEffects;
  let board = state.board;
  let dropIntervalMs = state.dropIntervalMs ?? GAME_CONFIG.dropIntervalMs;
  let gameOver = state.gameOver;
  let endReason = state.endReason;

  if (randomInject) {
    board = injectRandomBlocks(board, randomInject);
    const collision = state.activePieces.some((piece) => collides(board, piece));
    gameOver = collision || gameOver;
    endReason = collision ? "collision" : endReason;
  }

  if (speedBoost) {
    dropIntervalMs = applySpeedBoost(dropIntervalMs, speedBoost);
  }

  return {
    ...state,
    board,
    dropIntervalMs,
    controlStarted: true,
    pendingFirstInputEffects: null,
    gameOver,
    endReason,
  };
}

export function getActiveModifiers(state, schedule = []) {
  const spawnEffects = getScheduledEffects(
    schedule,
    state.piecesLocked,
    "spawn",
  );

  const baseInterval = GAME_CONFIG.dropIntervalMs;
  const currentInterval = state.dropIntervalMs ?? baseInterval;

  return {
    dualPiece: state.activePieces.length > 1 || spawnEffects.dualPiece,
    randomInjectPending: Boolean(state.pendingFirstInputEffects?.randomInject),
    speedBoostPending: Boolean(state.pendingFirstInputEffects?.speedBoost),
    speedBoostActive: currentInterval < baseInterval,
    dropIntervalMs: currentInterval,
  };
}

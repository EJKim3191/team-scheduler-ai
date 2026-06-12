/**
 * 컴포넌트/옵션 기반 종료 규칙을 game state에 반영합니다.
 * engine의 충돌 gameOver 이후에도 호출해 커스텀 룰을 적용할 수 있습니다.
 *
 * options.lineLimit   - 클리어 라인 수 도달 시 종료 (0이면 비활성)
 * options.shouldEnd   - (state) => boolean 커스텀 종료 조건
 * options.endReason   - shouldEnd 발동 시 기록할 reason (기본: 'custom')
 */
export function applyEndRules(state, options = {}) {
  if (state.gameOver) {
    return state;
  }

  const lineLimit = options.lineLimit ?? 0;
  if (lineLimit > 0 && state.lines >= lineLimit) {
    return { ...state, gameOver: true, endReason: "lineLimit" };
  }

  if (typeof options.shouldEnd === "function" && options.shouldEnd(state)) {
    return {
      ...state,
      gameOver: true,
      endReason: options.endReason ?? "custom",
    };
  }

  return state;
}

export function forceEndGame(state, reason = "custom") {
  return { ...state, gameOver: true, endReason: reason };
}

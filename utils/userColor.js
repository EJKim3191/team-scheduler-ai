export const USER_COLORS = [
  "#6366F1", // indigo
  "#EC4899", // pink
  "#F97316", // orange
  "#22C55E", // green
  "#06B6D4", // cyan
  "#A855F7", // purple
  "#F59E0B", // amber
  "#0EA5E9", // sky
];

function hashString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * 동일 유저(profileId, userName)에 대해 항상 동일 색상을 반환합니다.
 * - **우선순위**: profileId → userName
 * - Calendar/TeamMate 등 여러 UI에서 동일 함수를 쓰면 컬러가 일치합니다.
 */
export function getColorForUser({ profileId, userName } = {}) {
  const key = profileId != null && String(profileId).length > 0 ? String(profileId) : String(userName ?? "");
  if (!key) return USER_COLORS[0];
  const index = hashString(key) % USER_COLORS.length;
  return USER_COLORS[index];
}


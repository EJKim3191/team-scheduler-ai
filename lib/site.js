/** @type {string} 서비스 공개 URL (trailing slash 없음) */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://moyora.ai.kr"
).replace(/\/$/, "");

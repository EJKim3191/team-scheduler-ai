import { NextResponse } from "next/server";

export function middleware(request) {
  // 1. 쿠키나 로컬 스토리지 대신 사용할 인증 키 확인
  // 보통 Supabase나 직접 만든 인증 시스템은 쿠키에 토큰을 저장합니다.
  const token = request.cookies.get("sb-access-token"); // 토큰 이름은 설정에 따라 다름

  // 2. 토큰이 없고, 현재 페이지가 로그인 페이지가 아니라면 로그인으로 리다이렉트
  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 3. 미들웨어가 실행될 경로 지정 (대시보드, 마이페이지 등 보호할 경로)
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};

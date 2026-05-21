import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // 인증 후 최종적으로 이동할 페이지
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // 1. 코드를 이용해 Supabase 세션을 교환 (이때 이메일 인증이 최종 완료됩니다)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (!authError && user) {
      // 2. 이메일 인증이 확실히 성공했으므로, 관리자 권한으로 DB에 유저 정보를 안심하고 등록합니다.
      const supabaseAdmin = createAdminClient();

      // const response3 = await supabase.from("profiles").insert({
      //   id: data.user.id,
      //   user_id: data.user.email || userId,
      //   user_name: data.user.user_metadata.first_name || userName,
      // });

      // if (response3.error) {
      //   return { success: false, message: response3.error.message };
      // } else {
      //   return { success: true, message: "회원 가입이 완료되었습니다." };
      // }

      const { error: dbError } = await supabaseAdmin
        .from("profiles") // 본인의 유저/프로필 테이블명으로 변경하세요
        .upsert(
          {
            id: user.id,
            user_id: user.email,
            user_name: user.user_metadata?.first_name || "신규 유저",
          },
          { onConflict: "id" },
        ); // 이미 존재하는 경우 에러 방지용 오버라이트 규칙

      if (dbError) {
        console.error("DB 유저 등록 실패:", dbError.message);
        // 실패 시 에러 페이지로 리다이렉트 하거나 예외 처리를 합니다.
        return NextResponse.redirect(`${origin}/auth/auth-error`);
      }
    }
  }

  // 3. 모든 작업이 성공하면 원하는 페이지(대시보드 등)로 유저를 이동시킵니다.
  return NextResponse.redirect(`${origin}${next}`);
}

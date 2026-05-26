import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function addUserToDB(user) {
  const supabase = await createClient();
  const { error: dbError } = await supabase.from("profiles").upsert(
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
  return { success: true };
}

async function signInUser(userName, password) {
  const supabase = await createClient();
  // Id, aud, role, email etc...
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userName,
    password: password,
  });
  // error fall case
  if (!data.user) {
    if (error && error.code === "email_not_confirmed") {
      return { success: false, message: "이메일 인증이 필요합니다." };
    } else {
      return {
        success: false,
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
      };
    }
  }

  const { data: isExists, error: isExistsError } = await supabase.rpc(
    "check_profile_exists",
    { id: data.user.id },
  );
  // DB public table에 정보 추가
  if (!isExists) {
    await addUserToDB(data.user);
  }

  // TODO: 팀 정보 추가
  const response = await supabase.from("team_members").select("team_id");

  if (response.data.length === 0) {
    return {
      success: true,
      id: data.user.id,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      teamName: null,
      teamCode: null,
    };
  }

  const teamResponse = await supabase
    .from("team")
    .select("team_code, team_name")
    .eq("team_id", response.data[0].team_id);

  return {
    success: true,
    id: data.user.id,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    teamName: teamResponse.data[0].team_name,
    teamCode: teamResponse.data[0].team_code,
  };
}

async function POST(req) {
  const { userName, password } = await req.json();
  const response = await signInUser(userName, password);

  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }

  return NextResponse.json({
    success: response.success,
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    // TODO: 팀 정보 추가
    id: response.id,
    teamName: response.teamName,
    teamCode: response.teamCode,
  });
}

export { POST };

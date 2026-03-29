import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function checkUser(id) {
  const supabase = await createClient();
  const response = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", id);

  if (response.data && response.data.length === 0) {
    return { success: true, message: "사용 가능한 아이디입니다." };
  }
  return { success: false, message: "이미 존재하는 아이디입니다." };
}

async function createTeam(teamCode) {
  const supabase = await createClient();
  const response = await supabase
    .from("team")
    .insert({
      team_code: teamCode,
    })
    .select();

  if (response.error) {
    return { success: false, message: response.error.message };
  }

  return {
    success: true,
    message: "팀이 생성되었습니다.",
    teamId: response.data[0].team_id,
  };
}

async function checkTeamCode(teamCode) {
  const supabase = await createClient();
  const response = await supabase
    .from("team")
    .select("team_id")
    .eq("team_code", teamCode);

  if (response.error) {
    return { success: false, message: response.error.message };
  }
  if (response.data.length === 0) {
    return null;
  } else {
    return response.data[0].team_id;
  }
}

async function signUpUser(userId, userName, password, teamCode) {
  const supabase = await createClient();

  const teamId = await checkTeamCode(teamCode);
  let localTeamId = teamId;

  if (!teamId) {
    const response2 = await createTeam(teamCode);

    if (!response2.success) {
      return { success: false, message: response2.message };
    } else {
      localTeamId = response2.teamId;
    }
  }

  const response = await supabase.from("profiles").insert({
    user_id: userId,
    user_name: userName,
    password: password,
    team_id: localTeamId,
  });

  if (response.error) {
    return { success: false, message: response.error.message };
  }
  return { success: true, message: "회원 가입이 완료되었습니다." };
}

async function POST(req) {
  const { userId, userName, password, teamCode } = await req.json();
  const response = await checkUser(userId);

  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }

  const response2 = await signUpUser(userId, userName, password, teamCode);
  if (!response2.success) {
    return NextResponse.json({ success: false, message: response2.message });
  } else {
    return NextResponse.json({ success: true, message: response2.message });
  }
}

export { POST };

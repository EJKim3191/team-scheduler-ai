import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function createTeam(teamCode, teamName, token, refresh_token) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    return { success: false, message: sessionError.message };
  }

  const response = await supabase
    .from("team")
    .insert({
      team_code: teamCode,
      team_name: teamName,
      owner: sessionData.user.id,
    })
    .select();

  if (response.error) {
    return { success: false, message: response.error.message };
  }

  const response2 = await supabase.from("team_members").insert({
    team_id: response.data[0].team_id,
    profile_id: sessionData.user.id,
  });

  if (response2.error) {
    return { success: false, message: response2.error.message };
  }

  return {
    success: true,
    message: "팀 멤버가 추가되었습니다.",
    teamId: response.data[0].team_id,
  };
}

async function checkTeamCount() {
  const supabase = await createClient();
  const response = await supabase.from("team").select("*");

  if (response.error) {
    return { success: false, message: response.error.message };
  }

  // plan별 팀 개수 체크
  const plan = "free";
  switch (plan) {
    case "free":
      if (response.data.length >= 4) {
        return { success: false, message: "팀 개수 초과" };
      }
      break;
    case "premium":
      if (response.data.length >= 10) {
        return { success: false, message: "팀 개수 초과" };
      }
      break;
  }
  return { success: true, message: "팀 생성 가능." };
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
    return { success: true, message: "팀 코드 존재하지 않음." };
  } else {
    return {
      success: false,
      message: "팀 코드가 존재합니다",
      teamId: response.data[0].team_id,
    };
  }
}

async function POST(req) {
  const { teamCode, teamName, token, refresh_token } = await req.json();

  const teamCount = await checkTeamCount();
  if (!teamCount.success) {
    return NextResponse.json({ success: false, message: teamCount.message });
  }

  const teamId = await checkTeamCode(teamCode);

  if (teamId.success) {
    //TODO: 팀 없이 아이디 생성
    const response2 = await createTeam(
      teamCode,
      teamName,
      token,
      refresh_token,
    );

    if (!response2.success) {
      return NextResponse.json({
        success: false,
        message: response2.message,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: response2.message,
        teamId: response2.teamId,
      });
    }
  }
  return NextResponse.json({
    success: false,
    message: teamId.message,
    teamId: teamId.teamId,
  });
}

export { POST };

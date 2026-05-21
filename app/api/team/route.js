import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

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

async function POST(req) {
  const { teamCode } = await req.json();
  // const response = await checkUser(userId);

  // if (!response.success) {
  //   return NextResponse.json({ success: false, message: response.message });
  // }

  const teamId = await checkTeamCode(teamCode);
  let localTeamId = teamId;

  if (!teamId) {
    //TODO: 팀 없이 아이디 생성
    const response2 = await createTeam(teamCode);

    if (!response2.success) {
      return { success: false, message: response2.message };
    } else {
      localTeamId = response2.teamId;
    }
  }

  const response2 = await signUpUser(userId, userName, password);
  if (!response2.success) {
    return NextResponse.json({ success: false, message: response2.message });
  } else {
    return NextResponse.json({ success: true, message: response2.message });
  }
}

export { POST };

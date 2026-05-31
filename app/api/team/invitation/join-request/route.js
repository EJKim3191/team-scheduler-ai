import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function sendJoinRequest(access_token, refresh_token, teamCode) {
  const supabase = await createClient();
  console.log("access_token", access_token);
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  if (sessionError) {
    console.log("sessionError", sessionError);
    return { success: false, message: sessionError.message };
  }
  const { data: teamData, error: teamError } = await supabase
    .from("team")
    .select("team_id")
    .eq("team_code", teamCode);

  if (teamError) {
    console.log("teamError", teamError);
    return { success: false, message: teamError.message };
  }
  if (teamData.length === 0) {
    return { success: false, message: "팀 코드가 올바르지 않습니다." };
  }
  const { data: teamAccessRequestData, error: teamAccessRequestError } =
    await supabase.from("team_access_request").insert({
      team_id: teamData[0].team_id,
      profile_id: sessionData.user.id,
      status: "pending",
    });

  if (teamAccessRequestError) {
    if (teamAccessRequestError.code === "23505") {
      return { success: false, message: "이미 존재하는 요청입니다." };
    }
    return { success: false, message: teamAccessRequestError.message };
  }
  return { success: true, message: "Join request sent" };
}

async function POST(req) {
  const { access_token, refresh_token, teamCode } = await req.json();
  const response = await sendJoinRequest(access_token, refresh_token, teamCode);
  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }
  return NextResponse.json({ success: true, message: response.message });
}

export { POST };

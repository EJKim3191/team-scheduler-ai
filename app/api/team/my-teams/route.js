import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getMyTeam(access_token, refresh_token) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    return { success: false, message: sessionError.message };
  }

  const { data: myTeams } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", sessionData.user.id);

  return {
    success: true,
    message: "My teams fetched successfully",
    teams: myTeams,
  };
}

async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getMyTeam(access_token, refresh_token);
  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }
  return NextResponse.json({
    success: true,
    message: response.message,
    teams: response.teams,
  });
}

export { POST };

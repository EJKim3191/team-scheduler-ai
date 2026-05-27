import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getTeam(access_token, refresh_token) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const response = await supabase
    .from("team")
    .select("team_id, team_code, team_name");

  if (response.error) {
    return { success: false, message: response.error.message };
  }
  return { success: true, message: response.message, teams: response.data };
}
async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getTeam(access_token, refresh_token);
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

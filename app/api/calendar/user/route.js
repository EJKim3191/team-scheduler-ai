import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserData(access_token, refresh_token) {
  const calenderData = [];
  const supabase = await createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    console.error("세션 설정 실패:", sessionError.message);
    return;
  }
  const { data, error } = await supabase.from("team_members").select("*");

  const { data: profiles } = await supabase.from("profiles").select("*");

  const { data: schedules_data, error: schedules_error } = await supabase
    .from("user_schedules")
    .select("*");

  for (const profile of profiles) {
    const { data: schedule, error } = await supabase
      .from("user_schedules")
      .select("*")
      .eq("profile_id", profile.id);

    calenderData.push({ user_name: profile.user_name, schedule });
  }

  return calenderData;
}
// api/calendar/user
async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getUserData(access_token, refresh_token);

  return NextResponse.json({ response });
}

export { POST };

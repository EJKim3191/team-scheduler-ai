import { createClient } from "@/lib/supabase/server";

export async function getUserData(access_token, refresh_token, team_id) {
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
  // const { data, error } = await supabase
  //   .from("team_members")
  //   .select("*")
  //   .eq("team_id", team_id);

  // const { data: profiles } = await supabase.from("profiles").select("*");

  const { data: schedules_data, error: schedules_error } = await supabase
    .from("user_schedules")
    .select(
      `
      team_id,
      profile_id,
      start_time,
      schedule_id,
      issue_id,
      profiles (
        user_name
      )
    `,
    )
    .eq("team_id", team_id);

  return schedules_data;
}

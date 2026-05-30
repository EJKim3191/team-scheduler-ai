import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserLogs(access_token, refresh_token) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const { data: teamIds, error: teamIdsError } = await supabase
    .from("team_members")
    .select("team_id")
    .filter("profile_id", "eq", (await supabase.auth.getUser()).data.user?.id);

  if (teamIdsError) {
    return { success: false, message: teamIdsError.message };
  }

  const { data: logs, error } = await supabase
    .from("activity_logs")
    .select(
      `
    id,
    team_id,
    action_type,
    description,
    created_at,
    actor_id,
    team (
      team_name
    )
  `,
    )
    .in(
      "team_id",
      teamIds.map((team) => team.team_id),
    )
    .order("created_at", { ascending: false }) // 최신순 정렬
    .limit(10); // 최근 10개 제한
  // 윗 부분 RPC 함수 정의 가능 (리팩토링 고려 요소)

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    logs: logs,
  };
}

async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getUserLogs(access_token, refresh_token);

  return NextResponse.json(response);
}

export { POST };

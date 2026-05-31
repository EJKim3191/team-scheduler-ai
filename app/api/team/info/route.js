import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getTeam(access_token, refresh_token, additionalInfo = false) {
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

  const { data: teams, error: teamsError } = await supabase
    .from("team")
    .select("team_id, team_code, team_name, last_updated")
    .in(
      "team_id",
      myTeams.map((team) => team.team_id),
    );

  if (teamsError) {
    return { success: false, message: teamsError.message };
  }

  if (additionalInfo) {
    let teamData = [];
    // 팀 갯수가 정해져있으므로 가능하나 팀이 많을 경우 수정 필요할 수 있음
    for (const team of teams) {
      const { success, data } = await getTeamMembersAdditionalInfo(
        access_token,
        refresh_token,
        team.team_id,
      );
      if (success) {
        teamData.push({ ...team, members: data.count });
      }
    }
    return {
      success: true,
      message: "팀 정보가 조회되었습니다.",
      teams: teamData,
    };
  }

  return { success: true, message: "팀 정보가 조회되었습니다.", teams: teams };
}

async function getTeamMembersAdditionalInfo(
  access_token,
  refresh_token,
  teamId,
) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  if (sessionError) {
    return { success: false, message: sessionError.message };
  }

  // count 쿼리 사용
  const { count, error } = await supabase
    .from("team_members")
    .select("*", { count: "exact", head: true })
    .eq("team_id", teamId);

  if (error) {
    return { success: false, message: error.message };
  }

  const returnData = {
    count: count,
  };

  return { success: true, data: returnData };
}

async function POST(req) {
  const {
    access_token,
    refresh_token,
    additionalInfo = false,
  } = await req.json();
  const response = await getTeam(access_token, refresh_token, additionalInfo);
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

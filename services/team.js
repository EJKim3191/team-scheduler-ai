import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getMyTeam(access_token, refresh_token) {
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

export async function getTeamMembersAdditionalInfo(
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

export async function getTeamInfo(
  access_token,
  refresh_token,
  additionalInfo = false,
  myTeams,
) {
  const supabase = await createClient();
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

function getJoinedAt(list) {
  if (!list || list.length === 0) return null;

  return list.reduce((latest, current) => {
    return new Date(current.joined_at) > new Date(latest)
      ? current.joined_at
      : latest;
  }, list[0].joined_at);
}

export async function getTeamJoinedAt(access_token) {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    },
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(access_token);

  if (authError || !user) {
    return {
      success: false,
      message: authError?.message || "유효하지 않은 토큰입니다.",
    };
  }

  const { data: joined_at, error: joined_at_error } = await supabase
    .from("team_members")
    .select("joined_at")
    .eq("profile_id", user.id);

  if (joined_at_error) {
    return { success: false, message: joined_at_error.message };
  }

  return {
    success: true,
    message: "Team joined at fetched successfully",
    joined_at: getJoinedAt(joined_at),
  };
}

///
function getLatestUpdatedDate(list) {
  if (!list || list.length === 0) return null;

  return list.reduce((latest, current) => {
    return new Date(current.last_updated) > new Date(latest)
      ? current.last_updated
      : latest;
  }, list[0].last_updated);
}

export async function getTeamLastUpdated(teamId) {
  const supabaseAdmin = await createAdminClient();

  const { data: last_updated, error: last_updated_error } = await supabaseAdmin
    .from("team")
    .select("last_updated")
    .in(
      "team_id",
      teamId.map((id) => Number(id)),
    );

  if (last_updated_error) {
    return { success: false, message: last_updated_error.message };
  }

  return {
    success: true,
    message: "Team last updated fetched successfully",
    last_updated: getLatestUpdatedDate(last_updated),
  };
}

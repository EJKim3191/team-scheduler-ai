import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserIssue(access_token, refresh_token) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  const { data: teamIds, error: teamIdsError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", sessionData.user.id);

  const { data: issues, error } = await supabase
    .from("issues")
    .select(
      `
      id,
      team_id,
      title,
      status,
      created_at,
      team (
        team_name
      )
    `,
    )
    .in(
      "team_id",
      teamIds.map((team) => team.team_id),
    );

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, issues: issues };
}

async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getUserIssue(access_token, refresh_token);

  return NextResponse.json(response);
}

export { POST };

import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function createTeamIssue(access_token, refresh_token, teamId, issue) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  const { data: issues, error: issuesError } = await supabase
    .from("issues")
    .insert({
      team_id: teamId,
      title: issue.title,
      description: issue.description,
      due_date: issue.due_date,
      created_by: sessionData.user.id,
    });

  if (issuesError) {
    return { success: false, message: issuesError.message };
  }

  return { success: true, message: "이슈가 추가되었습니다.", issue: issues };
}

async function POST(req) {
  const { access_token, refresh_token, teamId, issue } = await req.json();

  const response = await createTeamIssue(
    access_token,
    refresh_token,
    teamId,
    issue,
  );

  return NextResponse.json(response);
}

export { POST };

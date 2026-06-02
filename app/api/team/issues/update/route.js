import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function updateTeamIssue(access_token, refresh_token, issueId, status) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  const { data: issue, error: issueError } = await supabase
    .from("issues")
    .update({ status: status })
    .eq("id", issueId);

  if (issueError) {
    return { success: false, message: issueError.message };
  }

  return {
    success: true,
    message: "이슈 상태가 변경되었습니다.",
    issue: issue,
  };
}

async function PUT(req) {
  const { access_token, refresh_token, issueId, status } = await req.json();
  const response = await updateTeamIssue(
    access_token,
    refresh_token,
    issueId,
    status,
  );
  return NextResponse.json(response);
}

export { PUT };

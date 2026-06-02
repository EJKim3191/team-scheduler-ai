import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getTeamIssue(access_token, refresh_token, teamId, issue) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
}

async function POST(req) {
  const { access_token, refresh_token, teamId, issue } = await req.json();
  const response = await getTeamIssue(
    access_token,
    refresh_token,
    teamId,
    issue,
  );
  return NextResponse.json(response);
}

export { POST };

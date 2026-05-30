import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserIssueParticipation(access_token, refresh_token, issues) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  const { data: userSchedules, error: userSchedulesError } = await supabase
    .from("user_schedules")
    .select("*", { count: "exact" })
    .in(
      "issue_id",
      issues.map((issue) => issue.id),
    )
    .eq("profile_id", sessionData.user.id);

  if (userSchedulesError) {
    return {
      success: false,
      userSchedules: [],
      message: userSchedulesError.message,
      error: userSchedulesError,
    };
  }

  return {
    success: true,
    userSchedules: userSchedules.length,
    message: "참여 이슈 조회 성공",
  };
}

async function POST(req) {
  const { access_token, refresh_token, issues } = await req.json();
  const response = await getUserIssueParticipation(
    access_token,
    refresh_token,
    issues,
  );

  return NextResponse.json(response);
}

export { POST };

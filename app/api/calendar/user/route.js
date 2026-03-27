import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserData(token) {
  const calenderData = [];
  const supabase = await createClient();

  const { data: team_id } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", token);

  console.log("team_id", team_id[0].team_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("team_id", team_id[0].team_id);

  for (const profile of profiles) {
    const { data: schedule, error } = await supabase
      .from("user_schedules")
      .select("*")
      .eq("profile_id", profile.id);

    calenderData.push({ user_name: profile.user_name, schedule });
  }

  return calenderData;
}

async function POST(req) {
  const { token } = await req.json();
  const response = await getUserData(token);

  return NextResponse.json({ response });
}

export { POST };

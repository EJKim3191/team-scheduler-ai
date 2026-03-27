import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function signInUser(userName, password) {
  const supabase = await createClient();
  const response = await supabase
    .from("profiles")
    .select("id, team_id")
    .eq("user_id", userName)
    .eq("password", password.toString());

  console.log("response1", response);

  if (response.data.length === 0) {
    return null;
  }

  const teamResponse = await supabase
    .from("team")
    .select("team_code, team_name")
    .eq("team_id", response.data[0].team_id);

  console.log("teamResponse", teamResponse);

  return {
    success: true,
    id: response.data[0].id,
    teamName: teamResponse.data[0].team_name,
    teamCode: teamResponse.data[0].team_code,
  };
}

async function POST(req) {
  const { userName, password } = await req.json();
  const response = await signInUser(userName, password);

  return NextResponse.json({
    success: true,
    id: response.id,
    teamName: response.teamName,
    teamCode: response.teamCode,
  });
}

export { POST };

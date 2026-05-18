import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function signInUser(userName, password) {
  const supabase = await createClient();
  // Id, aud, role, email etc...
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userName,
    password: password,
  });

  // error fall case
  if (!data.user) {
    return null;
  }

  // TODO: 팀 정보 추가
  const response = await supabase
    .from("profiles")
    .select("id, team_id")
    .eq("id", data.user.id);

  if (response.data.length === 0) {
    return {
      success: true,
      id: data.user.id,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      teamName: null,
      teamCode: null,
    };
  }

  const teamResponse = await supabase
    .from("team")
    .select("team_code, team_name")
    .eq("team_id", response.data[0].team_id);

  return {
    success: true,
    id: data.user.id,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    teamName: teamResponse.data[0].team_name,
    teamCode: teamResponse.data[0].team_code,
  };
}

async function POST(req) {
  const { userName, password } = await req.json();
  const response = await signInUser(userName, password);

  return NextResponse.json({
    success: true,
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    // TODO: 팀 정보 추가
    id: response.id,
    teamName: response.teamName,
    teamCode: response.teamCode,
  });
}

export { POST };

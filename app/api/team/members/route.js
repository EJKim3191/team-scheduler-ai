import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getTeamMembers(access_token, refresh_token, teamId) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const { data: members, error } = await supabase
    .from("team_members")
    .select(
      `
    role,
    profiles (
      user_name,
      user_id
    )
  `,
    )
    .eq("team_id", teamId);

  if (error) {
    return { success: false, message: error.message };
  }
  return {
    success: true,
    message: "Members fetched successfully",
    members: members,
  };
}

async function getMyRole(access_token, refresh_token, teamId) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const { data: role, error } = await supabase
    .from("team_members")
    .select("role")
    .match({ team_id: teamId, profile_id: sessionData.user.id });

  if (error) {
    return { success: false, message: error.message };
  }
  return {
    success: true,
    message: "Role fetched successfully",
    role: role[0].role,
  };
}

async function POST(req) {
  const { access_token, refresh_token, teamId } = await req.json();
  const response = await getTeamMembers(access_token, refresh_token, teamId);
  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }
  const myRole = await getMyRole(access_token, refresh_token, teamId);
  if (!myRole.success) {
    return NextResponse.json({ success: false, message: myRole.message });
  }

  return NextResponse.json({
    success: true,
    message: response.message,
    members: response.members,
    myRole: myRole.role,
  });
}

export { POST };

import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getInvitationSent(access_token, refresh_token, teamId) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const { data: invitations, error: invitationsError } = await supabase
    .from("team_invitation")
    .select("*")
    .eq("team_id", teamId);
  if (invitationsError) {
    return { success: false, message: invitationsError.message };
  }

  console.log("invitationsSent", invitations);
  console.log("--------------------------------");
  return {
    success: true,
    message: invitations.message,
    invitations: invitations,
  };
}

async function getInvitationReceived(access_token, refresh_token, teamId) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  console.log("teamId", teamId);
  if (sessionError) {
    return { success: false, message: sessionError.message };
  }

  let invitationsWithProfile = [];

  const { data: invitations, error: invitationsError } = await supabase
    .from("team_access_request")
    .select("*")
    .eq("team_id", teamId);

  for (const invitation of invitations) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_name, user_id")
      .eq("id", invitation.profile_id);

    console.log("profile", profile);
    if (profileError) {
      return { success: false, message: profileError.message };
    }
    invitationsWithProfile.push({
      ...invitation,
      profile: profile[0],
    });
  }

  if (invitationsError) {
    return { success: false, message: invitationsError.message };
  }

  console.log("invitationsReceived", invitationsWithProfile);
  console.log("--------------------------------");
  return {
    success: true,
    message: invitations.message,
    invitations: invitationsWithProfile,
  };
}

async function POST(req) {
  const { access_token, refresh_token, teamId } = await req.json();
  const responseSent = await getInvitationSent(
    access_token,
    refresh_token,
    teamId,
  );

  if (!responseSent.success) {
    return NextResponse.json({ success: false, message: responseSent.message });
  }

  const responseReceived = await getInvitationReceived(
    access_token,
    refresh_token,
    teamId,
  );

  if (!responseReceived.success) {
    return NextResponse.json({
      success: false,
      message: responseReceived.message,
    });
  }

  console.log("responseSent", responseSent);
  console.log("responseReceived", responseReceived);

  return NextResponse.json({
    success: true,
    message: responseSent.message,
    invitationsSent: responseSent.invitations,
    invitationsReceived: responseReceived.invitations,
  });
}

export { POST };

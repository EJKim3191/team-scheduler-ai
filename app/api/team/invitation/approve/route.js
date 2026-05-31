import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function approveInvitation(access_token, refresh_token, invitation) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const { error: invitationError } = await supabase
    .from("team_access_request")
    .update({ status: "approved" })
    .eq("id", invitation.id);

  if (invitationError) {
    return { success: false, message: invitationError.message };
  }

  const { data: teamMembers, error: teamMembersError } = await supabase
    .from("team_members")
    .insert({
      profile_id: invitation.profile_id,
      team_id: invitation.team_id,
      role: "member",
    });

  if (teamMembersError) {
    return { success: false, message: teamMembersError.message };
  }

  return {
    success: true,
    message: "Invitation approved",
    teamMembers: teamMembers,
  };
}

async function cancelInvitation(access_token, refresh_token, invitation) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });
  if (sessionError) {
    return { success: false, message: sessionError.message };
  }
  const { data: invitationData, error: invitationError } = await supabase
    .from("team_access_request")
    .update({ status: "rejected" })
    .eq("id", invitation.id);

  if (invitationError) {
    return { success: false, message: invitationError.message };
  }
  return { success: true, message: "Invitation rejected" };
}

async function POST(req) {
  const { access_token, refresh_token, invitation, action } = await req.json();

  if (action === "approve") {
    {
      const response = await approveInvitation(
        access_token,
        refresh_token,
        invitation,
      );
      if (!response.success) {
        return NextResponse.json({ success: false, message: response.message });
      }
      return NextResponse.json({ success: true, message: response.message });
    }

    return NextResponse.json(response);
  }

  const response = await cancelInvitation(
    access_token,
    refresh_token,
    invitation,
  );
  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }
  return NextResponse.json({ success: true, message: response.message });
}

export { POST };

import { createAdminClient } from "@/lib/supabase/admin";
const { NextResponse } = require("next/server");

function getLatestUpdatedDate(list) {
  if (!list || list.length === 0) return null;

  return list.reduce((latest, current) => {
    return new Date(current.last_updated) > new Date(latest)
      ? current.last_updated
      : latest;
  }, list[0].last_updated);
}

async function getTeamLastUpdated(teamId) {
  const supabaseAdmin = await createAdminClient();

  const { data: last_updated, error: last_updated_error } = await supabaseAdmin
    .from("team")
    .select("last_updated")
    .in(
      "team_id",
      teamId.map((id) => Number(id)),
    );

  if (last_updated_error) {
    return { success: false, message: last_updated_error.message };
  }

  return {
    success: true,
    message: "Team last updated fetched successfully",
    last_updated: getLatestUpdatedDate(last_updated),
  };
}

async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.getAll("teamId");
  const { success, message, last_updated } = await getTeamLastUpdated(teamId);
  if (success) {
    return NextResponse.json({
      success: true,
      message: message,
      last_updated: last_updated,
    });
  }
  return NextResponse.json({ success: false, message: message });
}

export { GET };

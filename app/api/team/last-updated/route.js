const { NextResponse } = require("next/server");

import { getTeamLastUpdated as getTeamLastUpdatedService } from "@/services/team";

async function GET(request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.getAll("teamId");
  const { success, message, last_updated } =
    await getTeamLastUpdatedService(teamId);
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

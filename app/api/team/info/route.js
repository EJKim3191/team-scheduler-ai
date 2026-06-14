import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

import { getTeamInfo as getTeamInfoService } from "@/services/team";

async function POST(req) {
  const {
    access_token,
    refresh_token,
    additionalInfo = false,
    myTeams,
    lastUpdated,
  } = await req.json();

  const response = await getTeamInfoService(
    access_token,
    refresh_token,
    additionalInfo,
    myTeams,
  );
  if (!response.success) {
    return NextResponse.json({ success: false, message: response.message });
  }
  return NextResponse.json({
    success: true,
    message: response.message,
    teams: response.teams,
  });
}

export { POST };

import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

import { getMyTeam as getMyTeamService } from "@/services/team";

async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getMyTeamService(access_token, refresh_token);
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

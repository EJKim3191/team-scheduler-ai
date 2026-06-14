import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

import { getUserData as getUserDataService } from "@/services/calendar";

// api/calendar/user
async function POST(req) {
  const { access_token, refresh_token, team_id } = await req.json();
  const response = await getUserDataService(
    access_token,
    refresh_token,
    team_id,
  );

  return NextResponse.json({ response });
}

export { POST };

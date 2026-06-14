import { createClient } from "@supabase/supabase-js";
const { NextResponse } = require("next/server");

import { getTeamJoinedAt as getTeamJoinedAtService } from "@/services/team";

async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return NextResponse.json({ error: "토큰이 없습니다." });

  const { success, message, joined_at } = await getTeamJoinedAtService(token);
  if (success) {
    return NextResponse.json({
      success: true,
      message: message,
      joined_at: joined_at,
    });
  }
  return NextResponse.json({ success: false, message: message });
}

export { GET };

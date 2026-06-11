import { createClient } from "@supabase/supabase-js";
const { NextResponse } = require("next/server");

function getJoinedAt(list) {
  if (!list || list.length === 0) return null;

  return list.reduce((latest, current) => {
    return new Date(current.joined_at) > new Date(latest)
      ? current.joined_at
      : latest;
  }, list[0].joined_at);
}

async function getTeamJoinedAt(access_token) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    },
  );
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(access_token);

  if (authError || !user) {
    return {
      success: false,
      message: authError?.message || "유효하지 않은 토큰입니다.",
    };
  }

  const { data: joined_at, error: joined_at_error } = await supabase
    .from("team_members")
    .select("joined_at")
    .eq("profile_id", user.id);

  if (joined_at_error) {
    return { success: false, message: joined_at_error.message };
  }

  return {
    success: true,
    message: "Team joined at fetched successfully",
    joined_at: getJoinedAt(joined_at),
  };
}

async function GET(request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return NextResponse.json({ error: "토큰이 없습니다." });

  const { success, message, joined_at } = await getTeamJoinedAt(token);
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

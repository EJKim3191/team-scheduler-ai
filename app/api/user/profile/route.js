import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserData(access_token, refresh_token) {
  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

  if (sessionError) {
    return { success: false, message: sessionError.message };
  }

  return {
    success: true,
    message: "Profile fetched successfully",
    profile: sessionData.user,
  };
}

async function POST(req) {
  const { access_token, refresh_token } = await req.json();
  const response = await getUserData(access_token, refresh_token);

  return NextResponse.json(response);
}

export { POST };

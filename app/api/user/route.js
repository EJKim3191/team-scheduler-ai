import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function getUserData(userName, password) {
  const supabase = await createClient();
  const response = await supabase
    .from("profiles")
    .select("id")
    .eq("user_name", userName)
    .eq("password", password.toString());

  if (response.data.length === 0) {
    return null;
  }
  return response.data[0].id;
}

async function POST(req) {
  const { userName, password } = await req.json();
  const response = await getUserData(userName, password);

  return NextResponse.json(response);
}

export { POST };

import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function signInUser(userName, password) {
  const supabase = await createClient();
  const response = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userName)
    .eq("password", password.toString());
  console.log("response1", response);
  if (response.data.length === 0) {
    return null;
  }
  return { success: true, id: response.data[0].id };
}

async function POST(req) {
  const { userName, password } = await req.json();
  const response = await signInUser(userName, password);
  console.log("response2", response);
  return NextResponse.json({ success: true, id: response.id });
}

export { POST };

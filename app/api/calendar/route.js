import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function deleteUserDataById(ids) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_schedules")
    .delete()
    .in("id", ids); // 삭제할 행의 ID 지정

  if (error) {
    console.error("삭제 중 오류 발생:", error.message);
    return { success: false, error };
  }

  return { success: true, data };
}

async function addUserData(access_token, refresh_token, scheduleData) {
  const supabase = await createClient();

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: access_token,
    refresh_token: refresh_token,
  });

  if (sessionError) {
    console.error("세션 설정 실패:", sessionError.message);
    return;
  }

  const { data, error } = await supabase
    .from("user_schedules")
    .upsert(scheduleData, {
      onConflict: "profile_id, start_time, issue_id",
      ignoreDuplicates: true,
    });

  return { data, error };
}

async function POST(req) {
  const { access_token, refresh_token, data } = await req.json();
  const response = await addUserData(access_token, refresh_token, data);

  return NextResponse.json({ response });
}

async function DELETE(req) {
  const { selectedIds } = await req.json();
  const response = await deleteUserDataById(selectedIds);

  return NextResponse.json({ response });
}

export { DELETE, POST };

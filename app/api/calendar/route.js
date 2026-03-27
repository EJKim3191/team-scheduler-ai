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

async function addUserData(scheduleData) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_schedules")
    // .insert(scheduleData);
    .upsert(scheduleData, {
      onConflict: "profile_id, start_time", // 이 두 값이 겹치면
      ignoreDuplicates: true, // 새로운 PK 생성 없이 무시함
    });
  return { data, error };
}

async function POST(req) {
  const scheduleData = await req.json();
  const response = await addUserData(scheduleData);

  return NextResponse.json({ response });
}

async function DELETE(req) {
  const { selectedIds } = await req.json();
  const response = await deleteUserDataById(selectedIds);

  return NextResponse.json({ response });
}

export { DELETE, POST };

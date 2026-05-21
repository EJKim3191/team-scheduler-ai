import { createClient } from "@/lib/supabase/server";
const { NextResponse } = require("next/server");

async function signUpUser(userId, userName, password) {
  const supabase = await createClient();
  // const teamId = await checkTeamCode(teamCode);
  // let localTeamId = teamId;

  // if (!teamId) {
  //   const response2 = await createTeam(teamCode);

  //   if (!response2.success) {
  //     return { success: false, message: response2.message };
  //   } else {
  //     localTeamId = response2.teamId;
  //   }
  // }

  // const response = await supabase.from("profiles").insert({
  //   user_id: userId,
  //   user_name: userName,
  //   password: password,
  //   team_id: localTeamId,
  // });

  // if (response.error) {
  //   return { success: false, message: response.error.message };
  // }
  // return { success: true, message: "회원 가입이 완료되었습니다." };
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userId,
      password: password,
      options: {
        redirectTo: `${process.env.REDIRECT_URL}/auth/callback?next=/`,
        data: {
          first_name: userName,
        },
      },
    });

    // 중복 검사
    if (data.user && data.user.identities && data.user.identities.length === 0)
      return { success: false, message: "이미 존재하는 아이디입니다." };

    // const response3 = await supabase.from("profiles").insert({
    //   id: data.user.id,
    //   user_id: data.user.email || userId,
    //   user_name: data.user.user_metadata.first_name || userName,
    // });

    // if (response3.error) {
    //   return { success: false, message: response3.error.message };
    // } else {
    //   return { success: true, message: "회원 가입이 완료되었습니다." };
    // }

    return { success: true, message: "이메일 인증 메일이 발송되었습니다." };
  } catch (error) {
    console.error(error);
  }
}

async function POST(req) {
  const { userId, userName, password, teamCode } = await req.json();
  // const response = await checkUser(userId);

  // if (!response.success) {
  //   return NextResponse.json({ success: false, message: response.message });
  // }

  const response2 = await signUpUser(userId, userName, password);
  if (!response2.success) {
    return NextResponse.json({ success: false, message: response2.message });
  } else {
    return NextResponse.json({ success: true, message: response2.message });
  }
}

export { POST };

import Image from "next/image";
import styles from "./page.module.css";
import CalendarComponent from "./components/Calendar/Calendar";
import ChatComponent from "./components/Chat/Chat";
import TeamMateComponent from "./components/TeamMate/TeamMate";
import GradientBar from "./components/GradientBar/GradientBar";
import DatePickerComponent from "./components/DatePicker/DatePicker";
import Footer from "./components/Footer/Footer";
import Profile from "./components/Profile/Profile";
import TeamSelector from "./components/TeamSelector/TeamSelector";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const teamId = params.teamId;
  const cookieStore = await cookies();
  const access_token = cookieStore.get("sb-access-token");
  const refresh_token = cookieStore.get("sb-refresh-token");

  if (!access_token || !refresh_token) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token.value,
      refresh_token: refresh_token.value,
    });

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_name, id")
    .eq("id", sessionData.user.id);

  // 내가 있는 팀
  const { data: myTeams } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("profile_id", sessionData.user.id);

  if (myTeams.length === 0) {
    redirect("/make-team");
  }

  const { data: team } = await supabase
    .from("team")
    .select("team_id, team_code, team_name")
    .in(
      "team_id",
      myTeams.map((team) => team.team_id),
    );

  const matchedTeam = team.find((team) => team.team_id === Number(teamId));

  const selectedTeam = matchedTeam ? matchedTeam : team[0];

  //TODO: 다중 팀일 경우 선택된 팀
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.calendarContainer}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>{selectedTeam?.team_name}팀의 일정</h1>
            <TeamSelector teams={team} selectedTeamId={selectedTeam?.team_id} />
            <DatePickerComponent />
          </header>
          <div className={styles.profileHeader}>
            <Profile
              profile={profile}
              teams={team}
              selectedTeamId={selectedTeam?.team_id}
            />
          </div>
          <div className={styles.calendarCell}>
            <CalendarComponent team={selectedTeam} />
          </div>
          <div className={styles.mainRightContainer}>
            <GradientBar />
            <TeamMateComponent />
            <ChatComponent profile={profile} team={team} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

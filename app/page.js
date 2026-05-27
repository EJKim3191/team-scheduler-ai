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
  const token = cookieStore.get("sb-access-token");
  const refresh_token = cookieStore.get("sb-refresh-token");

  if (!token) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: token.value,
    refresh_token: refresh_token.value,
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_name, id");

  const { data: team } = await supabase
    .from("team")
    .select("team_id, team_code, team_name");

  const matchedTeam = team.find((team) => team.team_id === Number(teamId));

  if (team.length === 0) {
    redirect("/make-team");
  }

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

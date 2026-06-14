import Image from "next/image";
import styles from "./page.module.css";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CalendarComponent from "./components/Calendar/Calendar";
import ChatComponent from "./components/Chat/Chat";
import TeamMateComponent from "./components/TeamMate/TeamMate";
import GradientBar from "./components/GradientBar/GradientBar";
import DatePickerComponent from "./components/DatePicker/DatePicker";
import Footer from "./components/Footer/Footer";
import Profile from "./components/Profile/Profile";
import TeamSelector from "./components/TeamSelector/TeamSelector";
import IssueSelector from "./components/IssueSelector/IssueSelector";
import IssueStatus from "./components/IssueStatus/IssueStatus";

const siteUrl =
  process.env.VERCEL_ENV === "production"
    ? process.env.VERCEL_PROJECT_PRODUCTION_URL
    : process.env.VERCEL_URL;

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const teamId = params.teamId;
  const cookieStore = await cookies();
  const hasVisited = cookieStore.get("has-visited");
  const access_token = cookieStore.get("sb-access-token");
  const refresh_token = cookieStore.get("sb-refresh-token");

  if (!hasVisited) {
    redirect("/landing");
  }

  if (!access_token || !refresh_token) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.setSession({
      access_token: access_token.value,
      refresh_token: refresh_token.value,
    });

  const getProfile = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_name, id")
      .eq("id", sessionData.user.id);
    return profile;
  };

  const getMyTeams = async () => {
    const { data: myTeams } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("profile_id", sessionData.user.id);
    return myTeams;
  };

  const [profile, myTeams] = await Promise.all([getProfile(), getMyTeams()]);

  // 내가 있는 팀
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

  if (!teamId) {
    redirect(`/?teamId=${team[0].team_id}`);
  }

  const matchedTeam = team.find((team) => team.team_id === Number(teamId));
  const selectedTeam = matchedTeam ? matchedTeam : team[0];

  const getIssues = async () => {
    const { data: issues } = await supabase
      .from("issues")
      .select("*")
      .eq("team_id", selectedTeam?.team_id);
    return issues;
  };

  const getTeamMembers = async () => {
    const { data: teamMembers } = await supabase
      .from("team_members")
      .select(
        `*, profiles (
      user_name
    )`,
      )
      .eq("team_id", selectedTeam?.team_id);

    return teamMembers;
  };

  const [issues, teamMembers] = await Promise.all([
    getIssues(),
    getTeamMembers(),
  ]);

  const userCalendarData = async (access_token, refresh_token, team_id) => {
    const response = await fetch(`/api/calendar/user`, {
      method: "POST",
      body: JSON.stringify({
        access_token: access_token,
        refresh_token: refresh_token,
        team_id: team_id,
      }),
    });

    return response.json();
  };

  const { response: userCalendarDataResponse } = await userCalendarData(
    access_token.value,
    refresh_token.value,
    selectedTeam?.team_id,
  );

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
            <CalendarComponent
              profile={profile[0]}
              team={selectedTeam}
              calendarData={userCalendarDataResponse}
            />
          </div>
          <div className={styles.mainRightContainer}>
            <div className={styles.issueSelectorWrap}>
              <IssueSelector issues={issues} />
            </div>
            <GradientBar />
            <TeamMateComponent
              teamMembers={teamMembers}
              calendarData={userCalendarDataResponse}
            />
            <IssueStatus issues={issues} />
            <ChatComponent profile={profile[0]} team={team} issues={issues} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

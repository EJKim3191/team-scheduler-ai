import Image from "next/image";
import styles from "./page.module.css";
import CalendarComponent from "./components/Calendar/Calendar";
import ChatComponent from "./components/Chat/Chat";
import TeamMateComponent from "./components/TeamMate/TeamMate";
import GradientBar from "./components/GradientBar/GradientBar";
import DatePickerComponent from "./components/DatePicker/DatePicker";
import Footer from "./components/Footer/Footer";
import Profile from "./components/Profile/Profile";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token");
  if (!token) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_name")
    .eq("id", token.value)
    .single();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.calendarContainer}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>팀 일정 조율기</h1>
            <DatePickerComponent />
          </header>
          <div className={styles.profileHeader}>
            <Profile name={profile?.user_name ?? "사용자"} />
          </div>
          <div className={styles.calendarCell}>
            <CalendarComponent />
          </div>
          <div className={styles.mainRightContainer}>
            <GradientBar />
            <TeamMateComponent />
            <ChatComponent />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

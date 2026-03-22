import Image from "next/image";
import styles from "./page.module.css";
import CalendarComponent from "./components/Calendar/Calendar";
import ChatComponent from "./components/Chat/Chat";
import TeamMateComponent from "./components/TeamMate/TeamMate";
import DatePickerComponent from "./components/DatePicker/DatePicker";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.calendarContainer}>
          <header className={styles.pageHeader}>
            <h1 className={styles.title}>팀 일정 조율기</h1>
            <DatePickerComponent />
          </header>
          <div className={styles.calendarCell}>
            <CalendarComponent />
          </div>
          <div className={styles.mainRightContainer}>
            <TeamMateComponent />
            <ChatComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

// 캘린더 컴포넌트 --> react-calendar 라이브러리 사용, 결과값만 보여주는 컴포넌트
// TODO: decompose this component
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { isTimeInRange } from "@/utils/timeStamp";
import "react-calendar/dist/Calendar.css";
import styles from "./Calendar.module.css";
import useCalander from "@/app/store/calander";
import { getCookie } from "@/utils/cookie";
import { useSearchParams } from "next/navigation";
import { getColorForUser } from "@/utils/userColor";

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0 ~ 23시

const TIME_BACKGROUND_COLOR = ["", "	#F5DEB3", "#f6c1a3", "#C4E1A6"];

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (일) ~ 6 (토)
  const diff = (day === 0 ? -6 : 1) - day; // 월요일 시작 기준
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const CalendarComponent = ({ profile, team, calendarData = [] }) => {
  const searchParams = useSearchParams();
  const issueId = searchParams.get("issueId");
  const teamId = searchParams.get("teamId");

  const [expandedCellKey, setExpandedCellKey] = useState(null);
  const [hoveredCellKey, setHoveredCellKey] = useState(null);
  const [userData, setUserData] = useState([]);

  const selectedDate = useCalander((state) => state.selectedDate);
  const selectedSchedule = useCalander((state) => state.selectedSchedule);
  const setSelectedSchedule = useCalander((state) => state.setSelectedSchedule);

  useEffect(() => {
    if (!issueId || !teamId) {
      setUserData([]);
      return;
    }

    const userCalendarData = calendarData.filter(
      (schedule) => Number(schedule.issue_id) === Number(issueId),
    );

    setUserData(userCalendarData);
  }, [team.team_id, issueId, teamId, calendarData]);

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [selectedDate]);

  const getUserData = (cellKey) => {
    const matchedUsers = [];

    if (!userData || userData.length === 0) return null;

    userData.forEach((schedule) => {
      if (isTimeInRange(cellKey, schedule.start_time)) {
        const userName = schedule.profiles.user_name || "";
        const initial = (userName && userName[0]) || "?";
        const backgroundColor = getColorForUser({
          profileId: schedule.profile_id,
          userName,
        });
        matchedUsers.push({
          id: schedule.profile_id,
          key: `${userName}-${schedule.start_time}-${cellKey}`,
          scheduleId: schedule.schedule_id,
          initial: initial.toUpperCase(),
          backgroundColor,
        });
      }
    });
    const userLength = matchedUsers.length;
    const isExpanded =
      expandedCellKey === cellKey || hoveredCellKey === cellKey;
    const visibleUsers = isExpanded ? matchedUsers : matchedUsers.slice(0, 3);

    let timeBG = "";
    const bgPercentage = userLength / userData.length;
    if (bgPercentage >= 1) {
      timeBG = TIME_BACKGROUND_COLOR[3];
    } else if (bgPercentage >= 0.5) {
      timeBG = TIME_BACKGROUND_COLOR[2];
    } else if (bgPercentage >= 0.8) {
      timeBG = TIME_BACKGROUND_COLOR[1];
    } else if (bgPercentage >= 0.5) {
      timeBG = TIME_BACKGROUND_COLOR[0];
    }

    return (
      <td
        key={cellKey}
        className={`${styles.dayCell} ${isExpanded ? styles.dayCellExpanded : ""}`}
        style={{
          border: "1px solid #f1f1f1",
          height: "clamp(26px, 4vw, 32px)",
          cursor: "pointer",
          backgroundColor: userLength >= 1 ? timeBG : "",
        }}
        tabIndex={userLength > 3 ? 0 : -1}
        onMouseEnter={() => {
          if (userLength > 3) setHoveredCellKey(cellKey);
        }}
        onMouseLeave={() => {
          setHoveredCellKey((prev) => (prev === cellKey ? null : prev));
        }}
        onFocus={() => {
          if (userLength > 3) setExpandedCellKey(cellKey);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setExpandedCellKey((prev) => (prev === cellKey ? null : prev));
          }
        }}
        onKeyDown={(e) => {
          if (userLength <= 3) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpandedCellKey(cellKey);
          }
          if (e.key === "Escape") {
            setExpandedCellKey((prev) => (prev === cellKey ? null : prev));
          }
        }}
      >
        <div className={styles.dayCellContent}>
          {visibleUsers.map((member) => (
            <div
              key={member.key}
              className={
                selectedSchedule.includes(member.scheduleId)
                  ? styles.userEmojiSelected
                  : styles.userEmoji
              }
              style={{
                backgroundColor: member.backgroundColor,
              }}
              onClick={() => {
                if (profile.id !== member.id) {
                  return;
                }
                setSelectedSchedule(member.scheduleId);
                // updateSelectedIds(member.id);
              }}
            >
              {member.initial}
            </div>
          ))}
        </div>
        {userLength > 3 && !isExpanded && (
          <span key="more" className={styles.extraUsers}>
            + {userLength - 3}명
          </span>
        )}
      </td>
    );
  };

  return (
    <>
      {!issueId ? (
        <div className={styles.calendarRoot}>
          <div className={`${styles.gridWrap} ${styles.emptyWrap}`}>
            <div className={styles.emptyState} role="status">
              <p className={styles.emptyTitle}>이슈를 선택해주세요</p>
              <p className={styles.emptyDescription}>
                우측 상단 이슈 선택에서 이슈를 고르면 팀 일정을 확인할 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.calendarRoot}>
          <div className={styles.gridWrap}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th
                    className={styles.timeCol}
                    style={{
                      border: "1px solid #ddd",
                      padding: "4px clamp(2px, 1vw, 8px)",
                      backgroundColor: "#f9fafb",
                      fontSize: "clamp(10px, 2vw, 12px)",
                    }}
                  >
                    시간
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toDateString()}
                      className={styles.dayHead}
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px clamp(2px, 1vw, 8px)",
                        backgroundColor: "#f9fafb",
                        textAlign: "center",
                        fontSize: "clamp(10px, 2vw, 12px)",
                      }}
                    >
                      {day.toLocaleDateString("ko-KR", {
                        weekday: "short",
                        month: "numeric",
                        day: "numeric",
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td
                      className={styles.timeCol}
                      style={{
                        border: "1px solid #eee",
                        padding: "4px clamp(2px, 1vw, 8px)",
                        fontSize: "clamp(10px, 2vw, 12px)",
                        backgroundColor: "#fafafa",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {hour.toString().padStart(2, "0")}:00
                    </td>
                    {weekDays.map((day) => {
                      const cellKey = `${day.toDateString()}-${hour}`;
                      return getUserData(cellKey);
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarComponent;

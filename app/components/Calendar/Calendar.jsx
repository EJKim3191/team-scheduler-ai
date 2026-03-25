// 캘린더 컴포넌트 --> react-calendar 라이브러리 사용, 결과값만 보여주는 컴포넌트
// TODO: decompose this component
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import { createClient } from "@/lib/supabase/server";
import { isTimeInRange } from "@/utils/timeStamp";
import { Suspense } from "react";
import "react-calendar/dist/Calendar.css";
import styles from "./Calendar.module.css";
import useCalander from "@/app/store/calander";
import useUser from "@/app/store/user";

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0 ~ 23시

// 유저 이름을 항상 동일한 색상에 매핑하기 위한 헬퍼
const USER_COLORS = [
  "#6366F1", // indigo
  "#EC4899", // pink
  "#F97316", // orange
  "#22C55E", // green
  "#06B6D4", // cyan
  "#A855F7", // purple
  "#F59E0B", // amber
  "#0EA5E9", // sky
];

const TIME_BACKGROUND_COLOR = ["", "	#F5DEB3", "#f6c1a3", "#C4E1A6"];

const getColorForUser = (name = "") => {
  if (!name) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const index = hash % USER_COLORS.length;
  return USER_COLORS[index];
};

const getBackgroundColor = (cellKey) => {
  return;
};
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (일) ~ 6 (토)
  const diff = (day === 0 ? -6 : 1) - day; // 월요일 시작 기준
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const CalendarComponent = () => {
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDate = useCalander((state) => state.selectedDate);
  const [expandedCellKey, setExpandedCellKey] = useState(null);
  const [hoveredCellKey, setHoveredCellKey] = useState(null);
  // const [userData, setUserData] = useState([]);
  const userData = useUser((state) => state.users);
  const setUserData = useUser((state) => state.setUsers);
  const selectedIds = useCalander((state) => state.selectedIds);
  const updateSelectedIds = useCalander((state) => state.updateSelectedIds);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch("/api/calendar");
      const data = await response.json();
      setUserData(data.response);
    };
    fetchUserData();
  }, []);

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

    userData.forEach((user) => {
      user.schedule.forEach((schedule) => {
        if (isTimeInRange(cellKey, schedule.start_time)) {
          const userName = user.user_name || "";
          const initial = (userName && userName[0]) || "?";
          const backgroundColor = getColorForUser(userName);
          matchedUsers.push({
            id: schedule.id,
            key: `${userName}-${schedule.start_time}-${cellKey}`,
            initial: initial.toUpperCase(),
            backgroundColor,
          });
        }
      });
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
                selectedIds.includes(member.id)
                  ? styles.userEmojiSelected
                  : styles.userEmoji
              }
              style={{
                backgroundColor: member.backgroundColor,
              }}
              onClick={() => updateSelectedIds(member.id)}
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
  );
};

export default CalendarComponent;

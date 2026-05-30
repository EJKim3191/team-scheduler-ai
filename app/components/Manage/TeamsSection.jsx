"use client";

import styles from "./TeamsSection.module.css";
import { getCookie } from "@/utils/cookie";
import { useState, useEffect } from "react";
import { IsoToTimeStamp } from "@/utils/timeStamp";

export default function TeamsSection() {
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const response = await fetch("/api/team/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: getCookie("sb-access-token"),
            refresh_token: getCookie("sb-refresh-token"),
            additionalInfo: true,
          }),
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.teams)) {
          setTeams(data.teams);
        }
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>팀 목록</h2>
          <div className={styles.cardMeta}>예시 UI</div>
        </div>
        <div className={styles.table}>
          <div className={styles.tableRowHeader}>
            <div>팀명</div>
            <div>멤버</div>
            <div>최근 수정일</div>
          </div>
          {teams.map((row) => (
            <div key={row.team_id} className={styles.tableRow}>
              <div className={styles.tableCellPrimary}>{row.team_name}</div>
              <div className={styles.tableCell}>{row.members}</div>
              <div className={styles.tableCell}>
                {row.last_updated && IsoToTimeStamp(row.last_updated, "ko-KR")}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>초대/권한 관리</h2>
        <p className={styles.cardDescription}>
          추후 팀 초대 코드 생성, 팀 역할(관리자/일반) 관리 기능을 연결하세요.
        </p>
      </div>
    </>
  );
}

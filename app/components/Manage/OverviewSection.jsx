"use client";
import styles from "./OverviewSection.module.css";
import { getCookie } from "@/utils/cookie";
import { useState, useEffect } from "react";
import { IsoToTimeStamp } from "@/utils/timeStamp";
import LoadingWheel from "@/app/components/LoadingWheel/LoadingWheel";

export default function OverviewSection() {
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [calculatedIssues, setCalculatedIssues] = useState({
    processed: "0%",
    open: 0,
    notParticipated: 0,
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoadingLogs(true);
      const response = await fetch("/api/user/logs", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
        }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
      setIsLoadingLogs(false);
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoadingIssues(true);
      const response = await fetch("/api/user/issue", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
        }),
      });
      const data = await response.json();
      if (!data.success) {
        return;
      }

      const openIssues = data.issues.filter((issue) => issue.status === "open");

      const responseParticipation = await fetch("/api/user/issue/participate", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
          issues: openIssues,
        }),
      });
      const dataParticipation = await responseParticipation.json();
      if (!dataParticipation.success) {
        return;
      }
      setCalculatedIssues({
        processed:
          data.issues.length > 0
            ? `${((data.issues.filter((issue) => issue.status === "closed").length / data.issues.length) * 100).toFixed(2)}%`
            : "0%",
        open: data.issues.filter((issue) => issue.status === "open").length,
        notParticipated: dataParticipation.userSchedules,
      });
      setIsLoadingIssues(false);
    };

    fetchIssues();
  }, []);

  if (isLoadingLogs || isLoadingIssues) {
    return <LoadingWheel centered label="로딩 중..." />;
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>스케줄 상태</h2>
          <div className={styles.cardMeta}>오늘 기준</div>
        </div>
        <div className={styles.statusRow}>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>처리된 스케줄</div>
            <div className={styles.statusValue}>
              {calculatedIssues.processed}
            </div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>오픈 이슈</div>
            <div className={styles.statusValue}>{calculatedIssues.open}</div>
          </div>
          <div className={styles.statusItem}>
            <div className={styles.statusLabel}>미참여 이슈</div>
            <div className={styles.statusValue}>
              {calculatedIssues.notParticipated}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>최근 활동</h2>
        <ul className={styles.activityList}>
          {logs.map((log) => (
            <li key={log.id} className={styles.activityItem}>
              <span className={styles.activityDescription}>
                {log.description}
              </span>
              <time className={styles.activityTime} dateTime={log.created_at}>
                {IsoToTimeStamp(log.created_at, "ko-KR")}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

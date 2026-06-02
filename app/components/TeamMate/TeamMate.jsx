// 팀원 컴포넌트 --> 팀원 목록을 보여주는 컴포넌트
"use client";

import React, { useState, useEffect } from "react";
import styles from "./TeamMate.module.css";
import { getCookie } from "@/utils/cookie";
import { useSearchParams } from "next/navigation";

const TeamMateComponent = ({ teamMembers }) => {
  const searchParams = useSearchParams();

  const [participatingUsers, setParticipatingUsers] = useState([]);
  const [nonParticipatingUsers, setNonParticipatingUsers] = useState([]);

  useEffect(() => {
    const fetchTeamSchedules = async () => {
      const response = await fetch("/api/calendar/user", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
          team_id: searchParams.get("teamId"),
        }),
      });

      const data = await response.json();

      if (searchParams.get("issueId")) {
        data.response = data.response.filter(
          (schedule) =>
            Number(schedule.issue_id) === Number(searchParams.get("issueId")),
        );
      }

      if (!data.response || data.response.length === 0) {
        setParticipatingUsers([]);
        setNonParticipatingUsers([]);
        return;
      }

      const profileMap = new Map();
      data.response.forEach((item) => {
        profileMap.set(item.profile_id, item.profiles.user_name);
      });

      const participatingUsers = Array.from(
        profileMap,
        ([profile_id, user_name]) => ({
          profile_id,
          user_name,
        }),
      );

      const nonParticipatingUsers = teamMembers
        .filter((member) => !profileMap.has(member.profile_id))
        .map((member) => ({
          profile_id: member.profile_id,
          user_name: member.profiles.user_name,
        }));

      setParticipatingUsers(participatingUsers);
      setNonParticipatingUsers(nonParticipatingUsers);
    };
    fetchTeamSchedules();
  }, [teamMembers]);

  return (
    <section className={styles.teamMateContainer} aria-label="참여 현황">
      <header className={styles.header}>
        <h2 className={styles.title}>참여 현황</h2>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            참여{" "}
            <span className={styles.count}>{participatingUsers.length}</span>
          </span>
          <span className={styles.metaDivider} aria-hidden="true">
            ·
          </span>
          <span className={styles.metaItem}>
            미참여{" "}
            <span className={styles.count}>{nonParticipatingUsers.length}</span>
          </span>
        </div>
      </header>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={`${styles.badge} ${styles.badgeParticipating}`}>
            참여자
          </span>
        </div>
        {participatingUsers.length === 0 ? (
          <p className={styles.empty}>참여자가 없습니다.</p>
        ) : (
          <div className={styles.chipList}>
            {participatingUsers.map((user) => (
              <span key={user.profile_id} className={styles.chip}>
                {user.user_name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={`${styles.badge} ${styles.badgeNonParticipating}`}>
            미참여자
          </span>
        </div>
        {nonParticipatingUsers.length === 0 ? (
          <p className={styles.empty}>미참여자가 없습니다.</p>
        ) : (
          <div className={styles.chipList}>
            {nonParticipatingUsers.map((user) => (
              <span key={user.profile_id} className={styles.chip}>
                {user.user_name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamMateComponent;

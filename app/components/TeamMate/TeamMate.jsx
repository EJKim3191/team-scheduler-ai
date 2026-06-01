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
    <div className={styles.teamMateContainer}>
      <div>
        참여자: {participatingUsers.map((user) => user.user_name).join(", ")}
      </div>
      <div>
        미참여자:{" "}
        {nonParticipatingUsers.map((user) => user.user_name).join(", ")}
      </div>
    </div>
  );
};

export default TeamMateComponent;

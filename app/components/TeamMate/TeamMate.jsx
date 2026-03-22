// 팀원 컴포넌트 --> 팀원 목록을 보여주는 컴포넌트
"use client";

import React, { useState, useEffect } from "react";
import styles from "./TeamMate.module.css";
import useUser from "@/app/store/user";

const TeamMateComponent = () => {
  const userData = useUser((state) => state.users);
  const [participatingUsers, setParticipatingUsers] = useState([]);
  const [nonParticipatingUsers, setNonParticipatingUsers] = useState([]);

  useEffect(() => {
    setParticipatingUsers(userData.filter((user) => user.schedule.length > 0));
    setNonParticipatingUsers(
      userData.filter((user) => user.schedule.length == 0),
    );
  }, [userData]);

  return (
    <div className={styles.teamMateContainer}>
      <div>
        참여자 목록:{" "}
        {participatingUsers.map((user) => user.user_name).join(", ")}
      </div>
      <div>
        미참여자 목록:{" "}
        {nonParticipatingUsers.map((user) => user.user_name).join(", ")}
      </div>
    </div>
  );
};

export default TeamMateComponent;

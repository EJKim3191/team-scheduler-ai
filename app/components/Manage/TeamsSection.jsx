"use client";

import styles from "./TeamsSection.module.css";
import { getCookie } from "@/utils/cookie";
import { useState, useEffect, useCallback } from "react";
import { IsoToTimeStamp } from "@/utils/timeStamp";
import LoadingWheel from "@/app/components/LoadingWheel/LoadingWheel";
import { generateSmartCode, validateCodeFormat } from "@/utils/teamCode";

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 4v6h-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TeamsSection({ teamInfo }) {
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [createTeamCode, setCreateTeamCode] = useState("");
  const [isTeamCodeGenerated, setIsTeamCodeGenerated] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [inviteTeamCode, setInviteTeamCode] = useState("");
  const [isJoinSubmitDisabled, setIsJoinSubmitDisabled] = useState(true);
  const [isSendingJoinRequest, setIsSendingJoinRequest] = useState(false);

  useEffect(() => {
    setTeams(teamInfo);
    setIsLoadingTeams(false);
  }, [teamInfo]);

  useEffect(() => {
    const isValid =
      teamName.trim().length > 0 && validateCodeFormat(createTeamCode);
    setIsSubmitDisabled(!isValid);
  }, [teamName, createTeamCode]);

  useEffect(() => {
    setIsJoinSubmitDisabled(inviteTeamCode.trim().length === 0);
  }, [inviteTeamCode]);

  const onTeamNameChange = (event) => {
    if (event.target.value.length > 10) return;
    setTeamName(event.target.value);
  };

  const onTeamCodeGenerate = () => {
    setCreateTeamCode(generateSmartCode());
    setIsTeamCodeGenerated(true);
  };

  const onTeamCodeRefresh = () => {
    setCreateTeamCode(generateSmartCode());
  };

  const onSubmitCreateTeam = async () => {
    if (isSubmitDisabled || isCreatingTeam) return;

    setIsCreatingTeam(true);
    try {
      const response = await fetch("/api/team", {
        method: "POST",
        body: JSON.stringify({
          teamName: teamName.trim(),
          teamCode: createTeamCode,
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
        }),
      });
      const data = await response.json();

      if (data.success) {
        setTeamName("");
        setCreateTeamCode("");
        setIsTeamCodeGenerated(false);
        await fetchTeams();
        alert(data.message ?? "팀이 생성되었습니다.");
      } else {
        alert(data.message ?? "팀 생성에 실패했습니다.");
      }
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const onInviteTeamCodeChange = (event) => {
    setInviteTeamCode(event.target.value);
  };

  const onInviteTeamCodeKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmitJoinRequest();
    }
  };

  const onSubmitJoinRequest = async () => {
    if (isJoinSubmitDisabled || isSendingJoinRequest) return;

    setIsSendingJoinRequest(true);
    try {
      const response = await fetch("/api/team/invitation/join-request", {
        method: "POST",
        body: JSON.stringify({
          teamCode: inviteTeamCode.trim(),
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
        }),
      });
      const data = await response.json();

      if (data.success) {
        setInviteTeamCode("");
        alert(data.message ?? "팀 가입 요청이 전송되었습니다.");
      } else {
        alert(data.message ?? "팀 가입 요청에 실패했습니다.");
      }
    } finally {
      setIsSendingJoinRequest(false);
    }
  };

  if (isLoadingTeams) {
    return <LoadingWheel centered label="로딩 중..." />;
  }

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
        <h2 className={styles.cardTitle}>팀 생성</h2>
        <div className={styles.createForm}>
          <input
            className={styles.input}
            type="text"
            name="teamName"
            placeholder="팀 이름"
            value={teamName}
            onChange={onTeamNameChange}
            autoComplete="organization"
            aria-label="팀 이름"
          />

          <div className={styles.teamCodeSlot}>
            {isTeamCodeGenerated ? (
              <div className={styles.teamCodeGeneratedRow}>
                <span className={styles.teamCodeDisplay}>{createTeamCode}</span>
                <button
                  type="button"
                  className={styles.teamCodeRefreshButton}
                  onClick={onTeamCodeRefresh}
                  aria-label="팀 코드 다시 생성"
                >
                  <RefreshIcon />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.generateButton}
                onClick={onTeamCodeGenerate}
              >
                팀 코드 생성
              </button>
            )}
          </div>

          <button
            type="button"
            className={styles.submitButton}
            onClick={onSubmitCreateTeam}
            disabled={isSubmitDisabled || isCreatingTeam}
          >
            {isCreatingTeam ? "생성 중..." : "팀 생성"}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>팀 초대 요청</h2>
        <div className={styles.createForm}>
          <input
            className={`${styles.input} ${styles.inputTeamCode}`}
            type="text"
            name="inviteTeamCode"
            placeholder="팀 코드"
            value={inviteTeamCode}
            onChange={onInviteTeamCodeChange}
            onKeyDown={onInviteTeamCodeKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-label="팀 코드"
          />

          <button
            type="button"
            className={styles.submitButton}
            onClick={onSubmitJoinRequest}
            disabled={isJoinSubmitDisabled || isSendingJoinRequest}
          >
            {isSendingJoinRequest ? "요청 중..." : "초대 요청"}
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import styles from "./UsersSection.module.css";
import { getCookie } from "@/utils/cookie";
import { useState, useEffect } from "react";
import TeamSelector from "../TeamSelector/TeamSelector";

export default function UsersSection() {
  const [myProfile, setMyProfile] = useState({});
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [myRole, setMyRole] = useState("");
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isMemberChanged, setIsMemberChanged] = useState(false);

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
          }),
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.teams)) {
          setTeams(data.teams);
          setSelectedTeamId(data.teams[0]?.team_id ?? "");
        }
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchMyProfile = async () => {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
        }),
      });
      const data = await response.json();
      if (data.success && data.profile) {
        setMyProfile(data.profile);
      }
    };
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchMembers = async () => {
      const response = await fetch("/api/team/members", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
          teamId: selectedTeamId,
        }),
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.members)) {
        setMembers(data.members);
      }
      if (data.success && data.myRole) {
        setMyRole(data.myRole);
      }
    };
    fetchMembers();
  }, [selectedTeamId, isMemberChanged]);

  const selectedTeam = teams.find(
    (team) => team.team_id === Number(selectedTeamId),
  );

  useEffect(() => {
    if (!pendingDelete) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setPendingDelete(null);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [pendingDelete]);

  const handleDelete = async (profile, teamId) => {
    const response = await fetch("/api/team/members", {
      method: "DELETE",
      body: JSON.stringify({
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
        profile: profile,
        teamId: teamId,
      }),
    });
    const data = await response.json();
    if (data.success) {
      setIsMemberChanged(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await handleDelete(pendingDelete, selectedTeamId);
    setPendingDelete(null);
    setIsMemberChanged(true);
  };

  return (
    <>
      <div className={styles.teamSelectorWrap}>
        {isLoadingTeams ? (
          <p className={styles.cardDescription}>팀 목록을 불러오는 중…</p>
        ) : teams.length === 0 ? (
          <p className={styles.cardDescription}>참여 중인 팀이 없습니다.</p>
        ) : (
          <div className={styles.teamSelectorRow}>
            <TeamSelector
              teams={teams}
              selectedTeamId={selectedTeamId}
              onTeamSelect={setSelectedTeamId}
              label="관리할 팀"
            />
            {selectedTeam && (
              <p className={styles.selectedTeamMeta}>
                팀 코드{" "}
                <span className={styles.teamCode}>
                  {selectedTeam.team_code}
                </span>
              </p>
            )}
          </div>
        )}
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>사용자 권한</h2>
          <div className={styles.cardMeta}>
            {myRole ? `내 권한: ${myRole}` : ""}
          </div>
        </div>
        <div className={styles.table}>
          <div className={styles.tableRowHeader}>
            <div>이름</div>
            <div>이메일</div>
            <div>권한</div>
          </div>
          {members.map((row) => (
            <div
              key={row.profiles.user_id}
              className={
                myProfile.email === row.profiles.user_id
                  ? styles.tableRowPrimary
                  : styles.tableRow
              }
            >
              <div className={styles.tableCellPrimary}>
                {row.profiles.user_name}
              </div>
              <div className={styles.tableCell}>{row.profiles.user_id}</div>
              <div className={`${styles.tableCell} ${styles.roleCell}`}>
                <span
                  className={`${styles.badge} ${
                    row.role === "관리자" ? styles.badgeAccent : ""
                  }`}
                >
                  {row.role}
                </span>
                {myRole === "owner" &&
                  myProfile.email !== row.profiles.user_id && (
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() =>
                        setPendingDelete(row.profiles, selectedTeamId)
                      }
                    >
                      삭제
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>감사 로그</h2>
        <p className={styles.cardDescription}>
          사용자 권한 변경/팀 접근 내역을 기록하고 확인할 수 있게 확장해 주세요.
        </p>
      </div>

      {pendingDelete && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <button
            type="button"
            className={styles.modalBackdrop}
            aria-label="삭제 취소"
            onClick={() => setPendingDelete(null)}
          />
          <div className={styles.modalPanel}>
            <h3 id="delete-modal-title" className={styles.modalTitle}>
              팀원 삭제
            </h3>
            <p className={styles.modalDescription}>
              <strong>{pendingDelete.user_name}</strong>({pendingDelete.user_id}
              )님을 팀에서 제거할까요?
              <br />
              해당 사용자의 팀의 스케줄도 함께 삭제되며,
              <br />
              해당 작업은 되돌릴 수 없습니다.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={() => setPendingDelete(null)}
              >
                취소
              </button>
              <button
                type="button"
                className={styles.modalConfirmButton}
                onClick={handleConfirmDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import styles from "./UsersSection.module.css";
import { getCookie } from "@/utils/cookie";
import { useState, useEffect } from "react";
import TeamSelector from "../TeamSelector/TeamSelector";
import LoadingWheel from "@/app/components/LoadingWheel/LoadingWheel";
import { IsoToTimeStamp } from "@/utils/timeStamp";

function ApproveIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 7L9 18L4 13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function UsersSection() {
  const [myProfile, setMyProfile] = useState({});
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [myRole, setMyRole] = useState("");
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isMemberChanged, setIsMemberChanged] = useState(false);
  const [invitationsSent, setInvitationsSent] = useState([]);
  const [invitationsReceived, setInvitationsReceived] = useState([]);

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
      setIsLoadingProfile(true);
      try {
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
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (!selectedTeamId) return;
    setIsMemberChanged(false);
    const fetchMembers = async () => {
      // setIsLoadingMembers(true);
      try {
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
      } finally {
        // setIsLoadingMembers(false);
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
      setIsMemberChanged(true);
    }
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      const response = await fetch("/api/team/invitation", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
          teamId: selectedTeamId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setInvitationsSent(data.invitationsSent);
        setInvitationsReceived(data.invitationsReceived);
      }
    };
    fetchInvitations();
  }, [selectedTeamId, isMemberChanged]);

  const handleApprove = async (invitation, action) => {
    const response = await fetch("/api/team/invitation/approve", {
      method: "POST",
      body: JSON.stringify({
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
        invitation: invitation,
        action: action,
      }),
    });
    const data = await response.json();
    if (data.success) {
      setIsMemberChanged(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    await handleDelete(pendingDelete, selectedTeamId);
    setPendingDelete(null);
    setIsMemberChanged(true);
  };

  if (isLoadingTeams || isLoadingProfile || isLoadingMembers) {
    return <LoadingWheel centered label="로딩 중..." />;
  }

  return (
    <>
      <div className={styles.teamSelectorWrap}>
        {teams.length === 0 ? (
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
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>들어온 요청</h2>
        </div>
        <div className={styles.invitationTable}>
          <div className={styles.invitationTableHeader}>
            <div className={styles.invitationHeaderCell}>이름</div>
            <div className={styles.invitationHeaderCell}>이메일</div>
            <div className={styles.invitationHeaderCell}>요청 일시</div>
            <div
              className={`${styles.invitationHeaderCell} ${styles.invitationActionHeader}`}
              aria-hidden="true"
            />
          </div>
          {invitationsReceived.map((row) =>
            row.profile && row.status === "pending" ? (
              <div key={row.id} className={styles.invitationTableRow}>
                <div className={styles.invitationTableCell}>
                  {row.profile.user_name}
                </div>
                <div className={styles.invitationTableCell}>
                  {row.profile.user_id}
                </div>
                <div className={styles.invitationTableCell}>
                  {IsoToTimeStamp(row.created_at, "ko-KR")}
                </div>
                <div
                  className={`${styles.invitationTableCell} ${styles.invitationActionCell}`}
                >
                  <button
                    type="button"
                    className={`${styles.invitationIconButton} ${styles.invitationIconButtonApprove}`}
                    aria-label="승인"
                    onClick={() => handleApprove(row, "approve")}
                  >
                    <ApproveIcon />
                  </button>
                  <button
                    type="button"
                    className={`${styles.invitationIconButton} ${styles.invitationIconButtonCancel}`}
                    aria-label="취소"
                    onClick={() => handleApprove(row, "cancel")}
                  >
                    <CancelIcon />
                  </button>
                </div>
              </div>
            ) : null,
          )}
        </div>
      </div>

      {/* TODO: 보낸 요청 추가 // 현재 이메일으로 요청을 전송 시 프리티어에 알맞지 않는 요청 수가 많아짐 */}
      {/* <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>보낸 요청</h2>
        </div>
        <div className={styles.table}>
          <div className={styles.tableRowHeader}>
            <div>이메일</div>
            <div>요청 일시</div>
            <div>상태</div>
          </div>
          {invitationsSent.map((row) => (
            <div key={row.id} className={styles.tableRow}>
              <div className={styles.tableCell}>{row.email}</div>
              <div className={styles.tableCell}>
                {IsoToTimeStamp(row.created_at)}
              </div>
              <div className={styles.tableCell}>{row.status}</div>
            </div>
          ))}
        </div>
      </div> */}

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

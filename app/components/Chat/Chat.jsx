// 채팅 컴포넌트 --> 채팅 입력을 받을 수 있는 컴포넌트
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Chat.module.css";
import useCalander from "@/app/store/calander";
import useUser from "@/app/store/user";
import { useSearchParams, useRouter } from "next/navigation";
import ChatScenarioModal from "./ChatScenarioModal";
import ChatDeleteConfirmModal from "./ChatDeleteConfirmModal";
import LoadingWheel from "../LoadingWheel/LoadingWheel";

function getCookie(name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? unescape(value[2]) : null;
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 11v6M12 7h.01"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const ChatComponent = ({ profile, team, issues }) => {
  const router = useRouter();
  const params = useSearchParams();

  const [message, setMessage] = useState("");
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isSubmittingScenario, setIsSubmittingScenario] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [tipPosition, setTipPosition] = useState(null);
  const tipWrapRef = useRef(null);
  const selectedSchedule = useCalander((state) => state.selectedSchedule);
  const clearSelectedSchedule = useCalander(
    (state) => state.clearSelectedSchedule,
  );
  const setUserData = useUser((state) => state.setUsers);

  const selectedIssue = issues.find(
    (issue) => issue.id === Number(params.get("issueId")),
  );

  const selectedTeamId = params.get("teamId");

  const fetchUserData = async () => {
    const response = await fetch("/api/calendar/user", {
      method: "POST",
      // body: JSON.stringify({ token: localStorage.getItem("user_id") }),
      body: JSON.stringify({
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
      }),
    });
    const data = await response.json();
    setUserData(data.response);
  };

  const buildPostData = (scenario) =>
    scenario.data.map((item) => ({
      team_id: Number(selectedTeamId),
      profile_id: profile.id,
      issue_id: selectedIssue.id,
      start_time: item.start_time + "00+09",
    }));

  const submitSchedule = async (scenario) => {
    const postData = buildPostData(scenario);

    const calendarResponse = await fetch("/api/calendar", {
      method: "POST",
      body: JSON.stringify({
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
        data: postData,
      }),
    });
    const calendarData = await calendarResponse.json();

    if (!calendarData.error) {
      setMessage("");
      router.refresh();
      fetchUserData();
      return true;
    }
    alert("일정 추가 실패");
    return false;
  };

  const handleSend = async () => {
    if (message.trim() === "") {
      alert("메시지를 입력해주세요");
      return;
    }

    if (!params.get("issueId") || !selectedIssue) {
      alert("이슈를 선택해주세요");
      return;
    }

    if (selectedIssue.status === "closed") {
      alert("이슈가 완료되었습니다. 완료된 이슈는 채팅할 수 없습니다.");
      return;
    }

    // 휠 시작점
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ userName: profile.user_name, message: message }),
      });
      const res = await response.json();

      if (!res.success) {
        alert("채팅 실패");
        return;
      }

      if (!res.data.scenarios || res.data.scenarios.length === 0) {
        alert("일정 추가 실패");
        return;
      }

      if (res.data.scenarios.length > 1) {
        setScenarios(res.data.scenarios);
        setSelectedScenarioIndex(0);
        setIsScenarioModalOpen(true);
        return;
      }

      await submitSchedule(res.data.scenarios[0]);
    } finally {
      // 휠 끝점
      setIsSending(false);
    }
  };

  const handleScenarioConfirm = async () => {
    const scenario = scenarios[selectedScenarioIndex];
    if (!scenario) return;

    setIsSubmittingScenario(true);
    try {
      const success = await submitSchedule(scenario);
      if (success) {
        setIsScenarioModalOpen(false);
        setScenarios([]);
      }
    } finally {
      setIsSubmittingScenario(false);
    }
  };

  const handleScenarioClose = () => {
    if (isSubmittingScenario) return;
    setIsScenarioModalOpen(false);
    setScenarios([]);
  };

  const handleDeleteClick = () => {
    if (selectedSchedule.length === 0) return;
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
  };

  const updateTipPosition = useCallback(() => {
    const el = tipWrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTipPosition({
      left: rect.left,
      top: rect.top - 8,
      width: Math.min(280, window.innerWidth - rect.left - 16),
    });
  }, []);

  useEffect(() => {
    if (!isTipOpen) return;

    updateTipPosition();
    const onReposition = () => updateTipPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [isTipOpen, updateTipPosition]);

  const handleTipEnter = () => {
    setIsTipOpen(true);
    updateTipPosition();
  };

  const handleTipLeave = () => {
    setIsTipOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/calendar", {
        method: "DELETE",
        body: JSON.stringify({
          selectedSchedule: selectedSchedule,
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
        }),
      });

      if (response.ok) {
        alert("삭제되었습니다");
        clearSelectedSchedule();
        setIsDeleteModalOpen(false);
        router.refresh();
        fetchUserData();
      } else {
        alert("삭제 실패");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div
        className={`${styles.tipWrap} ${isTipOpen ? styles.tipWrapActive : ""}`}
        ref={tipWrapRef}
        onMouseEnter={handleTipEnter}
        onMouseLeave={handleTipLeave}
        onFocus={handleTipEnter}
        onBlur={handleTipLeave}
      >
        <button
          type="button"
          className={styles.tipTrigger}
          aria-describedby={isTipOpen ? "chat-tip-content" : undefined}
        >
          <span className={styles.tipLabel}>Tip!</span>
          <span className={styles.tipIcon} aria-hidden="true">
            <InfoIcon />
          </span>
        </button>
      </div>

      {isTipOpen &&
        tipPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="chat-tip-content"
            className={styles.tipPopover}
            role="tooltip"
            style={{
              position: "fixed",
              left: tipPosition.left,
              top: tipPosition.top,
              width: tipPosition.width,
              transform: "translateY(-100%)",
              zIndex: 1100,
            }}
            onMouseEnter={handleTipEnter}
            onMouseLeave={handleTipLeave}
          >
            <p className={styles.tipText}>
              채팅 내용은 AI에게 일정을 조율할 수 있게 정보를 제공합니다.
            </p>
            <p className={styles.tipText}>AI에게 필요한 정보를 입력해주세요!</p>
            <p className={styles.tipExample}>
              ex: 금요일 저녁 9시부터 11시까지 가능해!!
            </p>
          </div>,
          document.body,
        )}

      <div className={styles.chatBody}>
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          className={styles.chatInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          className={`${styles.sendButton} ${isSending ? styles.sendButtonLoading : ""}`}
          onClick={handleSend}
          disabled={isSending}
          aria-busy={isSending}
        >
          {isSending ? (
            <LoadingWheel
              size="sm"
              light
              className={styles.sendButtonSpinner}
              label=""
            />
          ) : (
            "전송"
          )}
        </button>
        <button
          disabled={selectedSchedule.length === 0}
          className={
            selectedSchedule.length === 0
              ? styles.sendButtonDisabled
              : styles.deleteButton
          }
          onClick={handleDeleteClick}
        >
          삭제
        </button>
      </div>
      <ChatDeleteConfirmModal
        open={isDeleteModalOpen}
        count={selectedSchedule.length}
        onConfirm={handleDeleteConfirm}
        onClose={handleDeleteClose}
        loading={isDeleting}
      />
      <ChatScenarioModal
        open={isScenarioModalOpen}
        scenarios={scenarios}
        selectedIndex={selectedScenarioIndex}
        onSelect={setSelectedScenarioIndex}
        onConfirm={handleScenarioConfirm}
        onClose={handleScenarioClose}
        loading={isSubmittingScenario}
      />
    </div>
  );
};

export default ChatComponent;

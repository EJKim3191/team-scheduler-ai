// 채팅 컴포넌트 --> 채팅 입력을 받을 수 있는 컴포넌트
"use client";

import React, { useState } from "react";
import styles from "./Chat.module.css";
import useCalander from "@/app/store/calander";
import useUser from "@/app/store/user";
import { useSearchParams } from "next/navigation";

function getCookie(name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? unescape(value[2]) : null;
}

const ChatComponent = ({ profile, team, issues }) => {
  const params = useSearchParams();

  const [message, setMessage] = useState("");
  const selectedIds = useCalander((state) => state.selectedIds);
  const setUserData = useUser((state) => state.setUsers);
  const clearSelectedIds = useCalander((state) => state.clearSelectedIds);

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

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ userName: profile.user_name, message: message }),
    });
    let res = await response.json();

    if (res.success) {
      const postData = [];

      res.data.data.forEach((item) => {
        postData.push({
          team_id: Number(selectedTeamId),
          profile_id: profile.id,
          issue_id: selectedIssue.id,
          start_time: item.start_time + "00+09",
        });
      });
      await fetch("/api/calendar", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
          data: postData,
        }),
      });
      fetchUserData();
    } else {
      alert("채팅 실패");
    }
  };

  const handleDelete = async () => {
    const response = await fetch("/api/calendar", {
      method: "DELETE",
      body: JSON.stringify({
        selectedIds,
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
      }),
    });

    if (response.ok) {
      alert("삭제되었습니다");
      clearSelectedIds();
    } else {
      alert("삭제 실패");
    }
    fetchUserData();
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        채팅 내용은 AI에게 일정을 조율할 수 있게 정보를 제공합니다. <br />
        AI에게 필요한 정보를 입력해주세요! <br />
        Ex: 월요일 금요일을 제외한 모든 날의 저녁 10시부터 12시까지 가능해!
      </div>
      <input
        type="text"
        placeholder="메시지를 입력하세요"
        className={styles.chatInput}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className={styles.sendButton} onClick={handleSend}>
        전송
      </button>
      <button
        disabled={selectedIds.length === 0}
        className={
          selectedIds.length === 0
            ? styles.sendButtonDisabled
            : styles.deleteButton
        }
        onClick={handleDelete}
      >
        삭제
      </button>
    </div>
  );
};

export default ChatComponent;

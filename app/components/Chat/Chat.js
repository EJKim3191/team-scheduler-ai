// 채팅 컴포넌트 --> 채팅 입력을 받을 수 있는 컴포넌트
"use client";

import React, { useState } from "react";
import styles from "./Chat.module.css";
import useCalander from "@/app/store/calander";
import useUser from "@/app/store/user";

function getCookie(name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? unescape(value[2]) : null;
}

const ChatComponent = ({ name, id }) => {
  const [message, setMessage] = useState("");
  const selectedIds = useCalander((state) => state.selectedIds);
  const setUserData = useUser((state) => state.setUsers);
  const clearSelectedIds = useCalander((state) => state.clearSelectedIds);
  const userId = id ?? useUser((state) => state.userId);

  const fetchUserData = async () => {
    const response = await fetch("/api/calendar/user", {
      method: "POST",
      // body: JSON.stringify({ token: localStorage.getItem("user_id") }),
      body: JSON.stringify({ token: getCookie("sb-access-token") }),
    });
    const data = await response.json();
    setUserData(data.response);
  };

  const handleSend = async () => {
    if (message.trim() === "") {
      alert("메시지를 입력해주세요");
      return;
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ userName: name, message: message }),
    });
    let res = await response.json();

    if (res.success) {
      const postData = [];

      res.data.data.forEach((item) => {
        postData.push({
          profile_id: userId,
          start_time: item.start_time + "00+09",
        });
      });

      await fetch("/api/calendar", {
        method: "POST",
        body: JSON.stringify(postData),
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

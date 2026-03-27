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

const ChatComponent = () => {
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const selectedIds = useCalander((state) => state.selectedIds);
  const setUserData = useUser((state) => state.setUsers);
  const clearSelectedIds = useCalander((state) => state.clearSelectedIds);

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
    if (userName.trim() === "") {
      alert("이름을 입력해주세요");
      return;
    }
    if (message.trim() === "") {
      alert("메시지를 입력해주세요");
      return;
    }
    if (password.trim() === "") {
      alert("비밀번호를 입력해주세요");
      return;
    }

    // check & get profile_id by username and password
    const profileId = await fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ userName, password }),
    });
    let profile_id = await profileId.json();

    if (profile_id === null || profile_id === undefined) {
      alert("이름 또는 비밀번호가 일치하지 않습니다");
      return;
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ userName, password, message }),
    });
    let res = await response.json();

    if (res.success) {
      const postData = [];

      res.data.data.forEach((item) => {
        postData.push({
          profile_id,
          start_time: item.start_time + "00+09",
        });
      });

      const response = await fetch("/api/calendar", {
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
      <div className={styles.userContainer}>
        <input
          type="text"
          placeholder="이름"
          className={styles.userNameInput}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className={styles.passwordInput}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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

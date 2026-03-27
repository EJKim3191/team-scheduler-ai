"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import useTeam from "@/app/store/team";

function Profile({ name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTeamCodeCopied, setIsTeamCodeCopied] = useState(false);
  const teamCode = useTeam((state) => state.teamCode);
  const teamName = useTeam((state) => state.teamName);

  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isTeamCodeCopied) return;
    const timeoutId = setTimeout(() => setIsTeamCodeCopied(false), 1500);
    return () => clearTimeout(timeoutId);
  }, [isTeamCodeCopied]);

  const handleLogout = () => {
    document.cookie = "sb-access-token=; path=/; max-age=0;";
    router.push("/login");
    router.refresh();
  };

  const handleCopyTeamCode = async (event) => {
    event.stopPropagation();
    // if (!teamCode) return;

    try {
      await navigator.clipboard.writeText(teamCode);
      setIsTeamCodeCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = teamCode;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setIsTeamCodeCopied(true);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={`${styles.card} ${isOpen ? styles.cardOpen : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.nameRow}>
          <strong className={styles.name}>{name}</strong>
          <span className={styles.teamCode}>{teamName}</span>
        </span>
      </button>

      <div
        className={`${styles.menu} ${isOpen ? styles.menuOpen : ""}`}
        role="dialog"
        aria-label="프로필 메뉴"
        aria-hidden={!isOpen}
      >
        <div className={styles.copyLayout} onClick={handleCopyTeamCode}>
          <p className={styles.menuName}>팀 코드 복사</p>
          <svg
            className={`${styles.copyCheck} ${
              isTeamCodeCopied ? styles.copyCheckActive : ""
            }`}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M20 7L9 18L4 13"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          type="button"
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Profile;

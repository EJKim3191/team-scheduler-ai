// 팀원 컴포넌트 --> 팀원 목록을 보여주는 컴포넌트
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./TeamMate.module.css";
import { getCookie } from "@/utils/cookie";
import { useSearchParams } from "next/navigation";
import { getColorForUser } from "@/utils/userColor";

const TeamMateComponent = ({ teamMembers }) => {
  const searchParams = useSearchParams();
  const issueId = searchParams.get("issueId");
  const teamId = searchParams.get("teamId");

  const [participatingUsers, setParticipatingUsers] = useState([]);
  const [nonParticipatingUsers, setNonParticipatingUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [overlayStyle, setOverlayStyle] = useState(null);

  useEffect(() => {
    if (!issueId || !teamId) {
      setParticipatingUsers([]);
      setNonParticipatingUsers([]);
    }
  }, [issueId, teamId]);

  useEffect(() => {
    if (!issueId || !teamId) return;
    const fetchTeamSchedules = async () => {
      const response = await fetch("/api/calendar/user", {
        method: "POST",
        body: JSON.stringify({
          access_token: getCookie("sb-access-token"),
          refresh_token: getCookie("sb-refresh-token"),
          team_id: teamId,
        }),
      });

      const data = await response.json();

      if (!data.response) {
        setParticipatingUsers([]);
        setNonParticipatingUsers([]);
        return;
      }

      data.response = data.response.filter(
        (schedule) => Number(schedule.issue_id) === Number(issueId),
      );

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
  }, [teamMembers, issueId, teamId]);

  const updateOverlayPosition = () => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setOverlayStyle({
      position: "fixed",
      top: rect.bottom + 2,
      left: rect.left,
      width: rect.width,
      zIndex: 1000,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateOverlayPosition();

    const onResize = () => updateOverlayPosition();
    const onScroll = () => updateOverlayPosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const container = containerRef.current;
      const overlay = overlayRef.current;
      if (!container || !overlay) return;
      const target = event.target;
      if (container.contains(target) || overlay.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const chevron = isOpen ? "▴" : "▾";

  const participatingChips = useMemo(
    () =>
      participatingUsers.map((user) => (
        <span
          key={user.profile_id}
          className={styles.chip}
          style={{
            backgroundColor: getColorForUser({
              profileId: user.profile_id,
              userName: user.user_name,
            }),
            color: "#ffffff",
          }}
        >
          {user.user_name}
        </span>
      )),
    [participatingUsers],
  );

  const nonParticipatingChips = useMemo(
    () =>
      nonParticipatingUsers.map((user) => (
        <span
          key={user.profile_id}
          className={styles.chip}
          style={{
            backgroundColor: getColorForUser({
              profileId: user.profile_id,
              userName: user.user_name,
            }),
            color: "#ffffff",
          }}
        >
          {user.user_name}
        </span>
      )),
    [nonParticipatingUsers],
  );

  return (
    <section
      className={styles.teamMateContainer}
      aria-label="참여 현황"
      onClick={handleToggle}
      ref={containerRef}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleToggle();
        }
      }}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>참여 현황</h2>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            참여{" "}
            <span className={styles.count}>{participatingUsers.length}</span>
          </span>
          <span className={styles.metaDivider} aria-hidden="true">
            ·
          </span>
          <span className={styles.metaItem}>
            미참여{" "}
            <span className={styles.count}>{nonParticipatingUsers.length}</span>
          </span>
        </div>
        <span className={styles.chevron} aria-hidden="true">
          {chevron}
        </span>
      </header>

      {isOpen &&
        overlayStyle &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={overlayRef}
            className={styles.overlay}
            style={overlayStyle}
            onClick={handleToggle}
          >
            <div className={styles.overlayPanel}>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span
                    className={`${styles.badge} ${styles.badgeParticipating}`}
                  >
                    참여자
                  </span>
                </div>
                {participatingUsers.length === 0 ? (
                  <p className={styles.empty}>참여자가 없습니다.</p>
                ) : (
                  <div className={styles.chipList}>{participatingChips}</div>
                )}
              </div>

              <div className={styles.divider} aria-hidden="true" />

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span
                    className={`${styles.badge} ${styles.badgeNonParticipating}`}
                  >
                    미참여자
                  </span>
                </div>
                {nonParticipatingUsers.length === 0 ? (
                  <p className={styles.empty}>미참여자가 없습니다.</p>
                ) : (
                  <div className={styles.chipList}>{nonParticipatingChips}</div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
};

export default TeamMateComponent;

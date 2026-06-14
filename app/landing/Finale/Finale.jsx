"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import BrandMark from "../BrandMark/BrandMark";
import styles from "./Finale.module.css";

const CLOUD_DELAYS_MS = [1500, 2100, 2700, 3300, 3900];

function ScheduleMockup() {
  return (
    <div className={`${styles.mockup} ${styles.scheduleMockup}`}>
      <p className={styles.mockupLabel}>일정</p>
      <div className={styles.scheduleHeader}>
        <span className={styles.scheduleTitle}>팀 주간 일정</span>
        <span className={styles.scheduleDate}>6월 2주</span>
      </div>
      <div className={styles.scheduleGrid}>
        {Array.from({ length: 14 }, (_, index) => (
          <div
            key={index}
            className={`${styles.scheduleDay} ${
              index === 3 || index === 8 || index === 11
                ? styles.scheduleDayActive
                : index > 10
                  ? styles.scheduleDayMuted
                  : ""
            }`}
          />
        ))}
      </div>
      <div className={styles.scheduleBars}>
        <div className={`${styles.scheduleBar} ${styles.scheduleBarWide}`} />
        <div className={`${styles.scheduleBar} ${styles.scheduleBarMid}`} />
        <div className={`${styles.scheduleBar} ${styles.scheduleBarShort}`} />
      </div>
    </div>
  );
}

function ChatMockup() {
  return (
    <div className={`${styles.mockup} ${styles.chatMockup}`}>
      <p className={styles.mockupLabel}>채팅</p>
      <div className={styles.chatHeader}>AI 팀 싱크</div>
      <div className={styles.chatBody}>
        <div className={styles.chatBubbleUser}>필요한 일정을 알려줘.</div>
        <div className={styles.chatBubbleAi}>
          이번 주 '15학번 동창 모임' 팀에서 '정기모임'이 열렸어요.
        </div>
        <div className={styles.chatBubbleUser}>
          난 토요일 6시 이후로 가능할 것 같아.
        </div>
        <div className={styles.chatBubbleAi}>
          이번 주 토요일 6시 이후의 시간대에 일정을 추가하였어요.
        </div>
      </div>
      <div className={styles.chatInput} aria-hidden="true" />
    </div>
  );
}

function TeamMockup() {
  return (
    <div className={`${styles.mockup} ${styles.teamMockup}`}>
      <p className={styles.mockupLabel}>팀원</p>
      <div className={styles.teamHeader}>팀원 관리</div>
      <ul className={styles.teamList}>
        <li className={styles.teamMember}>
          <span className={`${styles.teamAvatar} ${styles.teamAvatarA}`}>
            A
          </span>
          <div className={styles.teamInfo}>
            <span className={styles.teamName}>민지</span>
            <span className={styles.teamStatus}>참여 중 · 수 14:00</span>
          </div>
        </li>
        <li className={styles.teamMember}>
          <span className={`${styles.teamAvatar} ${styles.teamAvatarB}`}>
            B
          </span>
          <div className={styles.teamInfo}>
            <span className={styles.teamName}>준호</span>
            <span className={styles.teamStatus}>참여 중 · 수 14:00</span>
          </div>
        </li>
        <li className={styles.teamMember}>
          <span className={`${styles.teamAvatar} ${styles.teamAvatarC}`}>
            C
          </span>
          <div className={styles.teamInfo}>
            <span className={styles.teamName}>수연</span>
            <span className={styles.teamStatus}>일정 확인 중</span>
          </div>
        </li>
      </ul>
    </div>
  );
}

function ScheduleEditMockup() {
  return (
    <div className={`${styles.mockup} ${styles.editMockup}`}>
      <p className={styles.mockupLabel}>일정 수정</p>
      <div className={styles.editHeader}>직접 입력</div>
      <div className={styles.editBody}>
        <div className={styles.editRow}>
          <span className={styles.editDay}>토</span>
          <div className={styles.editInputWrap}>
            <span className={styles.editInputText}>18:00</span>
            <span className={styles.editCaret} aria-hidden="true" />
            <span className={styles.mousePointer} aria-hidden="true" />
          </div>
        </div>
        <div className={styles.editRowMuted}>
          <span className={styles.editDay}>일</span>
          <span className={styles.editPlaceholder}>시간 입력</span>
        </div>
      </div>
    </div>
  );
}

function TeamSelectorMockup() {
  return (
    <div className={`${styles.mockup} ${styles.teamSelectMockup}`}>
      <p className={styles.mockupLabel}>팀</p>
      <div className={styles.teamSelectHeader}>팀 선택 · 생성</div>
      <div className={styles.teamSelectBody}>
        <div className={styles.teamSelectCurrent}>
          <span>15학번 동창 모임</span>
          <span className={styles.teamSelectChevron} aria-hidden="true">
            ▾
          </span>
        </div>
        <ul className={styles.teamSelectList}>
          <li className={styles.teamSelectItemActive}>15학번 동창 모임</li>
          <li>동아리 TF</li>
          <li>스터디 A팀</li>
        </ul>
        <button type="button" className={styles.teamCreateButton}>
          + 새 팀 만들기
        </button>
      </div>
    </div>
  );
}

export default function Finale({ isStageActive = false }) {
  const [visibleClouds, setVisibleClouds] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);

  useEffect(() => {
    if (!isStageActive) {
      setVisibleClouds([false, false, false, false, false]);
      return undefined;
    }

    setVisibleClouds([false, false, false, false, false]);
    const timers = CLOUD_DELAYS_MS.map((delay, index) =>
      setTimeout(() => {
        setVisibleClouds((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }, delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [isStageActive]);

  return (
    <section className={styles.root} aria-label="서비스 소개">
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleBlock}>
            <BrandMark className={styles.brandMarkAbove} />
            <h1 className={styles.headline}>
              모든 일정을 저와 가벼운 대화를 통해 맞추어 나가세요!
            </h1>
          </div>
          <p className={styles.subtext}>
            사용자에게 민감한 정보는 일절 수집하지 않아요.
            <br />
            간단한 회원가입을 통해 무료로 시작해보세요.
          </p>
          <Link href="/login" className={styles.ctaButton}>
            로그인/회원가입 하러 가기
          </Link>
        </div>
      </header>

      <div className={styles.cloudField}>
        <div
          className={`${styles.cloud} ${styles.cloudSchedule} ${
            visibleClouds[0]
              ? `${styles.cloudVisible} ${styles.cloudFloating}`
              : ""
          }`}
        >
          <ScheduleMockup />
        </div>

        <div
          className={`${styles.cloud} ${styles.cloudChat} ${
            visibleClouds[1]
              ? `${styles.cloudVisible} ${styles.cloudFloating}`
              : ""
          }`}
        >
          <ChatMockup />
        </div>

        <div
          className={`${styles.cloud} ${styles.cloudTeam} ${
            visibleClouds[2]
              ? `${styles.cloudVisible} ${styles.cloudFloating}`
              : ""
          }`}
        >
          <TeamMockup />
        </div>

        <div
          className={`${styles.cloud} ${styles.cloudScheduleEdit} ${
            visibleClouds[3]
              ? `${styles.cloudVisible} ${styles.cloudFloating}`
              : ""
          }`}
        >
          <ScheduleEditMockup />
        </div>

        <div
          className={`${styles.cloud} ${styles.cloudTeamSelect} ${
            visibleClouds[4]
              ? `${styles.cloudVisible} ${styles.cloudFloating}`
              : ""
          }`}
        >
          <TeamSelectorMockup />
        </div>
      </div>
    </section>
  );
}

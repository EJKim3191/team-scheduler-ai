"use client";

import { useEffect, useState } from "react";

import { generateSmartCode, validateCodeFormat } from "@/utils/teamCode";

import styles from "./Make-team.module.css";

export default function MakeTeamPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [createTeamCode, setCreateTeamCode] = useState("");
  const [inviteTeamCode, setInviteTeamCode] = useState("");
  const [
    isTeamCodeGenerateButtonDisabled,
    setIsTeamCodeGenerateButtonDisabled,
  ] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    const isValid =
      teamName.trim().length > 0 && validateCodeFormat(createTeamCode);
    setIsSubmitDisabled(!isValid);
  }, [teamName, createTeamCode]);

  const onCreateTeam = () => {
    setShowCreateForm(true);
  };

  const onBackFromCreate = () => {
    setShowCreateForm(false);
  };

  const onTeamNameChange = (e) => {
    if (e.target.value.length > 10) return;

    setTeamName(e.target.value);
  };

  const onCreateTeamCodeInput = (e) => {
    setCreateTeamCode(e.target.value);
    setIsTeamCodeGenerateButtonDisabled(false);
  };

  const onTeamCodeGenerate = () => {
    const newTeamCode = generateSmartCode();
    setCreateTeamCode(newTeamCode);
    setIsTeamCodeGenerateButtonDisabled(true);
  };

  const onInviteTeamCodeChange = (e) => {
    setInviteTeamCode(e.target.value);
  };

  const onSubmitCreateTeam = () => {
    if (isSubmitDisabled) return;
    // TODO: 팀 생성 API 연결
  };

  return (
    <main className={styles.page}>
      <div className={styles.bg} aria-hidden />

      <div className={styles.createZone}>
        {showCreateForm ? (
          <div className={styles.createForm} key="create-form">
            <div className={styles.createFormHeader}>
              <button
                type="button"
                className={styles.backButton}
                onClick={onBackFromCreate}
                aria-label="뒤로가기"
              >
                ←
              </button>
              <p className={styles.createFormTitle}>새 팀 만들기</p>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>팀 이름</span>
              <input
                className={styles.input}
                type="text"
                name="teamName"
                placeholder="팀 이름을 입력하세요"
                value={teamName}
                onChange={onTeamNameChange}
                autoComplete="organization"
              />
            </label>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>팀 코드</span>
              <div className={styles.teamCodeRow}>
                <input
                  className={styles.inputTeamCode}
                  type="text"
                  name="createTeamCode"
                  placeholder="팀 코드"
                  value={createTeamCode}
                  onChange={onCreateTeamCodeInput}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className={styles.generateButton}
                  onClick={onTeamCodeGenerate}
                  disabled={isTeamCodeGenerateButtonDisabled}
                >
                  {isTeamCodeGenerateButtonDisabled ? "완료!" : "팀 코드 생성"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className={styles.submitButton}
              onClick={onSubmitCreateTeam}
              disabled={isSubmitDisabled}
            >
              {teamName.trim().length <= 0
                ? "팀 이름을 입력해주세요"
                : isSubmitDisabled
                  ? "유효한 팀 코드를 입력해주세요"
                  : "팀 생성"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.textAction}
            key="create-cta"
            onClick={onCreateTeam}
          >
            <span className={styles.textActionLabel}>
              새로운 팀을 만들어보세요
            </span>
            <span className={styles.textActionArrow} aria-hidden>
              →
            </span>
          </button>
        )}
      </div>

      <section className={styles.joinBlock} aria-labelledby="join-team-prompt">
        <p id="join-team-prompt" className={styles.joinPrompt}>
          이미 초대 받은 팀이 있으신가요?
        </p>
        <label className={styles.inputWrap}>
          <span className={styles.srOnly}>팀 코드</span>
          <input
            className={styles.input}
            type="text"
            name="inviteTeamCode"
            placeholder="팀 코드를 입력하세요"
            value={inviteTeamCode}
            onChange={onInviteTeamCodeChange}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </section>
    </main>
  );
}

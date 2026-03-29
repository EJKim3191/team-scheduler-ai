"use client";

/**회원 가입 페이지
 *  아이디, 비밀번호, 이름, 팀 코드를 입력하고 회원 가입을 진행합니다.
 *  팀 코드는 6자리 무작위 코드를 생성합니다.
 *  팀 코드는 팀원 초대 시 사용됩니다.
 *  팀이 없을 경우 팀을 만들게 됩니다.
 * */

// TODO: ID validation 및 css처리

import styles from "./Login.module.css";
import { useState, useEffect } from "react";
import { generateSmartCode, validateCodeFormat } from "@/utils/teamCode";
import LoadingOverlay from "@/app/components/LoadingOverlay/LoadingOverlay";

function SignUpPage({ setIsSignup }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [isTeamCodeValid, setIsTeamCodeValid] = useState(false);
  const [
    isTeamCodeGenerateButtonDisabled,
    setIsTeamCodeGenerateButtonDisabled,
  ] = useState(false);
  const [isSignupButtonDisabled, setIsSignupButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsTeamCodeValid(validateCodeFormat(teamCode));
  }, [teamCode]);

  useEffect(() => {
    if (
      id.length > 0 &&
      password.length > 0 &&
      name.length > 0 &&
      teamCode.length > 0 &&
      isTeamCodeValid
    ) {
      setIsSignupButtonDisabled(false);
    } else {
      setIsSignupButtonDisabled(true);
    }
  }, [id, password, name, teamCode, isTeamCodeValid]);

  const onIdInput = (e) => {
    // TODO: id 규칙 생성
    setId(e.target.value);
  };
  const onPasswordInput = (e) => {
    // TODO: password 규칙 생성
    setPassword(e.target.value);
  };
  const onNameInput = (e) => {
    if (e.target.value.length > 10) {
      alert("이름은 10자 이하로 입력해주세요.");
      return;
    }
    setName(e.target.value);
  };
  const onTeamCodeInput = (e) => {
    setTeamCode(e.target.value);
    setIsTeamCodeGenerateButtonDisabled(false);
  };
  const onSignUp = async () => {
    const response = await fetch("/api/user/signup", {
      method: "POST",
      body: JSON.stringify({
        userId: id,
        userName: name,
        password: password,
        teamCode: teamCode,
      }),
    });
    const data = await response.json();
    if (data.success) {
      setIsLoading(true);
      setTimeout(() => {
        setIsSignup(false);
      }, 1000);
    } else {
      alert(data.message);
      setIsLoading(false);
    }
  };

  const onTeamCodeGenerate = () => {
    const newTeamCode = generateSmartCode();
    setTeamCode(newTeamCode);
    setIsTeamCodeGenerateButtonDisabled(true);
  };
  const onTeamCodeBlur = () => {
    if (!isTeamCodeValid) {
      // console.log("팀 코드 형식이 올바르지 않습니다.");
    }
  };

  return (
    <form className={styles.form}>
      <LoadingOverlay open={isLoading} label="로딩 중..." />
      <div className={styles.headerRow}>
        <h1 className={styles.title}>회원 가입</h1>
        <button
          className={styles.backIconButton}
          type="button"
          onClick={() => setIsSignup(false)}
          aria-label="뒤로가기"
          title="뒤로가기"
        >
          ←
        </button>
      </div>
      <p className={styles.subtitle}>아이디와 비밀번호, 이름을 입력해주세요.</p>

      <input
        className={styles.input}
        type="text"
        placeholder="아이디"
        autoComplete="username"
        value={id}
        onChange={onIdInput}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="비밀번호"
        autoComplete="new-password"
        value={password}
        onChange={onPasswordInput}
      />
      <input
        className={styles.input}
        type="text"
        placeholder="이름"
        autoComplete="name"
        value={name}
        onChange={onNameInput}
      />
      <br />
      <p className={styles.subtitle}>
        팀 코드는 팀원 초대 시 사용됩니다.
        <br />
        팀이 없으시면 팀 코드 생성 버튼을 눌러주세요.
      </p>
      <div className={styles.teamCodeRow}>
        <input
          className={styles.inputTeamCode}
          type="text"
          placeholder="팀 코드"
          value={teamCode}
          onBlur={onTeamCodeBlur}
          onChange={onTeamCodeInput}
        />
        <button
          className={styles.buttonTeamCode}
          type="button"
          onClick={onTeamCodeGenerate}
          disabled={isTeamCodeGenerateButtonDisabled}
        >
          {isTeamCodeGenerateButtonDisabled ? "완료!" : "팀 코드 생성"}
        </button>
      </div>

      <br />
      <button
        className={styles.button}
        type="button"
        onClick={onSignUp}
        disabled={isSignupButtonDisabled}
      >
        회원 가입
      </button>
    </form>
  );
}

export default SignUpPage;

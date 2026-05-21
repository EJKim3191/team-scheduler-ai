"use client";

/**회원 가입 페이지
 *  이메일, 비밀번호, 이름, 팀 코드를 입력하고 회원 가입을 진행합니다.
 *  팀 코드는 6자리 무작위 코드를 생성합니다.
 *  팀 코드는 팀원 초대 시 사용됩니다.
 *  팀이 없을 경우 팀을 만들게 됩니다.
 * */

import styles from "./Login.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { generateSmartCode, validateCodeFormat } from "@/utils/teamCode";
import {
  collectFieldErrors,
  pickPriorityErrorMessage,
} from "@/utils/signUpValidation";
import LoadingOverlay from "@/app/components/LoadingOverlay/LoadingOverlay";

const INITIAL_TOUCHED = {
  id: false,
  password: false,
  confirmPassword: false,
  name: false,
  teamCode: false,
};

function SignUpPage({ setIsSignup }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [touched, setTouched] = useState(INITIAL_TOUCHED);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isTeamCodeValid, setIsTeamCodeValid] = useState(false);
  const [
    isTeamCodeGenerateButtonDisabled,
    setIsTeamCodeGenerateButtonDisabled,
  ] = useState(false);
  const [isSignupButtonDisabled, setIsSignupButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const formValues = useMemo(
    () => ({ id, password, confirmPassword, name, teamCode }),
    [id, password, confirmPassword, name, teamCode],
  );

  const errorMessage = useMemo(
    () => pickPriorityErrorMessage(fieldErrors),
    [fieldErrors],
  );

  const syncFieldErrors = useCallback(
    (nextTouched) => {
      setFieldErrors(collectFieldErrors(nextTouched, formValues));
    },
    [formValues],
  );

  useEffect(() => {
    setIsTeamCodeValid(validateCodeFormat(teamCode));
  }, [teamCode]);

  useEffect(() => {
    syncFieldErrors(touched);
  }, [touched, syncFieldErrors]);

  useEffect(() => {
    if (
      id.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      name.length > 0 &&
      password === confirmPassword
    ) {
      setIsSignupButtonDisabled(false);
    } else {
      setIsSignupButtonDisabled(true);
    }
  }, [id, password, confirmPassword, name, teamCode, isTeamCodeValid]);

  const onFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const inputClassName = (field) =>
    fieldErrors[field] ? `${styles.input} ${styles.inputError}` : styles.input;

  const onIdInput = (e) => {
    setId(e.target.value);
  };
  const onPasswordInput = (e) => {
    setPassword(e.target.value);
  };
  const onPasswordConfirmInput = (e) => {
    setConfirmPassword(e.target.value);
  };
  const onNameInput = (e) => {
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
      <p className={styles.subtitle}>이메일과 비밀번호, 이름을 입력해주세요.</p>

      <input
        className={inputClassName("id")}
        type="text"
        placeholder="이메일"
        autoComplete="username"
        value={id}
        onChange={onIdInput}
        onBlur={() => onFieldBlur("id")}
        aria-invalid={Boolean(fieldErrors.id)}
      />
      <input
        className={inputClassName("password")}
        type="password"
        placeholder="비밀번호"
        autoComplete="new-password"
        value={password}
        onChange={onPasswordInput}
        onBlur={() => onFieldBlur("password")}
        aria-invalid={Boolean(fieldErrors.password)}
      />
      <input
        className={inputClassName("confirmPassword")}
        type="password"
        placeholder="비밀번호 확인"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={onPasswordConfirmInput}
        onBlur={() => onFieldBlur("confirmPassword")}
        aria-invalid={Boolean(fieldErrors.confirmPassword)}
      />
      <input
        className={inputClassName("name")}
        type="text"
        placeholder="이름"
        autoComplete="name"
        value={name}
        onChange={onNameInput}
        onBlur={() => onFieldBlur("name")}
        aria-invalid={Boolean(fieldErrors.name)}
      />
      {/* <p className={styles.subtitle}>
        팀 코드는 팀원 초대 시 사용됩니다.
        <br />
        팀이 없으시면 팀 코드 생성 버튼을 눌러주세요.
      </p>
      <div className={styles.teamCodeRow}>
        <input
          className={
            fieldErrors.teamCode
              ? `${styles.inputTeamCode} ${styles.inputError}`
              : styles.inputTeamCode
          }
          type="text"
          placeholder="팀 코드"
          value={teamCode}
          onBlur={() => onFieldBlur("teamCode")}
          onChange={onTeamCodeInput}
          aria-invalid={Boolean(fieldErrors.teamCode)}
        />
        <button
          className={styles.buttonTeamCode}
          type="button"
          onClick={onTeamCodeGenerate}
          disabled={isTeamCodeGenerateButtonDisabled}
        >
          {isTeamCodeGenerateButtonDisabled ? "완료!" : "팀 코드 생성"}
        </button>
      </div> */}

      <span className={styles.errorMessage} role="alert">
        {errorMessage}
      </span>
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

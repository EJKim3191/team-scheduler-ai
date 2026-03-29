"use client";

import styles from "./Login.module.css";
import { useState } from "react";
import SignUpPage from "./SignUp";
import { useRouter } from "next/navigation";
import useTeam from "@/app/store/team";
import useUser from "@/app/store/user";

function LoginPage() {
  const router = useRouter();
  const setTeamCode = useTeam((state) => state.setTeamCode);
  const setTeamName = useTeam((state) => state.setTeamName);
  const setUserId = useUser((state) => state.setUserId);

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  // helper로 분리
  const setCookie = (key, value) => {
    document.cookie = `${key}=${value}; path=/; max-age=3600;`;
  };

  const onIdInput = (e) => {
    setId(e.target.value);
  };
  const onPasswordInput = (e) => {
    setPassword(e.target.value);
  };
  const onLogin = async () => {
    const response = await fetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ userName: id, password: password }),
    });
    const data = await response.json();

    if (data.success) {
      // localStorage.setItem("user_id", data.id);
      setCookie("sb-access-token", data.id);
      setTeamCode(data.teamCode);
      setTeamName(data.teamName);
      setUserId(data.id);
      router.push("/");
    } else {
      alert(data.message);
    }
  };

  const onShowSignup = () => {
    setIsSignup(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.left} aria-hidden="true">
        <div className={styles.leftInner}>
          <div className={styles.leftCard}>
            <p className={styles.brand}>Team Scheduler</p>
            <p className={styles.tagline}>
              팀 일정 조율을 더 빠르고 간단하게.
              <br />
              로그인하고 AI와 함께 일정을 정리해보세요.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.right}>
        {isSignup ? (
          <SignUpPage setIsSignup={setIsSignup} />
        ) : (
          <form className={styles.form}>
            <h1 className={styles.title}>로그인</h1>
            <p className={styles.subtitle}>
              아이디과 비밀번호를 입력하고 계속 진행하세요.
            </p>

            <input
              className={styles.input}
              type="text"
              placeholder="아이디"
              autoComplete="username"
              onChange={onIdInput}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="비밀번호"
              autoComplete="current-password"
              onChange={onPasswordInput}
            />
            <button className={styles.button} type="button" onClick={onLogin}>
              Login
            </button>

            <div className={styles.hintRow}>
              <span className={styles.hintRowText} onClick={onShowSignup}>
                계정이 없나요?
              </span>
              <a className={styles.link} href="#">
                관리자에게 문의
              </a>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default LoginPage;

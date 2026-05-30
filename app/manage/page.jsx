import styles from "./Manage.module.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OverviewSection from "../components/Manage/OverviewSection";
import TeamsSection from "../components/Manage/TeamsSection";
import UsersSection from "../components/Manage/UsersSection";
import SettingsSection from "../components/Manage/SettingsSection";

const MENU_ITEMS = [
  { key: "overview", label: "대시보드" },
  { key: "teams", label: "팀 관리" },
  { key: "users", label: "사용자 관리" },
  // TODO: TBD 설정 설계 및 구현 완료 시 주석 해제
  // { key: "settings", label: "설정" },
];

function getActiveTab(tab) {
  if (typeof tab !== "string") return "overview";
  return MENU_ITEMS.some((m) => m.key === tab) ? tab : "overview";
}

function NavIcon({ name }) {
  switch (name) {
    case "overview":
      return (
        <svg
          className={styles.navIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 13.2V20h6.8v-6.8H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M13.2 4H20v6.8h-6.8V4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M13.2 13.2H20V20h-6.8v-6.8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M4 4h6.8v6.8H4V4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "teams":
      return (
        <svg
          className={styles.navIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16.5 21c0-2.1-1.9-3.8-4.5-3.8S7.5 18.9 7.5 21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 13.8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M20.5 20.8c-.3-1.6-1.4-2.8-2.9-3.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16.7 6.2a3.6 3.6 0 0 1 0 7.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg
          className={styles.navIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M16.5 21c0-2.3-1.9-4.2-4.5-4.2S7.5 18.7 7.5 21"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M20.4 20.4c-.3-1.6-1.2-2.9-2.6-3.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg
          className={styles.navIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M19.4 15.1c.1-.4.2-.7.3-1.1l1.3-1-1.7-3-1.6.3c-.6-.5-1.2-.9-1.9-1.1L14.4 6h-4l-.4 1.8c-.7.2-1.3.6-1.9 1.1L6.5 8.6l-1.7 3 1.3 1c.1.4.2.7.3 1.1-.1.4-.2.7-.3 1.1l-1.3 1 1.7 3 1.6-.3c.6.5 1.2.9 1.9 1.1L10.4 20h4l.4-1.8c.7-.2 1.3-.6 1.9-1.1l1.6.3 1.7-3-1.3-1c-.1-.4-.2-.7-.3-1.1Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Content({ tab }) {
  switch (tab) {
    case "teams":
      return <TeamsSection />;
    case "users":
      return <UsersSection />;
    case "settings":
      // TODO: TBD 설정 설계 및 구현 완료 시 주석 해제
      // return <SettingsSection />;
      return null;
    case "overview":
    default:
      return <OverviewSection />;
  }
}

export default async function ManagePage({ searchParams }) {
  const params = await searchParams;
  const activeTab = getActiveTab(params?.tab);

  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token");
  const refresh_token = cookieStore.get("sb-refresh-token");

  if (!token || !refresh_token) redirect("/login");

  // 쿠키 기반 세션 유효성 확인 (UI 보호용)
  const supabase = await createClient();
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: token.value,
    refresh_token: refresh_token.value,
  });
  if (sessionError) redirect("/login");

  const activeLabel =
    MENU_ITEMS.find((m) => m.key === activeTab)?.label ?? "대시보드";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="관리 메뉴">
            <div className={styles.sidebarInner}>
              <div>
                <div className={styles.sidebarTitleRow}>
                  <div className={styles.sidebarTitle}>Manage</div>
                  <div className={styles.sidebarPill}>Admin</div>
                </div>
                <p className={styles.sidebarSubtitle}>
                  팀과 사용자 관리를 한 곳에서.
                </p>
              </div>

              <nav className={styles.nav}>
                {MENU_ITEMS.map((item) => {
                  const isActive = item.key === activeTab;
                  return (
                    <Link
                      key={item.key}
                      href={`/manage?tab=${item.key}`}
                      className={`${styles.navItem} ${
                        isActive ? styles.navItemActive : ""
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <NavIcon name={item.key} />
                      <span className={styles.navLabel}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className={styles.sidebarFooter}>
                <div className={styles.sidebarFooterText}>
                  현재 섹션:{" "}
                  <span className={styles.sidebarFooterStrong}>
                    {activeLabel}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <section className={styles.content} aria-label="관리 상세">
            <header className={styles.contentHeader}>
              <div className={styles.contentHeaderLeft}>
                <h1 className={styles.contentTitle}>{activeLabel}</h1>
                <p className={styles.contentDescription}>
                  좌측 메뉴를 선택하면 우측의 관리 상세가 표시됩니다.
                </p>
              </div>
              <div className={styles.contentHeaderRight}>
                <div className={styles.pill}>{activeTab}</div>
              </div>
            </header>

            <div className={styles.contentBody}>
              <Content tab={activeTab} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

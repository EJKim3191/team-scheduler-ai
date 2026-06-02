"use client";

import styles from "./IssueStatus.module.css";
import { useSearchParams } from "next/navigation";
import { getCookie } from "@/utils/cookie";
import { useRouter } from "next/navigation";

function normalizeStatus(status) {
  if (!status) return "open";
  const value = String(status).toLowerCase();
  if (value === "close") return "closed";
  return value;
}

function nextStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized === "open" ? "closed" : "open";
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const isOpen = normalized === "open";
  return (
    <span
      className={`${styles.badge} ${isOpen ? styles.badgeOpen : styles.badgeClosed}`}
    >
      {isOpen ? "진행" : "완료"}
    </span>
  );
}

const ALL_OPTION = { id: null, title: "전체" };

/**
 * @param {{
 *  issues?: { id?: string|number, title?: string, status?: string },
 *  onToggle?: (next: "open" | "closed") => void | Promise<void>,
 *  disabled?: boolean,
 *  selectedIssueId?: string | number | null,
 *  loading?: boolean,
 * }} props
 */
export default function IssueStatus({
  issues,
  disabled = false,
  selectedIssueId = null,
  loading = false,
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const resolvedId =
    selectedIssueId === undefined || searchParams.get("issueId") === ""
      ? null
      : searchParams.get("issueId");

  const selectedIssue =
    resolvedId === null
      ? ALL_OPTION
      : (issues.find((issue) => String(issue.id) === String(resolvedId)) ??
        ALL_OPTION);

  const title = selectedIssue?.title ?? "전체";
  const status = selectedIssue?.status ?? "open";
  const isAll = selectedIssue?.id === null;
  const normalized = normalizeStatus(status);
  const willBe = nextStatus(normalized);

  const onToggle = async () => {
    const response = await fetch("/api/team/issues/update", {
      method: "PUT",
      body: JSON.stringify({
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
        issueId: selectedIssue.id,
        status: willBe,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      return;
    }
    router.refresh();
  };

  return (
    <div className={styles.root} aria-label="이슈 상태">
      <div className={styles.left}>
        <div className={styles.title} title={title}>
          {title}
        </div>
        {!isAll && <StatusBadge status={normalized} />}
      </div>

      {!isAll && (
        <button
          type="button"
          className={`${styles.toggleButton} ${
            normalized === "open" ? styles.toggleClose : styles.toggleReopen
          }`}
          onClick={() => onToggle?.(willBe)}
          disabled={disabled || loading || !onToggle}
        >
          {loading ? "변경 중..." : normalized === "open" ? "Close" : "Reopen"}
        </button>
      )}
    </div>
  );
}

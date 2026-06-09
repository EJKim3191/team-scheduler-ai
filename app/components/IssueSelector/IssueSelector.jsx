"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getCookie } from "@/utils/cookie";
import styles from "./IssueSelector.module.css";
import IssueCreator from "../IssueCreator/IssueCreator";

/** @typedef {{ id: string | number, title: string, status?: string, team?: { team_name?: string } }} IssueOption */

// const ALL_OPTION = { id: null, title: "전체" };

function ChevronIcon({ open }) {
  return (
    <svg
      className={`${styles.chevronIcon} ${open ? styles.chevronIconOpen : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ status }) {
  if (!status) return null;
  const isOpen = status === "open";
  return (
    <span
      className={`${styles.statusBadge} ${
        isOpen ? styles.statusOpen : styles.statusClosed
      }`}
    >
      {isOpen ? "진행" : "완료"}
    </span>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * @param {{
 *   issues?: IssueOption[],
 *   selectedIssueId?: string | number | null,
 *   handleIssueSelect?: (issueId: string | number | null) => void,
 *   label?: string,
 *   searchPlaceholder?: string,
 * }} props
 */
function IssueSelector({
  issues = [],
  selectedIssueId = null,
  handleIssueSelect,
  label = "이슈",
  searchPlaceholder = "이슈 검색…",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isIssueCreatorOpen, setIsIssueCreatorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listboxId = useId();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedId =
    selectedIssueId === undefined || searchParams.get("issueId") === ""
      ? null
      : Number(searchParams.get("issueId"));

  const selectedIssue =
    resolvedId === null
      ? issues[0]
      : (issues.find((issue) => String(issue.id) === String(resolvedId)) ??
        null);

  const displayValue = selectedIssue?.title ?? "이슈 선택";

  const filteredIssues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return issues;

    return issues.filter((issue) => {
      const title = issue.title?.toLowerCase() ?? "";
      const teamName = issue.team?.team_name?.toLowerCase() ?? "";
      return title.includes(query) || teamName.includes(query);
    });
  }, [issues, searchQuery]);

  // const showAllOption = useMemo(() => {
  //   const query = searchQuery.trim().toLowerCase();
  //   if (!query) return true;
  //   return "전체".includes(query);
  // }, [searchQuery]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      return;
    }

    const frameId = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (issueId) => {
    setIsOpen(false);
    handleIssueSelect?.(issueId);
    if (issueId === null) {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.delete("issueId");
      router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
      return;
    }

    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("issueId", issueId);
    router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
  };

  const onAddIssue = () => {
    setIsIssueCreatorOpen(true);
  };

  const onAddIssueSubmit = async (issue) => {
    const response = await fetch("/api/team/issues/create", {
      method: "POST",
      body: JSON.stringify({
        access_token: getCookie("sb-access-token"),
        refresh_token: getCookie("sb-refresh-token"),
        teamId: searchParams.get("teamId"),
        issue: issue,
      }),
    });
    const data = await response.json();
    if (data.success) {
      alert("이슈가 추가되었습니다");
      router.refresh();
    } else {
      alert(data.message);
    }
  };

  const isAllSelected = resolvedId === null;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={`${styles.control} ${isOpen ? styles.controlOpen : ""}`}>
        <div className={styles.display} aria-live="polite">
          <span className={styles.displayLabel}>{label}</span>
          <span className={styles.displayValue}>{displayValue}</span>
        </div>

        <button
          type="button"
          className={`${styles.toggleButton} ${isOpen ? styles.toggleButtonOpen : ""}`}
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={`${label} 선택`}
        >
          <ChevronIcon open={isOpen} />
        </button>
      </div>

      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            ref={searchInputRef}
            type="search"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="이슈 검색"
            autoComplete="off"
          />
        </div>

        <div
          id={listboxId}
          role="listbox"
          aria-label={`${label} 목록`}
          className={styles.listbox}
        >
          <ul
            className={`${styles.list} ${
              issues.length > 5 ? styles.listScrollable : ""
            }`}
          >
            {filteredIssues.map((issue) => {
              const isSelected =
                !isAllSelected && String(issue.id) === String(resolvedId);

              return (
                <li key={issue.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`${styles.option} ${
                      isSelected ? styles.optionSelected : ""
                    }`}
                    onClick={() => handleSelect(issue.id)}
                  >
                    <span className={styles.optionRow}>
                      <span className={styles.optionTitle}>{issue.title}</span>
                      <StatusBadge status={issue.status} />
                    </span>
                    {issue.team?.team_name && (
                      <span className={styles.optionMeta}>
                        {issue.team.team_name}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}

            {filteredIssues.length === 0 && (
              <li className={styles.emptyState} role="presentation">
                검색 결과가 없습니다.
              </li>
            )}
          </ul>

          <div className={styles.addFooter}>
            <button
              type="button"
              className={styles.addButton}
              onClick={onAddIssue}
            >
              <span className={styles.addIcon} aria-hidden="true">
                <PlusIcon />
              </span>
              이슈 추가
            </button>
          </div>
        </div>
      </div>
      <IssueCreator
        open={isIssueCreatorOpen}
        onClose={() => setIsIssueCreatorOpen(false)}
        onSubmit={onAddIssueSubmit}
      />
    </div>
  );
}

export default IssueSelector;

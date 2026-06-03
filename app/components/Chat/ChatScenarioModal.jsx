"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import styles from "./ChatScenarioModal.module.css";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 7 9 18 4 13"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * @param {{
 *  open: boolean,
 *  scenarios?: { description?: string, count?: number, data?: { start_time: string }[] }[],
 *  selectedIndex: number,
 *  onSelect: (index: number) => void,
 *  onConfirm: () => void,
 *  onClose: () => void,
 *  loading?: boolean,
 * }} props
 */
export default function ChatScenarioModal({
  open,
  scenarios = [],
  selectedIndex,
  onSelect,
  onConfirm,
  onClose,
  loading = false,
}) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-scenario-modal-title"
    >
      <button
        type="button"
        className={styles.modalBackdrop}
        aria-label="닫기"
        onClick={onClose}
      />

      <div className={styles.modalPanel}>
        <h3 id="chat-scenario-modal-title" className={styles.modalTitle}>
          일정 해석 선택
        </h3>
        <p className={styles.modalDescription}>
          AI가 여러 가지로 해석했습니다. 맞는 선택지를 고른 뒤 확정해주세요.
        </p>

        <ul className={styles.optionList}>
          {scenarios.map((scenario, index) => {
            const isSelected = index === selectedIndex;
            const label = scenario.description ?? `선택지 ${index + 1}`;

            return (
              <li key={index} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  onClick={() => onSelect(index)}
                >
                  <span className={styles.optionText}>{label}</span>
                  <span
                    className={`${styles.checkIcon} ${
                      isSelected ? styles.checkIconVisible : ""
                    }`}
                    aria-hidden="true"
                  >
                    <CheckIcon />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.modalCancelButton}
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            type="button"
            className={styles.modalConfirmButton}
            onClick={onConfirm}
            disabled={loading || scenarios.length === 0}
          >
            {loading ? "등록 중..." : "선택 확정"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

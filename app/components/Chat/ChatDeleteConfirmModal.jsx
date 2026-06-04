"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import styles from "./ChatDeleteConfirmModal.module.css";

/**
 * @param {{
 *  open: boolean,
 *  count?: number,
 *  onConfirm: () => void,
 *  onClose: () => void,
 *  loading?: boolean,
 * }} props
 */
export default function ChatDeleteConfirmModal({
  open,
  count = 0,
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
      aria-labelledby="chat-delete-modal-title"
    >
      <button
        type="button"
        className={styles.modalBackdrop}
        aria-label="삭제 취소"
        onClick={onClose}
        disabled={loading}
      />

      <div className={styles.modalPanel}>
        <h3 id="chat-delete-modal-title" className={styles.modalTitle}>
          일정 삭제
        </h3>
        <p className={styles.modalDescription}>
          선택한 일정 <strong>{count}건</strong>을 삭제할까요?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </p>
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
            disabled={loading}
          >
            {loading ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

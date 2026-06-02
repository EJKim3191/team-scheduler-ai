"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import styles from "./IssueCreator.module.css";

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * @param {{
 *  open: boolean,
 *  onClose: () => void,
 *  onSubmit?: (payload: { title: string, description: string, due_date: string | null }) => void | Promise<void>,
 *  initialValues?: { title?: string, description?: string, due_date?: string | null },
 *  submitLabel?: string,
 * }} props
 */
export default function IssueCreator({
  open,
  onClose,
  onSubmit,
  initialValues,
  submitLabel = "이슈 추가",
}) {
  const todayMin = useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const titleId = useId();
  const descriptionId = useId();
  const dueDateId = useId();

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [dueDate, setDueDate] = useState(initialValues?.due_date ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const panelRef = useRef(null);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initialValues?.title ?? "");
    setDescription(initialValues?.description ?? "");
    setDueDate(initialValues?.due_date ?? "");
  }, [open, initialValues?.title, initialValues?.description, initialValues?.due_date]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      titleInputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const canSubmit = useMemo(() => title.trim().length > 0 && !isSubmitting, [
    title,
    isSubmitting,
  ]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate ? String(dueDate) : null,
    };

    try {
      setIsSubmitting(true);
      await onSubmit?.(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="이슈 추가"
    >
      <button
        type="button"
        className={styles.modalBackdrop}
        aria-label="닫기"
        onClick={onClose}
      />

      <div className={styles.modalPanel} ref={panelRef}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h3 className={styles.title}>이슈 추가</h3>
            <p className={styles.subtitle}>
              제목, 설명, 마감일을 입력해 이슈를 생성하세요.
            </p>
          </div>
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="닫기"
          >
            <CloseIcon />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={titleId}>
              제목 <span className={styles.required}>*</span>
            </label>
            <input
              ref={titleInputRef}
              id={titleId}
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 온보딩 플로우 개선"
              maxLength={120}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={descriptionId}>
              설명
            </label>
            <textarea
              id={descriptionId}
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이슈에 대한 배경/요구사항/메모 등을 적어주세요."
              rows={5}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={dueDateId}>
              마감일
            </label>
            <input
              id={dueDateId}
              type="date"
              className={styles.input}
              value={dueDate ?? ""}
              onChange={(e) => setDueDate(e.target.value)}
              min={todayMin}
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              {isSubmitting ? "추가 중..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}


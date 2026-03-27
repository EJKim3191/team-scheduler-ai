"use client";

import React, { useEffect } from "react";
import styles from "./LoadingOverlay.module.css";

export default function LoadingOverlay({
  open,
  label = "로딩 중...",
  dimOpacity = 0.55,
  blurPx = 1,
  lockScroll = true,
}) {
  useEffect(() => {
    if (!lockScroll) return;
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, lockScroll]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div
        className={styles.backdrop}
        style={{
          opacity: dimOpacity,
          backdropFilter: blurPx ? `blur(${blurPx}px)` : undefined,
        }}
      />

      <div className={styles.panel}>
        <div className={styles.spinner} aria-hidden="true" />
        {label ? <div className={styles.label}>{label}</div> : null}
      </div>
    </div>
  );
}


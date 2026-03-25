"use client";

import React from "react";
import styles from "./GradientBar.module.css";

/**
 * Availability gradient bar (static scale).
 * - 0~50%: no color
 * - 50~80%: light yellow
 * - 100%: light orange -> light green
 */
export default function GradientBar({ className = "" }) {
  return (
    <div className={`${styles.root} ${className}`.trim()}>
      <div className={styles.labels} aria-hidden="true">
        <span className={styles.label} style={{ left: "50%" }}>
          50%
        </span>
        <span className={styles.label} style={{ left: "80%" }}>
          80%
        </span>
        <span
          className={`${styles.label} ${styles.labelRight}`}
          style={{ left: "100%" }}
        >
          100%
        </span>
      </div>

      <div
        className={styles.bar}
        role="img"
        aria-label="availability gradient bar"
      />
    </div>
  );
}
